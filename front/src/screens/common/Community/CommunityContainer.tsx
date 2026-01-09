import { useState, useMemo, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation.ts';
import CommunityView, { SortByKey } from '@/screens/common/Community/CommunityView.tsx';
import { CreateCommunityPostParams, COMMUNITY_CATEGORY_ENUM, COMMUNITY_CATEGORIES } from '@/api/community.ts';
import { useModalStore } from '@/store/modalStore.ts';
import {
  useCreateCommunityPostMutation,
  useToggleLikeMutation,
} from '@/mutations/community.ts';
import { useCommunityPostsQuery } from '@/queries/community.ts';
import { Alert } from '@/components/theme';

export default function CommunityContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const { openCommunityPostModal, closeCommunityPostModal, setCommunityPostModalLoading } = useModalStore();

  const [selectedCategory, setSelectedCategory] = useState<COMMUNITY_CATEGORY_ENUM>('DAILY');
  const [sortBy, setSortBy] = useState<SortByKey>('LATEST');
  const [searchKey, setSearchKey] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const pageSize = 20;

  const listParams = useMemo(
    () => ({
      size: pageSize,
      sort: [sortBy === 'LATEST' ? 'createdAt,desc' : 'likeCount,desc'],
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
    isLoading,
    isError,
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
        post.content.toLowerCase().includes(query) ||
        post.categoryLabel.toLowerCase().includes(query) ||
        post.author.nickname.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allPosts, selectedCategory, searchQuery]);

  const totalCount = posts.length;

  const handlePressPost = (postId: number) => {
    navigation.navigate('CommunityDetails', { postId });
  };

  const handlePressTab = (category: COMMUNITY_CATEGORY_ENUM) => {
    setSelectedCategory(category);
  };

  const handleChangeSortBy = (key: SortByKey) => {
    setSortBy(key);
  };

  const handleSubmitSearch = () => {
    setSearchQuery(searchKey);
  };

  const handlePressLike = (postId: number) => {
    toggleLikeMutation.mutate(postId);
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleCreatePost = (params: CreateCommunityPostParams) => {
    createPostMutation(params, {
      onSuccess: () => {
        Alert.show({
          title: '완료',
          message: '게시글이 등록되었습니다.',
          buttons: [
            {
              text: '확인',
              onPress: () => {
                closeCommunityPostModal();
              },
            },
          ],
        });
      },
      onError: (error: Error) => {
        console.error('Failed to create post:', error);
        Alert.show({
          title: '오류',
          message: '게시글 등록에 실패했습니다.',
          buttons: [{ text: '확인', onPress: () => {} }],
        });
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
      onChangeSortBy={handleChangeSortBy}
      onPressPost={handlePressPost}
      onPressLike={handlePressLike}
      onPressWritePost={handleOpenModal}
      onLoadMore={hasNextPage ? fetchNextPage : undefined}
      isLoadingMore={isFetchingNextPage}
      onRefresh={handleRefresh}
      isRefreshing={isRefetching}
      isLoading={isLoading}
      isError={isError}
    />
  );
}