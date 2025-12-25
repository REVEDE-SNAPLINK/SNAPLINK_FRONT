import { useState, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation.ts';
import CommunityView from '@/screens/common/Community/CommunityView.tsx';
import { CreateCommunityPostParams, COMMUNITY_CATEGORY_ENUM } from '@/api/community.ts';
import { useModalStore } from '@/store/modalStore.ts';
import {
  useCreateCommunityPostMutation,
  useToggleLikeMutation,
} from '@/mutations/community.ts';
import { useCommunityPostsQuery } from '@/queries/community.ts';

export default function CommunityContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const { openCommunityPostModal, closeCommunityPostModal } = useModalStore();

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
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCommunityPostsQuery(listParams);

  const createPostMutation = useCreateCommunityPostMutation();
  const toggleLikeMutation = useToggleLikeMutation();

  // InfiniteQuery 데이터를 일반 배열로 변환
  const posts = useMemo(() => {
    if (!infiniteData?.pages) return [];
    return infiniteData.pages.flatMap((page) => page.content);
  }, [infiniteData]);

  const totalCount = infiniteData?.pages[0]?.totalElements || 0;

  const handlePressPost = (postId: string) => {
    navigation.navigate('CommunityDetails', { postId });
  };

  const handlePressNotification = () => {
    navigation.navigate('Notification');
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

  const handleCreatePost = (params: CreateCommunityPostParams) => {
    createPostMutation.mutate(params, {
      onSuccess: () => {
        closeCommunityPostModal();
      },
    });
  };

  const handleOpenModal = () => {
    openCommunityPostModal(handleCreatePost);
  };

  return (
    <CommunityView
      posts={posts}
      totalCount={totalCount}
      selectedCategory={selectedCategory}
      sortBy={sortBy}
      searchKey={searchKey}
      isLoading={isLoading}
      onChangeSearchKey={setSearchKey}
      onSubmitSearch={handleSubmitSearch}
      onPressNotification={handlePressNotification}
      onPressTab={handlePressTab}
      onToggleSort={handleToggleSort}
      onPressPost={handlePressPost}
      onPressLike={handlePressLike}
      onPressWritePost={handleOpenModal}
      onLoadMore={hasNextPage ? fetchNextPage : undefined}
      isLoadingMore={isFetchingNextPage}
    />
  );
}