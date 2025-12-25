import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createPortfolio,
  CreatePortfolioParams,
  patchPhotographerProfileImage,
  PatchPhotographerProfileImageParams,
  PhotographerSignRequest,
  signPhotographer,
} from '@/api/photographers.ts';
import { photographersQueryKeys } from '@/queries/keys.ts';

/** 작가 기본 정보 등록 */
export const useSignPhotographerMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: PhotographerSignRequest) => signPhotographer(body),
    onSuccess: async () => {
      // sign 이후 프로필/검색 결과가 바뀔 수 있음
      await Promise.all([
        qc.invalidateQueries({ queryKey: photographersQueryKeys.all }),
      ]);
    },
  });
};

/** 작가 프로필 이미지 업로드/변경 */
export const usePatchPhotographerProfileImageMutation = (photographerId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (params: PatchPhotographerProfileImageParams) => patchPhotographerProfileImage(params),
    onSuccess: async () => {
      // 프로필 이미지 변경 → 프로필, 검색 카드(프로필이미지), 리뷰 작성자 아바타 등 영향 가능
      await Promise.all([
        qc.invalidateQueries({ queryKey: photographersQueryKeys.all }),
        ...(photographerId
          ? [qc.invalidateQueries({ queryKey: photographersQueryKeys.profile(photographerId) })]
          : []),
      ]);
    },
  });
};

/** 포트폴리오 업로드 */
export const useCreatePortfolioMutation = (photographerId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (params: CreatePortfolioParams) => createPortfolio(params),
    onSuccess: async () => {
      // 포트폴리오 업로드 후 프로필(포트폴리오 목록), 검색(포트폴리오 이미지) 영향 가능
      await Promise.all([
        qc.invalidateQueries({ queryKey: photographersQueryKeys.all }),
        ...(photographerId
          ? [qc.invalidateQueries({ queryKey: photographersQueryKeys.profile(photographerId) })]
          : []),
      ]);
    },
  });
};