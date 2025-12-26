import { useMutation, useQueryClient } from '@tanstack/react-query';
import { togglePhotographerScrap } from '@/api/photographers';
import { photographersQueryKeys } from '@/queries/keys';

/**
 * 작가 스크랩 토글 mutation
 */
export const useTogglePhotographerScrapMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (photographerId: string) => togglePhotographerScrap(photographerId),
    onSuccess: (data, photographerId) => {
      // 작가 프로필 쿼리 무효화하여 scrapped 상태 업데이트
      queryClient.invalidateQueries({
        queryKey: photographersQueryKeys.profile(photographerId)
      });
      queryClient.invalidateQueries({
        queryKey: photographersQueryKeys.profileInfinite(photographerId, {})
      });
      // 스크랩 목록도 무효화
      queryClient.invalidateQueries({
        queryKey: photographersQueryKeys.scrappedMeInfinite({})
      });
    },
  });
};
