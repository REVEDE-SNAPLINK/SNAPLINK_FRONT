import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { bookingsQueryKeys } from '@/queries/keys.ts';
import {
  getAvailableDays,
  getMonthlySchedule,
  getPhotographerBookings,
  getBookingDetail,
  GetBookingListParams,
  getBookingPhotos,
  getUserBookings,
} from '@/api/bookings.ts';

export const useUserBookingsInfiniteQuery = (
  params: Omit<GetBookingListParams, 'page'>,
) =>
  useInfiniteQuery({
    queryKey: bookingsQueryKeys.userListInfinite(params),
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getUserBookings({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
  });

export const usePhotographerBookingsInfiniteQuery = (
  params: Omit<GetBookingListParams, 'page'>,
) =>
  useInfiniteQuery({
    queryKey: bookingsQueryKeys.photographerListInfinite(params),
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getPhotographerBookings({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
  });

export const useMonthlyScheduleQuery = (photographerId?: string, year?: string, month?: string) =>
  useQuery({
    queryKey: photographerId && year && month
      ? bookingsQueryKeys.monthlySchedule(photographerId, year, month)
      : [],
    queryFn: () => getMonthlySchedule(photographerId!, year!, month!),
    enabled: Boolean(photographerId && year && month),
    staleTime: 1000 * 30,
  });

export const useAvailableDaysQuery = (photographerId?: string, date?: string) =>
  useQuery({
    queryKey: photographerId && date
      ? bookingsQueryKeys.availableDays(photographerId, date)
      : [],
    queryFn: () => getAvailableDays(photographerId!, date!),
    enabled: Boolean(photographerId && date),
    staleTime: 1000 * 30,
  });

export const useBookingPhotosQuery = (bookingId?: number) =>
  useQuery({
    queryKey: typeof bookingId === 'number'
      ? bookingsQueryKeys.bookingPhotos(bookingId)
      : [],
    queryFn: () => getBookingPhotos(bookingId!),
    enabled: typeof bookingId === 'number',
  });

export const useBookingDetailQuery = (bookingId?: number) =>
  useQuery({
    queryKey:
      typeof bookingId === 'number'
        ? bookingsQueryKeys.booking(bookingId)
        : [],
    queryFn: () => getBookingDetail(bookingId!),
    enabled: typeof bookingId === 'number',
  });