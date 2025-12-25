import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patchUserProfileImage, PatchUserProfileImageParams } from '@/api/user.ts';
import { userQueryKeys } from '@/queries/keys.ts';

export const usePatchUserProfileImageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: PatchUserProfileImageParams) => patchUserProfileImage(params),
    onSuccess: () => {
      // 프로필 이미지가 프로필 응답에 포함된다고 가정
      queryClient.invalidateQueries({ queryKey: userQueryKeys.profile() });

      // 혹시 프로필을 따로 안 쓰고 user 전체를 엮어놨으면 이것만으로도 OK
      // queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
  });
};