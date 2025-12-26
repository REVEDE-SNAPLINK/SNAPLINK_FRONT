import { useInfiniteQuery } from '@tanstack/react-query';
import { reviewsQueryKeys } from '@/queries/keys';
import { GetPageable } from '@/api/community.ts';
import { getMyReviews } from '@/api/me.ts';
import { getMockReviewsPage } from '@/__dev__/mockReviews';

/**
 * 개발 모드 감지
 * - __DEV__: React Native의 개발 모드 플래그
 * - 서버 에러 시에도 더미 데이터 사용 가능
 */
const USE_MOCK_DATA = __DEV__;

// queries/reviews.ts
export const useMyReviewsInfiniteQuery = (
  pageableWithoutPage: Omit<GetPageable, 'page'> = {},
) =>
  useInfiniteQuery({
    queryKey: reviewsQueryKeys.myReviewsInfinite(pageableWithoutPage),
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      if (USE_MOCK_DATA) {
        // 개발 모드: 더미 데이터 반환
        console.log('🎭 [DEV MODE] Using mock reviews data');
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(getMockReviewsPage(pageParam, pageableWithoutPage.size || 10));
          }, 500); // 네트워크 지연 시뮬레이션
        });
      }

      // 프로덕션: 실제 API 호출
      try {
        return await getMyReviews({ ...pageableWithoutPage, page: pageParam });
      } catch (error) {
        console.warn('⚠️ API call failed, falling back to mock data:', error);
        // API 실패 시 더미 데이터로 폴백
        return getMockReviewsPage(pageParam, pageableWithoutPage.size || 10);
      }
    },
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.number + 1),
    staleTime: 1000 * 30,
  });