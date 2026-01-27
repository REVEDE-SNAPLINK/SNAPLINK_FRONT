import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  getCommunityPost,
  getCommunityPosts,
  getMyPosts,
  getComments,
  GetPageable,
} from '@/api/community.ts';
import { communityKeys } from '@/queries/keys.ts';

export const useCommunityPostsQuery = (
  params: Omit<GetPageable, 'page'>,
) => {
  return useInfiniteQuery({
    queryKey: communityKeys.postsList(params),
    initialPageParam: 0,
    // queryFn: ({ pageParam }) => withMockData(
    //   () => getMockCommunityPostsPage(pageParam, params.size || 10),
    //   () => getCommunityPosts({ ...params, page: pageParam }),
    // ),
    queryFn: ({ pageParam }) => getCommunityPosts({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      // Spring Page 응답 기준: last=true면 끝
      if (lastPage.last) return undefined;
      return lastPage.number + 1; // 현재 페이지 번호 + 1
      // (또는 lastPage.totalPages 기반으로 해도 됨)
    },
    staleTime: 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useCommunityPostQuery = (postId?: number) => {
  return useQuery({
    queryKey: postId ? communityKeys.post(postId) : [],
    queryFn: () => getCommunityPost(postId!),
    enabled: Boolean(postId),
    staleTime: 1000 * 30,
    refetchInterval: 10000,
  });
};

export const useCommunityCommentsQuery = (
  postId: number,
  params?: GetPageable,
) => {
  return useQuery({
    queryKey: communityKeys.comments(postId, params),
    queryFn: () => getComments(postId, params || {}),
    enabled: Boolean(postId),
    staleTime: 1000 * 30,
    refetchInterval: 10000,
  });
};

export const useCommunityCommentsInfiniteQuery = (
  postId: number,
  params: Omit<GetPageable, 'page'> = { size: 20 },
) => {
  return useInfiniteQuery({
    queryKey: communityKeys.commentsInfinite(postId, params),
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getComments(postId, { ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.last) return undefined;
      return lastPage.number + 1;
    },
    enabled: Boolean(postId),
    staleTime: 1000 * 30,
  });
};

export const useMyPostsInfiniteQuery = (params: Omit<GetPageable, 'page'> = {}) =>
  useInfiniteQuery({
    queryKey: communityKeys.myPostsInfinite(params),
    initialPageParam: 0,
    // queryFn: ({ pageParam }) => withMockData(
    //   () => getMockCommunityPostsPage(pageParam, params.size || 10),
    //   () => getMyPosts({ ...params, page: pageParam }),
    // ),
    queryFn: ({ pageParam }) => getMyPosts({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.number + 1),
    staleTime: 1000 * 30,
  });
