import { useNavigation } from '@react-navigation/native';
import BookmarksView from './BookmarksView';
import { useMemo } from 'react';
import { MainNavigationProp } from '@/types/navigation.ts';
import { useMyScrappedPhotographersInfiniteQuery } from '@/queries/photographers.ts';
import { PhotographerSearchItem } from '@/api/photographers.ts';

const PAGE_SIZE = 20;

export default function BookmarksContainer() {
  const navigation = useNavigation<MainNavigationProp>();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useMyScrappedPhotographersInfiniteQuery({ size: PAGE_SIZE });

  // Flatten paginated data
  const photographers = useMemo<PhotographerSearchItem[]>(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => page.content);
  }, [data]);

  const totalCount = data?.pages[0]?.totalElements ?? 0;

  const handlePressPhotographer = (photographerId: string) => {
    navigation.navigate('PhotographerDetails', { photographerId });
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleRefresh = () => {
    refetch();
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
    />
  );
}