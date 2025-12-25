import {
  GetPageable,
  getPhotographerProfile, getPhotographerReviews,
  getPhotographerReviewSummary,
  SearchPhotographersBody,
  searchPhotographers
} from '@/api/photographers.ts';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { photographersQueryKeys } from '@/queries/keys.ts';

/** 작가 프로필 상세 조회 */
export const usePhotographerProfileQuery = (
  photographerId?: string,
  pageable?: GetPageable,
) =>
  useQuery({
    // pageable을 실제로 쓰는지(포트폴리오 페이징 반영) 여부에 따라 key를 선택
    queryKey: photographerId
      ? (pageable
        ? photographersQueryKeys.profilePageable(photographerId, pageable)
        : photographersQueryKeys.profile(photographerId))
      : [],
    queryFn: () => getPhotographerProfile(photographerId!, pageable),
    enabled: Boolean(photographerId),
  });

/** 작가 리뷰 요약 조회 */
export const usePhotographerReviewSummaryQuery = (photographerId?: string) =>
  useQuery({
    queryKey: photographerId ? photographersQueryKeys.reviewSummary(photographerId) : [],
    queryFn: () => getPhotographerReviewSummary(photographerId!),
    enabled: Boolean(photographerId),
    staleTime: 1000 * 60, // 1분 정도 캐시 (원하면 조절)
  });

/* -------------------------------------------------------
 * Infinite Queries (useInfiniteQuery)
 * ------------------------------------------------------ */

/**
 * 작가 검색 infinite
 * - pageable.page는 pageParam으로 처리
 * - body(필터)는 queryKey에 포함되어야 캐시가 분리됨
 */
export const useSearchPhotographersInfiniteQuery = (
  pageableWithoutPage: Omit<GetPageable, 'page'>,
  body: SearchPhotographersBody,
) =>
  useInfiniteQuery({
    queryKey: photographersQueryKeys.searchInfinite(pageableWithoutPage, body),
    initialPageParam: 0, // Spring 기본 0-base
    queryFn: ({ pageParam }) =>
      searchPhotographers({ ...pageableWithoutPage, page: pageParam }, body),
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.number + 1),
  });

/**
 * 작가 리뷰 목록 infinite
 */
export const usePhotographerReviewsInfiniteQuery = (
  photographerId: string | undefined,
  pageableWithoutPage: Omit<GetPageable, 'page'>,
) =>
  useInfiniteQuery({
    queryKey: photographerId
      ? photographersQueryKeys.reviewsInfinite(photographerId, pageableWithoutPage)
      : [],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      getPhotographerReviews(photographerId!, { ...pageableWithoutPage, page: pageParam }),
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.number + 1),
    enabled: Boolean(photographerId),
  });