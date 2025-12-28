import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { reservationsQueryKeys } from '@/queries/keys.ts';
import {
  getAvailableSlots,
  getMonthlySchedule,
  getPhotographerReservations, getReservationDetail, GetReservationListParams, getReservationPhotos,
  getUserReservations,
} from '@/api/reservations.ts';
import { withMockData, getMockPhotographerReservationsPage } from '@/__dev__';

export const useUserReservationsInfiniteQuery = (
  params: Omit<GetReservationListParams, 'page'>,
) =>
  useInfiniteQuery({
    queryKey: reservationsQueryKeys.userListInfinite(params),
    initialPageParam: 0,
    // queryFn: ({ pageParam }) => withMockData(
    //   () => getMockUserReservationsPage(pageParam, params.size || 10),
    //   () => getUserReservations({ ...params, page: pageParam }),
    // ),
    queryFn: ({ pageParam }) => getUserReservations({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
  });

export const usePhotographerReservationsInfiniteQuery = (
  params: Omit<GetReservationListParams, 'page'>,
) =>
  useInfiniteQuery({
    queryKey: reservationsQueryKeys.photographerListInfinite(params),
    initialPageParam: 0,
    queryFn: ({ pageParam }) => withMockData(
      () => getMockPhotographerReservationsPage(pageParam, params.size || 10),
      () => getPhotographerReservations({ ...params, page: pageParam }),
    ),
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
  });

export const useMonthlyScheduleQuery = (photographerId?: string, month?: string) =>
  useQuery({
    queryKey: photographerId && month
      ? reservationsQueryKeys.monthlySchedule(photographerId, month)
      : [],
    queryFn: () => getMonthlySchedule(photographerId!, month!),
    enabled: Boolean(photographerId && month),
    staleTime: 1000 * 30,
  });

export const useAvailableSlotsQuery = (photographerId?: string, date?: string) =>
  useQuery({
    queryKey: photographerId && date
      ? reservationsQueryKeys.availableSlots(photographerId, date)
      : [],
    queryFn: () => getAvailableSlots(photographerId!, date!),
    enabled: Boolean(photographerId && date),
    staleTime: 1000 * 30,
  });

export const useReservationPhotosQuery = (reservationId?: number) =>
  useQuery({
    queryKey: typeof reservationId === 'number'
      ? reservationsQueryKeys.reservationPhotos(reservationId)
      : [],
    // queryFn: () => withMockData(
    //   () => getMockReservationPhotos(reservationId!) || { zip: null, photos: [], photoConfirmed: false },
    //   () => getReservationPhotos(reservationId!),
    // ),
    queryFn: () => getReservationPhotos(reservationId!),
    enabled: typeof reservationId === 'number',
  });

export const useReservationDetailQuery = (reservationId?: number) =>
  useQuery({
    queryKey:
      typeof reservationId === 'number'
        ? reservationsQueryKeys.reservation(reservationId)
        : [],
    // queryFn: () => withMockData(
    //   () => getMockReservationDetail(reservationId!) || {} as any,
    //   () => getReservationDetail(reservationId!),
    // ),
    queryFn: () => getReservationDetail(reservationId!),
    enabled: typeof reservationId === 'number',
  });