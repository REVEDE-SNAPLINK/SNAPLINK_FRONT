import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getNoticeDetail, getNotices } from '@/api/notices';
import { noticeQueryKeys } from '@/queries/keys';
import { GetPageable } from '@/api/photographers';

/** * 공지사항 상세 조회
 */
export const useNoticeDetailQuery = (id: number | undefined) =>
  useQuery({
    queryKey: id ? noticeQueryKeys.notice(id) : [],
    queryFn: () => {
      if (!id) throw new Error('Notice ID is required');
      return getNoticeDetail(id);
    },
    enabled: typeof id === 'number',
    staleTime: 1000 * 60 * 5,
  });

/**
 * 공지사항 목록 Infinite Query
 * @param pageableWithoutPage - page를 제외한 size, sort 등의 설정
 */
export const useNoticesInfiniteQuery = (
  pageableWithoutPage: Omit<GetPageable, 'page'>,
) =>
  useInfiniteQuery({
    // 1. queryKey에 페이징 설정(size 등)을 포함하여 캐시 분리
    queryKey: [...noticeQueryKeys.lists(), pageableWithoutPage],

    initialPageParam: 0,

    // 2. pageParam을 API의 page 인자로 전달
    queryFn: ({ pageParam }) =>
      getNotices({
        ...pageableWithoutPage,
        page: pageParam
      }),

    // 3. 백엔드 응답(PageResponse)의 last 여부에 따라 다음 페이지 결정
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.number + 1),

    staleTime: 1000 * 60 * 10,
  });