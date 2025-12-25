import { useMemo } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import ReviewsView from '@/screens/common/Reviews/ReviewsView.tsx';
import { usePhotographerReviewsInfiniteQuery, usePhotographerReviewSummaryQuery } from '@/queries/photographers.ts';

type ReviewsRouteProp = RouteProp<MainStackParamList, 'Reviews'>;

export default function ReviewsContainer() {
  const route = useRoute<ReviewsRouteProp>();
  const navigation = useNavigation<MainNavigationProp>();
  const { photographerId } = route.params;

  // Fetch reviews with infinite scroll
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = usePhotographerReviewsInfiniteQuery(
    photographerId,
    { size: 20 },
  );

  // Fetch review summary for average rating
  const { data: reviewSummary } = usePhotographerReviewSummaryQuery(photographerId);

  // Flatten reviews from all pages
  const reviews = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => page.content).map((r) => ({
      id: String(r.reviewId),
      authorNickname: r.writerNickname,
      authorProfileImage: r.writerProfileKey,
      rating: r.rating,
      title: r.shootingTag,
      content: r.content,
      bookingType: r.shootingTag,
      images: r.photoKeys,
      createdAt: r.createdAt,
      reply: r.reply,
    }));
  }, [data]);

  const totalCount = data?.pages[0]?.totalElements || 0;

  const handlePressBack = () => navigation.goBack();

  const handlePressReview = (reviewId: string) => {
    navigation.navigate('ReviewDetails', { reviewId });
  };

  const handlePressAllPhotos = () => {
    navigation.navigate('ReviewPhotos', { photographerId });
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <ReviewsView
      reviews={reviews}
      totalCount={totalCount}
      averageRating={reviewSummary?.averageRating || 0}
      onPressBack={handlePressBack}
      onPressReview={handlePressReview}
      onPressAllPhotos={handlePressAllPhotos}
      onLoadMore={handleLoadMore}
      isFetchingNextPage={isFetchingNextPage}
    />
  );
}
