import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import ReviewDetailsView from '@/screens/common/ReviewDetails/ReviewDetailsView.tsx';
import { useDeleteReviewMutation } from '@/mutations/reviews.ts';
import { Alert } from '@/components/theme';
import { MyReviewItem } from '@/api/reviews.ts';

type ReviewDetailsRouteProp = RouteProp<MainStackParamList, 'ReviewDetails'>;

export default function ReviewDetailsContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<ReviewDetailsRouteProp>();

  const { review } = route.params;

  const isMyReview = 'photos' in review;
  const photographerId = isMyReview ? undefined : 'photographerId' in review ? String(review.photographerId) : undefined;

  const deleteReviewMutation = useDeleteReviewMutation(photographerId);

  const handlePressBack = () => navigation.goBack();

  const handlePressEdit = () => {
    if (isMyReview) {
      navigation.navigate('WriteReview', { review: review as MyReviewItem });
    }
  };

  const handlePressDelete = () => {
    if (!isMyReview) return;

    Alert.show({
      title: '리뷰 삭제',
      message: '정말로 이 리뷰를 삭제하시겠습니까?',
      buttons: [
        { text: '취소', type: 'cancel', onPress: () => {} },
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
                Alert.show({
                  title: '리뷰 삭제 실패',
                  message: error.message,
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
