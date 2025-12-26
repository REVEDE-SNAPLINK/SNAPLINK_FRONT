import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  patchUserProfileImage,
  PatchUserProfileImageParams,
  patchMe,
} from '@/api/user';
import { userQueryKeys } from '@/queries/keys';

export const usePatchUserProfileImageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: PatchUserProfileImageParams) => patchUserProfileImage(params),
    onSuccess: () => {
      // 이미지가 어떤 응답에 포함되는지에 따라 둘 다 갱신해두면 안전
      queryClient.invalidateQueries({ queryKey: userQueryKeys.profile() });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.me() });
    },
  });
};

/**
 * 닉네임만 수정 (PATCH /api/user/me)
 */
export const usePatchMyNicknameMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nickname: string) => patchMe({ nickname }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.me() });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.profile() });
    },
  });
};

/**
 * 이메일만 수정 (PATCH /api/user/me)
 */
export const usePatchMyEmailMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => patchMe({ email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.me() });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.profile() });
    },
  });
};