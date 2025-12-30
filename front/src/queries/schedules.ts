import { useQuery } from '@tanstack/react-query';
import { schedulesQueryKeys } from '@/queries/keys.ts';
import {
  getPhotographerMonthSchedules,
  getPhotographerDayDetail,
  getAvailableBookingDays,
  getAvailableBookingTimes,
  GetPhotographerMonthSchedulesParams,
  GetPhotographerDayDetailParams,
} from '@/api/schedules.ts';

export const usePhotographerMonthSchedulesQuery = (
  params: GetPhotographerMonthSchedulesParams,
  enabled = true,
) =>
  useQuery({
    queryKey: schedulesQueryKeys.photographerMonth(params),
    queryFn: () => getPhotographerMonthSchedules(params),
    enabled,
    staleTime: 1000 * 30,
  });

export const usePhotographerDayDetailQuery = (
  params: GetPhotographerDayDetailParams,
  enabled = true,
) =>
  useQuery({
    queryKey: schedulesQueryKeys.photographerDay(params),
    queryFn: () => getPhotographerDayDetail(params),
    enabled,
    staleTime: 1000 * 30,
  });

export const useAvailableBookingDaysQuery = (
  params: GetPhotographerMonthSchedulesParams,
  enabled = true,
) =>
  useQuery({
    queryKey: schedulesQueryKeys.availableDays(params),
    queryFn: () => getAvailableBookingDays(params),
    enabled,
    staleTime: 1000 * 30,
  });

export const useAvailableBookingTimesQuery = (
  params: GetPhotographerDayDetailParams,
  enabled = true,
) =>
  useQuery({
    queryKey: schedulesQueryKeys.availableTimes(params),
    queryFn: () => getAvailableBookingTimes(params),
    enabled,
    staleTime: 1000 * 30,
  });
