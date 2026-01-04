import { useMemo } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import ReviewsView from '@/screens/common/Reviews/ReviewsView.tsx';
import { usePhotographerReviewsInfiniteQuery, usePhotographerReviewSummaryQuery } from '@/queries/photographers.ts';
import { PhotographerReviewItem } from '@/api/photographers.ts';

type ReviewsRouteProp = RouteProp<MainStackParamList, 'Reviews'>;

export default function ReviewsContainer() {
  const route = useRoute<ReviewsRouteProp>();
  const navigation = useNavigation<MainNavigationProp>();
  const { photographerId } = route.params;

  // Fetch reviews with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
    isLoading,
  } = usePhotographerReviewsInfiniteQuery(
    photographerId,
    { size: 20 },
  );

  // Fetch review summary for average rating
  const { data: reviewSummary } = usePhotographerReviewSummaryQuery(photographerId);

  // Flatten reviews from all pages
  const reviews = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => page.content).map((r) => r);
  }, [data]);

  const totalCount = data?.pages[0]?.totalElements || 0;

  const handlePressBack = () => navigation.goBack();

  const handlePressReview = (review: PhotographerReviewItem) => {
    navigation.navigate('ReviewDetails', { review });
  };

  const handlePressAllPhotos = () => {
    navigation.navigate('ReviewPhotos', { photographerId });
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
    <ReviewsView
      reviews={reviews}
      reviewSummary={reviewSummary}
      totalCount={totalCount}
      averageRating={reviewSummary?.averageRating || 0}
      onPressBack={handlePressBack}
      onPressReview={handlePressReview}
      onPressAllPhotos={handlePressAllPhotos}
      onLoadMore={handleLoadMore}
      onRefresh={handleRefresh}
      isFetchingNextPage={isFetchingNextPage}
      isRefreshing={isRefetching}
      isLoading={isLoading}
      navigation={navigation}
    />
  );
}
