import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { userQueryKeys } from '@/queries/keys';
import { getMe, getNotificationSettings, searchUsersFromNickname } from '@/api/user';
import { GetPageable } from '@/api/photographers';

export const useMeQuery = () =>
  useQuery({
    queryKey: userQueryKeys.me(),
    queryFn: getMe,
    staleTime: 1000 * 30,
  });

export const useNotificationSettingsQuery = () =>
  useQuery({
    queryKey: userQueryKeys.notifications(),
    queryFn: getNotificationSettings,
    staleTime: 1000 * 60,
  });

export const useSearchUsersInfiniteQuery = (
  nickname: string,
  pageableWithoutPage: Omit<GetPageable, 'page'> = { size: 20 }
) => {
  return useInfiniteQuery({
    queryKey: userQueryKeys.searchInfinite(nickname, pageableWithoutPage),
    queryFn: ({ pageParam = 0 }) =>
      searchUsersFromNickname(nickname, { ...pageableWithoutPage, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.last) return undefined;
      return lastPage.number + 1;
    },
    initialPageParam: 0,
    enabled: nickname.length > 0, // 검색어가 있을 때만 활성화
    staleTime: 1000 * 30,
  });
};