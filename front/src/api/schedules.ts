import { API_BASE_URL } from '@/config/api.ts';
import { buildQuery } from '@/utils/format.ts';
import { authFetch } from '@/api/utils.ts';
import { BookingStatus } from '@/api/bookings.ts';

const SCHEDULES_BASE = `${API_BASE_URL}/api/schedules`;

export interface GetPhotographerMonthSchedulesParams {
  photographerId: string;
  year: number;
  month: number;
}

export interface GetPhotographerMonthScheduleResponse {
  day: number;
  hasBookings: boolean;
  publicHoliday: boolean;
  photographerHoliday: boolean;
}

export interface GetPhotographerDayDetailParams {
  photographerId: string;
  date: string;
}

export interface DayBookingDetail {
  bookingId: number;
  customerNickName: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
}

export interface GetPhotographerDayDetailResponse {
  date: string; // YYYY-MM-DD
  publicHolidayName: string;
  photographerHolidayReason: string;
  bookings: DayBookingDetail[];
}

export interface GetAvailableBookingDayResponse {
  day: number;
  dayOfWeek: number;
  holidayName: string;
  available: boolean;
  holiday: boolean;
}

export interface GetAvailableBookingTimeResponse {
  startTime: string;
  endTime: string;
  available: boolean;
}

export const getPhotographerMonthSchedules = async (
  { photographerId, year, month }: GetPhotographerMonthSchedulesParams
): Promise<GetPhotographerMonthScheduleResponse[]> => {
  const qs = buildQuery({ year, month });
  const url = `${SCHEDULES_BASE}/photographer/month/${photographerId}?${qs}`;

  const response = await authFetch(url, { method: 'GET' });
  if (!response.ok) throw new Error(`Failed to get photographer month schedule ${response.status}`);

  return response.json();
}

export const getPhotographerDayDetail = async (
  { photographerId, date }: GetPhotographerDayDetailParams
): Promise<GetPhotographerDayDetailResponse[]> => {
  const qs = buildQuery({ date });
  const url = `${SCHEDULES_BASE}/photographer/day/detail/${photographerId}?${qs}`;

  const response = await authFetch(url, { method: 'GET' });
  if (!response.ok) throw new Error(`Failed to get photographer day detail ${response.status}`);

  return response.json();
}

export const getAvailableBookingDays = async (
  { photographerId, year, month }: GetPhotographerMonthSchedulesParams
): Promise<GetAvailableBookingDayResponse[]> => {
  const qs = buildQuery({ year, month });
  const url = `${SCHEDULES_BASE}/month/${photographerId}?${qs}`;

  const response = await authFetch(url, { method: 'GET' });
  if (!response.ok) throw new Error(`Failed to get available booking days ${response.status}`);

  return response.json();
}

export const getAvailableBookingTimes = async (
  { photographerId, date }: GetPhotographerDayDetailParams
): Promise<GetAvailableBookingTimeResponse[]> => {
  const qs = buildQuery({ date });
  const url = `${SCHEDULES_BASE}/day/${photographerId}?${qs}`;

  const response = await authFetch(url, { method: 'GET' });
  if (!response.ok) throw new Error(`Failed to get available time ${response.status}`);

  return response.json();
}