import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createPortfolio,
  CreatePortfolioParams,
  patchPhotographerProfileImage,
  PatchPhotographerProfileImageParams,
  PhotographerSignRequest,
  signPhotographer, togglePhotographerScrap,
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

export const useTogglePhotographerScrapMutation = (photographerId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => togglePhotographerScrap(photographerId),
    onSuccess: () => {
      // 스크랩 결과가 여러 화면에 영향을 줌 → 넓게 invalidate
      qc.invalidateQueries({ queryKey: photographersQueryKeys.scrappedMe() });
      qc.invalidateQueries({ queryKey: photographersQueryKeys.search() });
      qc.invalidateQueries({ queryKey: photographersQueryKeys.profile(photographerId) });
      // 리뷰요약/리뷰목록은 보통 영향 없음. (scrapped 필드가 그쪽에 없으니까)
    },
  });
};