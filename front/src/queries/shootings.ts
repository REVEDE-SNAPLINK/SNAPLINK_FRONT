import { useQuery } from '@tanstack/react-query';
import { shootingsQueryKeys } from '@/queries/keys.ts';
import {
  getShootings,
  getShootingOptions,
} from '@/api/shootings.ts';

export const useShootingsQuery = (enabled = true) =>
  useQuery({
    queryKey: shootingsQueryKeys.me(),
    queryFn: () => getShootings(),
    enabled,
  });

export const useShootingOptionsQuery = (productId: number, enabled = true) =>
  useQuery({
    queryKey: shootingsQueryKeys.options(productId),
    queryFn: () => getShootingOptions(productId),
    enabled,
  });
