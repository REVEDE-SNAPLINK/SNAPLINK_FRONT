import { useState, useMemo, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation.ts';
import CommunityView from '@/screens/common/Community/CommunityView.tsx';
import { CreateCommunityPostParams, COMMUNITY_CATEGORY_ENUM, COMMUNITY_CATEGORIES } from '@/api/community.ts';
import { useModalStore } from '@/store/modalStore.ts';
import {
  useCreateCommunityPostMutation,
  useToggleLikeMutation,
} from '@/mutations/community.ts';
import { useCommunityPostsQuery } from '@/queries/community.ts';

export default function CommunityContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const { openCommunityPostModal, closeCommunityPostModal, setCommunityPostModalLoading } = useModalStore();

  const [selectedCategory, setSelectedCategory] = useState<COMMUNITY_CATEGORY_ENUM>('DAILY');
  const [sortBy, setSortBy] = useState<'recommended' | 'latest'>('recommended');
  const [searchKey, setSearchKey] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const pageSize = 20;

  const listParams = useMemo(
    () => ({
      size: pageSize,
      sort: [sortBy === 'latest' ? 'createdAt,desc' : 'likeCount,desc'],
    }),
    [sortBy]
  );

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useCommunityPostsQuery(listParams);

  const { mutate: createPostMutation, isPending: isCreatePostPending } = useCreateCommunityPostMutation();
  const toggleLikeMutation = useToggleLikeMutation();

  // InfiniteQuery 데이터를 일반 배열로 변환
  const allPosts = useMemo(() => {
    const posts = infiniteData?.pages ? infiniteData.pages.flatMap((page) => page.content) : [];
    return posts;
  }, [infiniteData]);

  // 클라이언트 사이드 필터링: 카테고리 + 검색어
  const posts = useMemo(() => {
    let filtered = allPosts;

    // 카테고리 필터
    if (selectedCategory) {
      const targetLabel = COMMUNITY_CATEGORIES[selectedCategory];
      filtered = filtered.filter(post => post.categoryLabel === targetLabel);
    }

    // 검색어 필터 (title, content, categoryLabel, author.nickname)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.categoryLabel.toLowerCase().includes(query) ||
        post.author.nickname.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allPosts, selectedCategory, searchQuery]);

  const totalCount = posts.length;

  const handlePressPost = (postId: string) => {
    navigation.navigate('CommunityDetails', { postId });
  };

  const handlePressTab = (category: COMMUNITY_CATEGORY_ENUM) => {
    setSelectedCategory(category);
  };

  const handleToggleSort = () => {
    setSortBy((prev) => (prev === 'recommended' ? 'latest' : 'recommended'));
  };

  const handleSubmitSearch = () => {
    setSearchQuery(searchKey);
  };

  const handlePressLike = (postId: string) => {
    toggleLikeMutation.mutate(postId);
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleCreatePost = (params: CreateCommunityPostParams) => {
    createPostMutation(params, {
      onSuccess: () => {
        closeCommunityPostModal();
      },
    });
  };

  const handleOpenModal = () => {
    openCommunityPostModal(handleCreatePost);
  };

  useEffect(() => {
    setCommunityPostModalLoading(isCreatePostPending);
  }, [isCreatePostPending, setCommunityPostModalLoading]);

  return (
    <CommunityView
      posts={posts}
      totalCount={totalCount}
      selectedCategory={selectedCategory}
      sortBy={sortBy}
      searchKey={searchKey}
      onChangeSearchKey={setSearchKey}
      onSubmitSearch={handleSubmitSearch}
      onPressTab={handlePressTab}
      onToggleSort={handleToggleSort}
      onPressPost={handlePressPost}
      onPressLike={handlePressLike}
      onPressWritePost={handleOpenModal}
      onLoadMore={hasNextPage ? fetchNextPage : undefined}
      isLoadingMore={isFetchingNextPage}
      onRefresh={handleRefresh}
      isRefreshing={isRefetching}
    />
  );
}