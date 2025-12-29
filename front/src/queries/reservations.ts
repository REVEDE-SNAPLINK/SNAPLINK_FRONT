import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { reservationsQueryKeys } from '@/queries/keys.ts';
import {
  getAvailableDays,
  getMonthlySchedule,
  getPhotographerBookings,
  getBookingDetail,
  GetBookingListParams,
  getReservationPhotos,
  getUserBookings,
} from '@/api/reservations.ts';
import { withMockData, getMockPhotographerReservationsPage } from '@/__dev__';

export const useUserBookingsInfiniteQuery = (
  params: Omit<GetBookingListParams, 'page'>,
) =>
  useInfiniteQuery({
    queryKey: reservationsQueryKeys.userListInfinite(params),
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getUserBookings({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
  });

export const usePhotographerBookingsInfiniteQuery = (
  params: Omit<GetBookingListParams, 'page'>,
) =>
  useInfiniteQuery({
    queryKey: reservationsQueryKeys.photographerListInfinite(params),
    initialPageParam: 0,
    queryFn: ({ pageParam }) => withMockData(
      () => getMockPhotographerReservationsPage(pageParam, params.size || 10),
      () => getPhotographerBookings({ ...params, page: pageParam }),
    ),
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
  });

export const useMonthlyScheduleQuery = (photographerId?: string, year?: string, month?: string) =>
  useQuery({
    queryKey: photographerId && year && month
      ? reservationsQueryKeys.monthlySchedule(photographerId, year, month)
      : [],
    queryFn: () => getMonthlySchedule(photographerId!, year!, month!),
    enabled: Boolean(photographerId && year && month),
    staleTime: 1000 * 30,
  });

export const useAvailableDaysQuery = (photographerId?: string, date?: string) =>
  useQuery({
    queryKey: photographerId && date
      ? reservationsQueryKeys.availableDays(photographerId, date)
      : [],
    queryFn: () => getAvailableDays(photographerId!, date!),
    enabled: Boolean(photographerId && date),
    staleTime: 1000 * 30,
  });

export const useReservationPhotosQuery = (reservationId?: number) =>
  useQuery({
    queryKey: typeof reservationId === 'number'
      ? reservationsQueryKeys.reservationPhotos(reservationId)
      : [],
    queryFn: () => getReservationPhotos(reservationId!),
    enabled: typeof reservationId === 'number',
  });

export const useBookingDetailQuery = (bookingId?: number) =>
  useQuery({
    queryKey:
      typeof bookingId === 'number'
        ? reservationsQueryKeys.booking(bookingId)
        : [],
    queryFn: () => getBookingDetail(bookingId!),
    enabled: typeof bookingId === 'number',
  });