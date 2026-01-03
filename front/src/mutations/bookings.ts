import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createBooking,
  CreateBookingRequest,
  updateBookingPhotos,
  UpdateBookingPhotosRequest,
  uploadBookingZip,
  UploadBookingZipRequest,
  approveBooking,
  rejectBooking,
  completeBooking,
  cancelBooking,
  deliverPhotos,
  PatchBookingStatusParams,
  RejectOrCancelBookingParams,
} from '@/api/bookings.ts';
import { bookingsQueryKeys } from '@/queries/keys.ts';

export const useApproveBookingMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (params: PatchBookingStatusParams) => approveBooking(params),
    onSuccess: async (_, vars) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: bookingsQueryKeys.photographerList() }),
        qc.invalidateQueries({ queryKey: bookingsQueryKeys.userList() }),
        qc.invalidateQueries({ queryKey: bookingsQueryKeys.booking(vars.bookingId) }),
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
        qc.invalidateQueries({ queryKey: bookingsQueryKeys.photographerList() }),
        qc.invalidateQueries({ queryKey: bookingsQueryKeys.userList() }),
        qc.invalidateQueries({ queryKey: bookingsQueryKeys.booking(vars.bookingId) }),
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
        qc.invalidateQueries({ queryKey: bookingsQueryKeys.photographerList() }),
        qc.invalidateQueries({ queryKey: bookingsQueryKeys.userList() }),
        qc.invalidateQueries({ queryKey: bookingsQueryKeys.booking(vars.bookingId) }),
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
        qc.invalidateQueries({ queryKey: bookingsQueryKeys.photographerList() }),
        qc.invalidateQueries({ queryKey: bookingsQueryKeys.userList() }),
        qc.invalidateQueries({ queryKey: bookingsQueryKeys.booking(vars.bookingId) }),
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
        qc.invalidateQueries({ queryKey: bookingsQueryKeys.photographerList() }),
        qc.invalidateQueries({ queryKey: bookingsQueryKeys.userList() }),
        qc.invalidateQueries({ queryKey: bookingsQueryKeys.booking(vars.bookingId) }),
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
        qc.invalidateQueries({ queryKey: bookingsQueryKeys.userList() }),
        qc.invalidateQueries({ queryKey: bookingsQueryKeys.photographerList() }),
      ]);
    },
  });
};

export const useUpdateBookingPhotosMutation = (bookingId: number) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateBookingPhotosRequest) => updateBookingPhotos(bookingId, body),
    onSuccess: async (_, ) => {
      // 이미지 추가 및 삭제 후 ZIP/사진 목록 갱신
      await qc.invalidateQueries({
        queryKey: bookingsQueryKeys.bookingPhotos(bookingId),
      });
    },
  });
};

export const useUploadBookingZipMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (params: UploadBookingZipRequest) => uploadBookingZip(params),
    onSuccess: async (_, vars) => {
      // 업로드 후 ZIP/사진 목록 갱신
      await qc.invalidateQueries({
        queryKey: bookingsQueryKeys.bookingPhotos(vars.bookingId),
      });
    },
  });
};