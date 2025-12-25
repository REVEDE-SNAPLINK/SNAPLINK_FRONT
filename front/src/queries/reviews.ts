import { useQuery } from '@tanstack/react-query';
import { reviewsQueryKeys } from '@/queries/keys';
import { getMyReviews } from '@/api/reviews';

/**
 * 내가 작성한 리뷰 목록 조회 (고객 전용)
 */
export const useMyReviewsQuery = () => {
  return useQuery({
    queryKey: reviewsQueryKeys.myReviews(),
    queryFn: () => getMyReviews(),
  });
};
