import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  deleteShooting,
  deleteShootingOption,
  createShooting,
  createShootingOption,
  updateShooting,
  updateShootingOption,
  CreateShootingRequest,
  CreateShootingOptionRequest,
} from '@/api/shootings.ts';
import { shootingsQueryKeys } from '@/queries/keys.ts';

export const useDeleteShootingMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (shootingId: number) => deleteShooting(shootingId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: shootingsQueryKeys.me() });
    },
  });
};

export const useDeleteShootingOptionMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (optionId: number) => deleteShootingOption(optionId),
    onSuccess: async () => {
      // 전체 촬영 상품 목록 invalidate (옵션이 속한 상품 정보가 변경됨)
      await qc.invalidateQueries({ queryKey: shootingsQueryKeys.all });
    },
  });
};

export const useCreateShootingMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateShootingRequest) => createShooting(body),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: shootingsQueryKeys.me() });
    },
  });
};

export const useCreateShootingOptionMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, body }: { productId: number; body: CreateShootingOptionRequest }) =>
      createShootingOption(productId, body),
    onSuccess: async (_, vars) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: shootingsQueryKeys.options(vars.productId) }),
        qc.invalidateQueries({ queryKey: shootingsQueryKeys.me() }),
      ]);
    },
  });
};

export const useUpdateShootingMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ shootingId, body }: { shootingId: number; body: CreateShootingRequest }) =>
      updateShooting(shootingId, body),
    onSuccess: async (_, vars) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: shootingsQueryKeys.shooting(vars.shootingId) }),
        qc.invalidateQueries({ queryKey: shootingsQueryKeys.me() }),
      ]);
    },
  });
};

export const useUpdateShootingOptionMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ optionId, body }: { optionId: number; body: CreateShootingOptionRequest }) =>
      updateShootingOption(optionId, body),
    onSuccess: async () => {
      // 전체 촬영 상품/옵션 정보 invalidate
      await qc.invalidateQueries({ queryKey: shootingsQueryKeys.all });
    },
  });
};
