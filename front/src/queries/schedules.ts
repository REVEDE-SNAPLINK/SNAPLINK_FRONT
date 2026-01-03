import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { schedulesQueryKeys } from '@/queries/keys.ts';
import {
  getPhotographerMonthSchedules,
  getPhotographerDayDetail,
  getAvailableBookingDays,
  getAvailableBookingTimes,
  getWeeklySchedule,
  getPersonalSchedule,
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
    placeholderData: keepPreviousData,
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
    placeholderData: keepPreviousData,
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
    staleTime: 1000 * 60 * 2, // 2분 캐시
    placeholderData: keepPreviousData,
  });

export const useWeeklyScheduleQuery = (
  photographerId: string,
  enabled = true,
) =>
  useQuery({
    queryKey: schedulesQueryKeys.weeklySchedule(photographerId),
    queryFn: () => getWeeklySchedule(photographerId),
    enabled,
    staleTime: 1000 * 30,
  });

export const usePersonalScheduleQuery = (
  id: number | undefined,
  enabled = true,
) =>
  useQuery({
    queryKey: id ? schedulesQueryKeys.personalSchedule(id) : [],
    queryFn: () => {
      if (!id) throw new Error('id is required');
      return getPersonalSchedule(id);
    },
    enabled: enabled && typeof id === 'number',
    staleTime: 1000 * 30,
  });
