import { useQuery } from '@tanstack/react-query';
import { getAllRegions } from '@/api/regions.ts';
import { getAllConcepts } from '@/api/concepts.ts';
import { getTags } from '@/api/photographers.ts';
import { metaKeys } from '@/queries/keys.ts';

export const useRegionsQuery = () => useQuery({
  queryKey: metaKeys.regions(),
  queryFn: getAllRegions,

  staleTime: Infinity,
  gcTime: 1000 * 60 * 60 * 24 * 30, // 1 month

  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,

  retry: 1,
});

export const useConceptsQuery = () => useQuery({
  queryKey: metaKeys.concepts(),
  queryFn: getAllConcepts,

  staleTime: Infinity,
  gcTime: 1000 * 60 * 60 * 24 * 15, // 15 days

  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,

  retry: 1,
});

export const useTagsQuery = () => useQuery({
  queryKey: metaKeys.tags(),
  queryFn: getTags,

  staleTime: Infinity,
  gcTime: 1000 * 60 * 60 * 24 * 15, // 15 days

  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,

  retry: 1,
});