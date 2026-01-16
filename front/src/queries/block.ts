import { useQuery } from '@tanstack/react-query';
import { getBlocks } from '@/api/block';
import { blockKeys } from '@/queries/keys';

export const useBlocksQuery = () => {
  return useQuery({
    queryKey: blockKeys.list(),
    queryFn: getBlocks,
  });
};
