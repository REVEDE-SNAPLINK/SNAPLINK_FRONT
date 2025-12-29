import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createBooking,
  CreateBookingRequest,
  deleteReservationPhotos,
  DeleteReservationPhotosRequest,
  uploadReservationZip,
  UploadReservationZipRequest,
  approveBooking,
  rejectBooking,
  completeBooking,
  cancelBooking,
  deliverPhotos,
  PatchBookingStatusParams,
  RejectOrCancelBookingParams,
} from '@/api/reservations.ts';
import { reservationsQueryKeys } from '@/queries/keys.ts';

export const useApproveBookingMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (params: PatchBookingStatusParams) => approveBooking(params),
    onSuccess: async (_, vars) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: reservationsQueryKeys.photographerList() }),
        qc.invalidateQueries({ queryKey: reservationsQueryKeys.userList() }),
        qc.invalidateQueries({ queryKey: reservationsQueryKeys.booking(vars.bookingId) }),
      ]);
    },
  });
};

export const useRejectBookingMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (params: RejectOrCancelBookingParams) => rejectBooking(params),
    onSuccess: async (_, vars) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: reservationsQueryKeys.photographerList() }),
        qc.invalidateQueries({ queryKey: reservationsQueryKeys.userList() }),
        qc.invalidateQueries({ queryKey: reservationsQueryKeys.booking(vars.bookingId) }),
      ]);
    },
  });
};

export const useCompleteBookingMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (params: PatchBookingStatusParams) => completeBooking(params),
    onSuccess: async (_, vars) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: reservationsQueryKeys.photographerList() }),
        qc.invalidateQueries({ queryKey: reservationsQueryKeys.userList() }),
        qc.invalidateQueries({ queryKey: reservationsQueryKeys.booking(vars.bookingId) }),
      ]);
    },
  });
};

export const useCancelBookingMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (params: RejectOrCancelBookingParams) => cancelBooking(params),
    onSuccess: async (_, vars) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: reservationsQueryKeys.photographerList() }),
        qc.invalidateQueries({ queryKey: reservationsQueryKeys.userList() }),
        qc.invalidateQueries({ queryKey: reservationsQueryKeys.booking(vars.bookingId) }),
      ]);
    },
  });
};

export const useDeliverPhotosMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (params: PatchBookingStatusParams) => deliverPhotos(params),
    onSuccess: async (_, vars) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: reservationsQueryKeys.photographerList() }),
        qc.invalidateQueries({ queryKey: reservationsQueryKeys.userList() }),
        qc.invalidateQueries({ queryKey: reservationsQueryKeys.booking(vars.bookingId) }),
      ]);
    },
  });
};

export const useCreateBookingMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateBookingRequest) => createBooking(body),
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