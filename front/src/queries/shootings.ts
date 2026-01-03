import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { shootingsQueryKeys } from '@/queries/keys.ts';
import {
  getMyShootings,
  getShootingOptions,
  getShootings,
} from '@/api/shootings.ts';

export const useMyShootingsQuery = (enabled = true) =>
  useQuery({
    queryKey: shootingsQueryKeys.me(),
    queryFn: () => getMyShootings(),
    enabled,
  });

export const useShootingsQuery = (photographerId?: string, enabled = true) =>
  useQuery({
    queryKey: photographerId ? shootingsQueryKeys.shootings(photographerId) : [],
    queryFn: () => getShootings(photographerId!),
    enabled: enabled && !!photographerId,
  });

export const useShootingOptionsQuery = (productId?: number, enabled = true) =>
  useQuery({
    queryKey: productId ? shootingsQueryKeys.options(productId) : [],
    queryFn: () => getShootingOptions(productId!),
    enabled: enabled && !!productId,
    staleTime: 1000 * 60 * 5, // 5분 캐시
    placeholderData: keepPreviousData,
  });
