import { useNavigation } from '@react-navigation/native';
import { UserMainNavigationProp } from '@/types/userNavigation';
import MyReviewsView from '@/screens/user/MyReviews/MyReviewsView';
import { useMyReviewsQuery } from '@/queries/reviews';
import { useDeleteReviewMutation } from '@/mutations/reviews';
import { Alert } from '@/components/theme';

export default function MyReviewsContainer() {
  const navigation = useNavigation<UserMainNavigationProp>();

  // Fetch my reviews
  const { data } = useMyReviewsQuery();
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

  const handlePressEdit = (reviewId: string) => {
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

  // Transform API data to view model
  const reviews =
    data?.reviews.map((review) => ({
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
    })) || [];

  return (
    <MyReviewsView
      reviews={reviews}
      totalCount={data?.totalCount || 0}
      onPressBack={handlePressBack}
      onPressReview={handlePressReview}
      onPressAllPhotos={handlePressAllPhotos}
      onPressEdit={handlePressEdit}
      onPressDelete={handlePressDelete}
    />
  );
}
