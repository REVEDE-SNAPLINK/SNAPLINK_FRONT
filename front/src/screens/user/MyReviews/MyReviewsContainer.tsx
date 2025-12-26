import { useNavigation } from '@react-navigation/native';
import MyReviewsView from '@/screens/user/MyReviews/MyReviewsView';
import { useDeleteReviewMutation } from '@/mutations/reviews';
import { Alert } from '@/components/theme';
import { useMyReviewsInfiniteQuery } from '@/queries/reviews.ts';
import type { GetMyReviewsResponse } from '@/api/me';
import { MainNavigationProp } from '@/types/navigation.ts';

export default function MyReviewsContainer() {
  const navigation = useNavigation<MainNavigationProp>();

  // Fetch my reviews
  const { data, isLoading, error } = useMyReviewsInfiniteQuery({ size: 10 });
  const deleteReviewMutation = useDeleteReviewMutation();

  const handlePressBack = () => navigation.goBack();

  const handlePressReview = (reviewId: string) => {
    navigation.navigate('ReviewDetails', { reviewId: Number(reviewId) });
  };

  const handlePressAllPhotos = () => {
    // TODO: Navigate to MyReviewPhotos screen
    Alert.show({
      title: '준비중',
      message: '내 리뷰 사진 전체보기 기능을 준비중입니다.',
    });
  };

  const handlePressEdit = (_reviewId: string) => {
    // TODO: Pass reservationId to WriteReview screen for editing
    // For now, just show alert
    Alert.show({
      title: '리뷰 수정',
      message: '리뷰 수정 기능을 준비중입니다.',
    });
    // navigation.navigate('WriteReview', { id: reservationId, reviewId: Number(reviewId) });
  };

  const handlePressDelete = (reviewId: string) => {
    Alert.show({
      title: '리뷰 삭제',
      message: '정말로 이 리뷰를 삭제하시겠습니까?',
      buttons: [
        {
          text: '취소',
          onPress: () => {},
        },
        {
          text: '삭제',
          type: 'destructive',
          onPress: () => {
            deleteReviewMutation.mutate(Number(reviewId), {
              onSuccess: () => {
                Alert.show({
                  title: '삭제 완료',
                  message: '리뷰가 삭제되었습니다.',
                });
              },
              onError: () => {
                Alert.show({
                  title: '삭제 실패',
                  message: '리뷰 삭제에 실패했습니다.',
                });
              },
            });
          },
        },
      ],
    });
  };

  // Transform API data to view model (InfiniteQuery 구조: pages 배열)
  const pages = (data?.pages || []) as GetMyReviewsResponse[];
  const allReviews = pages.flatMap((page) => page.content);
  const totalCount = pages[0]?.totalElements || 0;

  const reviews = allReviews.map((review) => ({
    id: String(review.id),
    photographerId: String(review.photographerId),
    photographerNickname: review.photographerNickname,
    photographerProfileImage: review.photographerProfileImage,
    rating: review.rating,
    title: review.shootingTag, // API에 title이 없으면 shootingTag 사용
    content: review.content,
    bookingType: review.shootingTag,
    images: review.imageUrls,
    createdAt: review.createdAt,
  }));

  // 로딩 상태
  if (isLoading) {
    return (
      <MyReviewsView
        reviews={[]}
        totalCount={0}
        onPressBack={handlePressBack}
        onPressReview={handlePressReview}
        onPressAllPhotos={handlePressAllPhotos}
        onPressEdit={handlePressEdit}
        onPressDelete={handlePressDelete}
      />
    );
  }

  // 에러 상태
  if (error) {
    console.error('Failed to load reviews:', error);
  }

  return (
    <MyReviewsView
      reviews={reviews}
      totalCount={totalCount}
      onPressBack={handlePressBack}
      onPressReview={handlePressReview}
      onPressAllPhotos={handlePressAllPhotos}
      onPressEdit={handlePressEdit}
      onPressDelete={handlePressDelete}
    />
  );
}
