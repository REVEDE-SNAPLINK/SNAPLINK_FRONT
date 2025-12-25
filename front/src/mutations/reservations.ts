import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createReservation,
  CreateReservationRequest, deleteReservationPhotos, DeleteReservationPhotosRequest,
  patchReservationStatus,
  PatchReservationStatusParams, uploadReservationZip, UploadReservationZipRequest,
} from '@/api/reservations.ts';
import { reservationsQueryKeys } from '@/queries/keys.ts';

export const usePatchReservationStatusMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (params: PatchReservationStatusParams) => patchReservationStatus(params),
    onSuccess: async (_, vars) => {
      // 리스트 + detail + photos(상태에 따라 달라질 수 있으니) 갱신
      await Promise.all([
        qc.invalidateQueries({ queryKey: reservationsQueryKeys.photographerList() }),
        qc.invalidateQueries({ queryKey: reservationsQueryKeys.userList() }),
        qc.invalidateQueries({ queryKey: reservationsQueryKeys.reservation(vars.reservationId) }),
        qc.invalidateQueries({ queryKey: reservationsQueryKeys.reservationPhotos(vars.reservationId) }),
      ]);
    },
  });
};

export const useCreateReservationMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateReservationRequest) => createReservation(body),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: reservationsQueryKeys.userList() }),
        qc.invalidateQueries({ queryKey: reservationsQueryKeys.photographerList() }),
      ]);
    },
  });
};

export const useDeleteReservationPhotosMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: DeleteReservationPhotosRequest) => deleteReservationPhotos(body),
    onSuccess: async (_, vars) => {
      // 삭제 후 ZIP/사진 목록 갱신
      await qc.invalidateQueries({
        queryKey: reservationsQueryKeys.reservationPhotos(vars.reservationId),
      });
    },
  });
};

export const useUploadReservationZipMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (params: UploadReservationZipRequest) => uploadReservationZip(params),
    onSuccess: async (_, vars) => {
      // 업로드 후 ZIP/사진 목록 갱신
      await qc.invalidateQueries({
        queryKey: reservationsQueryKeys.reservationPhotos(vars.reservationId),
      });
    },
  });
};