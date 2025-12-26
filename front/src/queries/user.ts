import { useQuery } from '@tanstack/react-query';
import { userQueryKeys } from '@/queries/keys';
import { getMe } from '@/api/user';

export const useMeQuery = () =>
  useQuery({
    queryKey: userQueryKeys.me(),
    queryFn: getMe,
    staleTime: 1000 * 30,
  });