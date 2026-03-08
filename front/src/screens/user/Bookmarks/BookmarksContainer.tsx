import { useNavigation } from '@react-navigation/native';
import BookmarksView from './BookmarksView';
import { useMemo } from 'react';
import { MainNavigationProp } from '@/types/navigation.ts';
import { useMyScrappedPhotographersInfiniteQuery } from '@/queries/photographers.ts';
import { PhotographerSearchItem } from '@/api/photographers.ts';
import { useTogglePhotographerScrapMutation } from '@/mutations/photographer.ts';
import { safeLogEvent } from '@/utils/analytics.ts';
import { useAuthStore } from '@/store/authStore.ts';

const PAGE_SIZE = 20;

export default function BookmarksContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const { userId } = useAuthStore();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useMyScrappedPhotographersInfiniteQuery({ size: PAGE_SIZE });

  const toggleScrapMutation = useTogglePhotographerScrapMutation();

  // Flatten paginated data
  const photographers = useMemo<PhotographerSearchItem[]>(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => page.content);
  }, [data]);

  const totalCount = data?.pages[0]?.totalElements ?? 0;

  const handlePressPhotographer = (photographerId: string) => {
    safeLogEvent('photographer_view', { photographer_id: photographerId });
    navigation.navigate('PhotographerDetails', { photographerId, source: 'bookmarks' });
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleToggleBookmark = (photographerId: string) => {
    safeLogEvent('bookmark_toggle', { photographer_id: photographerId });
    toggleScrapMutation.mutate(photographerId);
  };

  return (
    <BookmarksView
      photographers={photographers}
      totalCount={totalCount}
      onPressPhotographer={handlePressPhotographer}
      onLoadMore={handleLoadMore}
      onRefresh={handleRefresh}
      isRefreshing={isRefetching}
      isFetchingNextPage={isFetchingNextPage}
      onToggleBookmark={handleToggleBookmark}
    />
  );
}