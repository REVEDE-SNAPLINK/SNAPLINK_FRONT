import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { reviewsQueryKeys } from '@/queries/keys';
import { GetPageable } from '@/api/community.ts';

import { getMyReviews, getBookingReviewMe } from '@/api/reviews.ts';

// queries/reviews.ts
export const useMyReviewsInfiniteQuery = (
  pageableWithoutPage: Omit<GetPageable, 'page'> = {},
) =>
  useInfiniteQuery({
    queryKey: reviewsQueryKeys.myReviewsInfinite(pageableWithoutPage),
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getMyReviews({ ...pageableWithoutPage, page: pageParam }),
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.number + 1),
    staleTime: 1000 * 30,
  });

export const useBookingReviewMeQuery = (bookingId?: number) =>
  useQuery({
    queryKey: typeof bookingId === 'number'
      ? reviewsQueryKeys.bookingReviewMe(bookingId)
      : [],
    queryFn: () => getBookingReviewMe(bookingId!),
    enabled: typeof bookingId === 'number',
    retry: false,
    staleTime: 1000 * 60 * 5, // 5분간 fresh 상태 유지
    gcTime: 1000 * 60 * 10, // 10분간 캐시 유지
  });