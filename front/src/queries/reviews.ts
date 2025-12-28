import { useInfiniteQuery } from '@tanstack/react-query';
import { reviewsQueryKeys } from '@/queries/keys';
import { GetPageable } from '@/api/community.ts';
import { getMyReviews } from '@/api/me.ts';

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