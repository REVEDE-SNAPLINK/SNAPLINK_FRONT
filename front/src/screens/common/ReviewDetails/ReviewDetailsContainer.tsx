import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import ReviewDetailsView from '@/screens/common/ReviewDetails/ReviewDetailsView.tsx';
import { useDeleteReviewMutation } from '@/mutations/reviews.ts';
import { Alert } from '@/components/theme';
import { MyReviewItem } from '@/api/reviews.ts';
import { showErrorAlert } from '@/utils/error';
import { useBookingReviewMeQuery } from '@/queries/reviews.ts';
import Loading from '@/components/Loading.tsx';

type ReviewDetailsRouteProp = RouteProp<MainStackParamList, 'ReviewDetails'>;

export default function ReviewDetailsContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<ReviewDetailsRouteProp>();

  const { review: reviewFromParams, bookingId } = route.params;

  // bookingId가 있으면 쿼리로 데이터를 가져옴 (수정 후 자동 업데이트를 위해)
  const { data: bookingReview, isLoading } = useBookingReviewMeQuery(bookingId);

  // bookingId가 있고 쿼리로 가져온 데이터가 있으면 사용, 아니면 params에서 전달된 데이터 사용
  const review = bookingId && bookingReview ? bookingReview : reviewFromParams;

  const isMyReview = review ? ('photos' in review || (bookingId !== undefined)) : false;
  const photographerId = review && !isMyReview && 'photographerId' in review ? String((review as any).photographerId) : undefined;

  const deleteReviewMutation = useDeleteReviewMutation(photographerId);

  // 리뷰 데이터가 없으면 로딩 또는 에러 처리
  if (!review) {
    if (isLoading) {
      return <Loading size="large" variant="fullscreen" />;
    }
    navigation.goBack();
    return null;
  }

  const handlePressBack = () => navigation.goBack();

  const handlePressEdit = () => {
    if (isMyReview) {
      // 쿼리로 가져온 리뷰 (GetBookingReviewMeResponse)인 경우 MyReviewItem 형태로 변환
      if ('photoKeys' in review && bookingId) {
        const convertedReview: MyReviewItem = {
          reviewId: review.reviewId,
          photographerNickname: 'writerNickname' in review ? review.writerNickname : '',
          photographerProfileImage: 'writerProfileKey' in review ? review.writerProfileKey : '',
          rating: review.rating,
          content: review.content,
          shootingTag: review.shootingTag,
          photos: review.photoKeys.map((url, index) => ({ photoId: -(index + 1), url })), // 임시 photoId 사용
          createdAt: review.createdAt,
        };
        navigation.navigate('WriteReview', { review: convertedReview, bookingId });
      } else {
        navigation.navigate('WriteReview', { review: review as MyReviewItem });
      }
    }
  };

  const handlePressDelete = () => {
    if (!isMyReview) return;

    Alert.show({
      title: '리뷰 삭제',
      message: '정말로 이 리뷰를 삭제하시겠습니까?',
      buttons: [
        { text: '취소', type: 'cancel', onPress: () => { } },
        {
          text: '삭제',
          type: 'destructive',
          onPress: () => {
            deleteReviewMutation.mutate(review.reviewId, {
              onSuccess: () => {
                Alert.show({
                  title: '리뷰 삭제 완료',
                  message: '리뷰가 성공적으로 삭제되었습니다.',
                  buttons: [
                    { text: '확인', onPress: () => navigation.goBack() },
                  ],
                });
              },
              onError: (error: Error) => {
                showErrorAlert({
                  title: '리뷰 삭제 실패',
                  action: '리뷰 삭제',
                  error,
                });
              },
            });
          },
        },
      ],
    });
  };

  return (
    <ReviewDetailsView
      review={review}
      nickname={'writerNickname' in review ? review.writerNickname : 'photographerNickname' in review ? review.photographerNickname : ''}
      profileImage={'writerProfileKey' in review ? review.writerProfileKey : 'photographerProfileImage' in review ? review.photographerProfileImage : ''}
      photos={'photoKeys' in review ? review.photoKeys : 'photos' in review ? review.photos.map((v) => v.url) : []}
      isEditable={isMyReview}
      onPressEdit={handlePressEdit}
      onPressDelete={handlePressDelete}
      onPressBack={handlePressBack}
      navigation={navigation}
    />
  );
}
