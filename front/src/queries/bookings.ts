import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { bookingsQueryKeys } from '@/queries/keys.ts';
import {
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