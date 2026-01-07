import { useQuery, keepPreviousData, useQueries } from '@tanstack/react-query';
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
  GetPhotographerDayDetailResponse,
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

export const usePhotographerMultipleDayDetailsQuery = (
  photographerId: string,
  dates: string[],
  enabled = true,
) => {
  const queries = useQueries({
    queries: dates.map(date => ({
      queryKey: schedulesQueryKeys.photographerDay({ photographerId, date }),
      queryFn: () => getPhotographerDayDetail({ photographerId, date }),
      enabled: enabled && !!photographerId && dates.length > 0,
      staleTime: 1000 * 30,
      placeholderData: keepPreviousData,
    })),
  });

  // Convert to Map for easier lookup
  const dayDetailMap = new Map<string, GetPhotographerDayDetailResponse>();
  dates.forEach((date, index) => {
    const queryResult = queries[index];
    if (queryResult?.data) {
      dayDetailMap.set(date, queryResult.data);
    }
  });

  return {
    dayDetailMap,
    isLoading: queries.some(q => q.isLoading),
    isError: queries.some(q => q.isError),
  };
};
