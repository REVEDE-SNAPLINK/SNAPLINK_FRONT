import { useNavigation } from '@react-navigation/native';
import MyReviewsView from '@/screens/user/MyReviews/MyReviewsView';
import { useDeleteReviewMutation } from '@/mutations/reviews';
import { Alert } from '@/components/theme';
import { useMyReviewsInfiniteQuery } from '@/queries/reviews.ts';
import { MainNavigationProp } from '@/types/navigation.ts';
import { GetMyReviewsResponse, MyReviewItem } from '@/api/reviews.ts';
import analytics from '@react-native-firebase/analytics';
import { useAuthStore } from '@/store/authStore.ts';
import { useEffect } from 'react';

export default function MyReviewsContainer() {
  const navigation = useNavigation<MainNavigationProp>();

  // Fetch my reviews
  const { data, isLoading, error } = useMyReviewsInfiniteQuery({ size: 10 });
  const deleteReviewMutation = useDeleteReviewMutation();
  const { userId, userType } = useAuthStore();

  useEffect(() => {
    analytics().logEvent('screen_view', {
      screen_name: 'MyReviews',
      user_id: userId || 'anonymous',
      user_type: userType || 'guest',
    });
  }, [userId, userType]);

  const handlePressBack = () => navigation.goBack();

  const handlePressReview = (review: MyReviewItem) => {
    analytics().logEvent('review_view', { review_id: review.reviewId, user_id: userId });
    navigation.navigate('ReviewDetails', { review });
  };

  const handlePressEdit = (review: MyReviewItem) => {
    analytics().logEvent('review_edit_start', { review_id: review.reviewId, user_id: userId });
    navigation.navigate('WriteReview', { review });
  };

  const handlePressDelete = (reviewId: number) => {
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
            deleteReviewMutation.mutate(reviewId, {
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

  // 로딩 상태
  if (isLoading) {
    return (
      <MyReviewsView
        reviews={[]}
        totalCount={0}
        onPressBack={handlePressBack}
        onPressReview={handlePressReview}
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
      reviews={allReviews}
      totalCount={totalCount}
      onPressBack={handlePressBack}
      onPressReview={handlePressReview}
      onPressEdit={handlePressEdit}
      onPressDelete={handlePressDelete}
      navigation={navigation}
    />
  );
}
