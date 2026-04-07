import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createPortfolio,
  CreatePortfolioParams,
  patchPhotographerProfileImage,
  PatchPhotographerProfileImageParams,
  PhotographerSignRequest,
  signPhotographer,
  togglePhotographerScrap,
  activePhotographer,
  inactivePhotographer,
  updatePortfolioPost,
  UpdatePortfolioPostRequest,
  deletePortfolioPost,
  updatePhotographerProfile,
  UpdatePhotographerProfileRequest,
  togglePinPortfolio,
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


/** 작가 계정 활성화 (공개 전환) */
export const useActivePhotographerMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => activePhotographer(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: photographersQueryKeys.statusMe() });
      qc.invalidateQueries({ queryKey: photographersQueryKeys.all });
    },
  });
};

/** 작가 계정 비활성화 (비공개 전환) */
export const useInactivePhotographerMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => inactivePhotographer(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: photographersQueryKeys.statusMe() });
      qc.invalidateQueries({ queryKey: photographersQueryKeys.all });
    },
  });
};

/** 포트폴리오 수정 */
export const useUpdatePortfolioMutation = (postId: number, photographerId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdatePortfolioPostRequest) => updatePortfolioPost(postId, params),
    onSuccess: async () => {
      // 포트폴리오 수정 후 프로필(포트폴리오 목록), 포트폴리오 상세, 검색 결과 영향 가능
      await Promise.all([
        qc.invalidateQueries({ queryKey: photographersQueryKeys.portfolio(postId) }),
        qc.invalidateQueries({ queryKey: photographersQueryKeys.all }),
        ...(photographerId
          ? [qc.invalidateQueries({ queryKey: photographersQueryKeys.profile(photographerId) })]
          : []),
      ]);
    },
  });
};

/** 포트폴리오 삭제 */
export const useDeletePortfolioMutation = (postId: number, photographerId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => deletePortfolioPost(postId),
    onSuccess: async () => {
      // 포트폴리오 삭제 후 프로필(포트폴리오 목록), 검색 결과 영향 가능
      await Promise.all([
        qc.invalidateQueries({ queryKey: photographersQueryKeys.portfolio(postId) }),
        qc.invalidateQueries({ queryKey: photographersQueryKeys.all }),
        ...(photographerId
          ? [qc.invalidateQueries({ queryKey: photographersQueryKeys.profile(photographerId) })]
          : []),
      ]);
    },
  });
};

/** 포트폴리오 고정/해제 토글 */
export const useTogglePinPortfolioMutation = (postId: number, photographerId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => togglePinPortfolio(postId),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: photographersQueryKeys.portfolio(postId) }),
        ...(photographerId
          ? [qc.invalidateQueries({ queryKey: photographersQueryKeys.profile(photographerId) })]
          : []),
      ]);
    },
  });
};

/** 작가 프로필 업데이트 (description, regions, concepts, tags) */
export const useUpdatePhotographerProfileMutation = (photographerId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdatePhotographerProfileRequest) => updatePhotographerProfile(params),
    onSuccess: async () => {
      // 프로필 업데이트 후 프로필, 지역/컨셉/태그, 검색 결과 영향 가능
      await Promise.all([
        qc.invalidateQueries({ queryKey: photographersQueryKeys.all }),
        ...(photographerId
          ? [
              qc.invalidateQueries({ queryKey: photographersQueryKeys.profile(photographerId) }),
              qc.invalidateQueries({ queryKey: photographersQueryKeys.regionsConceptsTags(photographerId) }),
            ]
          : []),
      ]);
    },
  });
};