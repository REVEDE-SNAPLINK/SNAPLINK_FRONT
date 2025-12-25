import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import ReviewDetailsView from '@/screens/common/ReviewDetails/ReviewDetailsView.tsx';

type ReviewDetailsRouteProp = RouteProp<MainStackParamList, 'ReviewDetails'>;

export default function ReviewDetailsContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<ReviewDetailsRouteProp>();

  const { reviewId } = route.params;

  // TODO: 백엔드 API 추가 필요
  // GET /api/reviews/{reviewId} 엔드포인트가 없습니다
  // 현재는 작가별 리뷰 목록(GET /api/photographers/{photographerId}/reviews)에서만 조회 가능
  //
  // 필요한 API:
  // - GET /api/reviews/{reviewId} - 특정 리뷰 상세 조회
  //
  // 구현 예시:
  // const { data: review } = useQuery({
  //   queryKey: reviewsQueryKeys.review(Number(reviewId)),
  //   queryFn: () => getReviewDetail(Number(reviewId)),
  // });

  const handlePressBack = () => navigation.goBack();

  // Temporary: Show placeholder or navigate back
  console.warn('ReviewDetails API not available. reviewId:', reviewId);

  return (
    <ReviewDetailsView
      review={null} // API 없어서 null 전달
      onPressBack={handlePressBack}
    />
  );
}
