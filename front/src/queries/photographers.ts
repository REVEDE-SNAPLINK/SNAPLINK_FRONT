import {
  GetPageable,
  getPhotographerProfile, getPhotographerReviews,
  getPhotographerReviewSummary,
  SearchPhotographersBody,
  searchPhotographers, getMyScrappedPhotographers,
  getStatusMe,
  getPhotographerRegionsAndConceptsAndTags,
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

export const usePhotographerProfileInfiniteQuery = (
  photographerId: string | undefined,
  pageableWithoutPage: Omit<GetPageable, 'page'>,
) =>
  useInfiniteQuery({
    queryKey: photographerId
      ? photographersQueryKeys.profileInfinite(photographerId, pageableWithoutPage)
      : [],
    enabled: Boolean(photographerId),
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getPhotographerProfile(photographerId!, { ...pageableWithoutPage, page: pageParam }),
    // portfolios 배열에 대한 페이징
    // portfolioCount와 현재까지 로드된 portfolios 수를 비교하여 다음 페이지 결정
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.reduce((sum, page) => sum + (page.portfolios?.length || 0), 0);
      const hasMore = totalLoaded < lastPage.portfolioCount;
      return hasMore ? allPages.length : undefined;
    },
  });

/** 작가 리뷰 요약 조회 */
export const usePhotographerReviewSummaryQuery = (photographerId?: string) =>
  useQuery({
    queryKey: photographerId ? photographersQueryKeys.reviewSummary(photographerId) : [],
    // queryFn: () => withMockData(
    //   () => getMockPhotographerReviewSummary(photographerId!) || {} as any,
    //   () => getPhotographerReviewSummary(photographerId!),
    // ),
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
    queryFn: ({ pageParam }) => searchPhotographers({ ...pageableWithoutPage, page: pageParam }, body),
    // queryFn: ({ pageParam }) => withMockData(
    //   () => getMockPhotographersPage(pageParam, pageableWithoutPage.size || 10, body),
    //   () => searchPhotographers({ ...pageableWithoutPage, page: pageParam }, body),
    // ),
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


const MAIN_SIZE = 3;

export const useMainPhotographersLatestTop3Query = () =>
  useQuery({
    queryKey: photographersQueryKeys.searchMainTop3(),
    queryFn: () =>
      searchPhotographers(
        { page: 0, size: MAIN_SIZE },
        {
          gender: null,
          regionIds: null,
          conceptIds: null,
          maxPrice: null,
          minPrice: null,
          query: '',
        },
      ),
    staleTime: 1000 * 30,
  });

export const useMainPhotographersTopRatedTop3Query = () =>
  useQuery({
    queryKey: photographersQueryKeys.searchMainTop3('averageRating,desc'),
    queryFn: () =>
      searchPhotographers(
        { page: 0, size: MAIN_SIZE, sort: ['averageRating,desc', 'reviewCount,desc'] },
        {
          gender: null,
          regionIds: null,
          conceptIds: null,
          maxPrice: null,
          minPrice: null,
          query: '',
        },
      ),
    staleTime: 1000 * 30,
  });

export const useMyScrappedPhotographersInfiniteQuery = (
  pageableWithoutPage: Omit<GetPageable, 'page'>,
) =>
  useInfiniteQuery({
    queryKey: photographersQueryKeys.scrappedMeInfinite(pageableWithoutPage),
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      getMyScrappedPhotographers({ ...pageableWithoutPage, page: pageParam }),
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.number + 1),
  });

/**
 * 포트폴리오 게시글 조회
 */
export const usePortfolioPostQuery = (postId: number | undefined) =>
  useQuery({
    queryKey: postId ? photographersQueryKeys.portfolio(postId) : [],
    queryFn: () => {
      if (!postId) throw new Error('postId is required');
      return import('@/api/photographers').then(m => m.getPortfolioPost(postId));
    },
    enabled: typeof postId === 'number',
    staleTime: 1000 * 60,
  });

/**
 * 작가 상태 조회 (PENDING, ACTIVE, INACTIVE, REJECTED, SUSPENDED)
 */
export const usePhotographerStatusQuery = () =>
  useQuery({
    queryKey: photographersQueryKeys.statusMe(),
    queryFn: () => getStatusMe(),
  });

/** 작가 지역, 컨셉, 태그 조회 */
export const usePhotographerRegionsConceptsTagsQuery = (photographerId: string | undefined) =>
  useQuery({
    queryKey: photographerId ? photographersQueryKeys.regionsConceptsTags(photographerId) : [],
    queryFn: () => {
      if (!photographerId) throw new Error('photographerId is required');
      return getPhotographerRegionsAndConceptsAndTags(photographerId);
    },
    enabled: Boolean(photographerId),
  });