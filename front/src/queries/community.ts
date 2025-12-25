import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  CommunityPost,
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
    queryFn: ({ pageParam }) =>
      getCommunityPosts({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      // Spring Page 응답 기준: last=true면 끝
      if (lastPage.last) return undefined;
      return lastPage.number + 1; // 현재 페이지 번호 + 1
      // (또는 lastPage.totalPages 기반으로 해도 됨)
    },
    staleTime: 1000 * 30,
  });
};

export const useCommunityPostQuery = (postId?: string) => {
  return useQuery({
    queryKey: postId ? communityKeys.post(postId) : [],
    queryFn: () => getCommunityPost(postId!),
    enabled: Boolean(postId),
    staleTime: 1000 * 30,
  });
};

export const useCommunityCommentsQuery = (
  postId: string,
  params?: GetPageable,
) => {
  return useQuery({
    queryKey: communityKeys.comments(postId, params),
    queryFn: () => getComments(postId, params || {}),
    enabled: Boolean(postId),
    staleTime: 1000 * 30,
  });
};

export const useMyPostsQuery = () => {
  return useQuery({
    queryKey: communityKeys.myPosts(),
    queryFn: getMyPosts,
    staleTime: 1000 * 30,
  });
};
