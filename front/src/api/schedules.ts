import { getApiBaseUrl } from '@/config/api.ts';
import { buildQuery } from '@/utils/format.ts';
import { authFetch } from '@/api/utils.ts';
import { BookingStatus } from '@/api/bookings.ts';
import { DayOfWeek, PhotographerScheduleItem } from '@/api/photographers.ts';

const schedulesBase = () => `${getApiBaseUrl()}/api/schedules`;
const personalBase = () => `${getApiBaseUrl()}/api/photographer/personal/schedules`;

export interface GetPhotographerMonthSchedulesParams {
  photographerId: string;
  year: number;
  month: number;
}

export interface GetPhotographerMonthScheduleResponse {
  day: number;
  dayOfWeek: number;
  status: string;
  publicHoliday: true;
}

export interface GetPhotographerDayDetailParams {
  photographerId: string;
  date: string;
}

export interface DayBookingDetail {
  id: number;
  customerName: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  productName: string;
}

export interface DayPersonalScheduleDetail {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  description: string;
}

export interface GetPhotographerDayDetailResponse {
  date: string; // YYYY-MM-DD
  holidayName: string;
  holidayId: number | null;
  bookings: DayBookingDetail[];
  personalSchedules: DayPersonalScheduleDetail[];
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
  const url = `${schedulesBase()}/photographer/month/${photographerId}?${qs}`;

  const response = await authFetch(url, { method: 'GET' });
  if (!response.ok) throw new Error('월간 스케줄을 불러올 수 없습니다.');

  return response.json();
}

export const getPhotographerDayDetail = async (
  { photographerId, date }: GetPhotographerDayDetailParams
): Promise<GetPhotographerDayDetailResponse> => {
  const qs = buildQuery({ date });
  const url = `${schedulesBase()}/photographer/day/detail/${photographerId}?${qs}`;

  const response = await authFetch(url, { method: 'GET' });
  if (!response.ok) throw new Error('일일 스케줄 상세를 불러올 수 없습니다.');

  return response.json();
}

export const getAvailableBookingDays = async (
  { photographerId, year, month }: GetPhotographerMonthSchedulesParams
): Promise<GetAvailableBookingDayResponse[]> => {
  const qs = buildQuery({ year, month });
  const url = `${schedulesBase()}/month/${photographerId}?${qs}`;

  const response = await authFetch(url, { method: 'GET' });
  if (!response.ok) throw new Error('예약 가능한 날짜를 불러올 수 없습니다.');

  return response.json();
}

export const getAvailableBookingTimes = async (
  { photographerId, date }: GetPhotographerDayDetailParams
): Promise<GetAvailableBookingTimeResponse[]> => {
  const qs = buildQuery({ date });
  const url = `${schedulesBase()}/day/${photographerId}?${qs}`;

  const response = await authFetch(url, { method: 'GET' });
  if (!response.ok) throw new Error('예약 가능한 시간을 불러올 수 없습니다.');

  return response.json();
}

export interface GetWeeklyScheduleRespnose {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export const getWeeklySchedule = async (
  photographerId: string,
): Promise<GetWeeklyScheduleRespnose[]> => {
  const response = await authFetch(`${schedulesBase()}/photographer/weekly/${photographerId}`, {
    method: 'GET'
  });

  if (!response.ok) throw new Error('주간 스케줄을 불러올 수 없습니다.');

  return response.json();
}

export const updateWeeklySchedule = async (
  photographerId: string, body: { schedules: PhotographerScheduleItem[] }
)=> {
  const response = await authFetch(`${schedulesBase()}/photographer/weekly/${photographerId}`, {
    method: 'POST',
    json: body
  });

  if (!response.ok) throw new Error('주간 스케줄을 업데이트할 수 없습니다.');
}

export const deletePersonalSchedule = async (id: number) => {
  const response = await authFetch(`${personalBase()}/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) throw new Error('개인 일정을 삭제할 수 없습니다.');
}

export interface PersonalSchedule {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  title: string;
  description: string;
}

export interface PersonalScheduleResponse extends PersonalSchedule {
  id: number;
}

export const getPersonalSchedule = async (id: number): Promise<PersonalScheduleResponse> => {
  const response = await authFetch(`${personalBase()}/${id}`, {
    method: 'GET'
  });

  if (!response.ok) throw new Error('개인 일정을 불러올 수 없습니다.');

  return response.json();
}

export const createPersonalSchedule = async (body: PersonalSchedule): Promise<number> => {
  const response = await authFetch(`${personalBase()}`, {
    method: 'POST',
    json: body
  });

  if (!response.ok) throw new Error('개인 일정을 생성할 수 없습니다.');

  return response.json();
}

export const updatePersonalSchedule = async (id: number, body: PersonalSchedule) => {
  const response = await authFetch(`${personalBase()}/${id}`, {
    method: 'PUT',
    json: body
  });

  if (!response.ok) throw new Error('개인 일정을 수정할 수 없습니다.');

}