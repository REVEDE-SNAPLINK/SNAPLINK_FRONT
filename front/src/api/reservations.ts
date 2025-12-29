// src/api/reservations.ts
import { API_BASE_URL } from '@/config/api';
import { authFetch, authMultipartFetch } from '@/api/utils';
import { GetPageable } from '@/api/community';
import { buildQuery } from '@/utils/format';
import RNBlobUtil from 'react-native-blob-util';

const BOOKINGS_BASE = `${API_BASE_URL}/api/bookings`
const RESERVATIONS_BASE = `${API_BASE_URL}/api/reservations`;
const SCHEDULES_BASE = `${API_BASE_URL}/api/schedules`;


/** Spring Page 응답에 포함되는 Sort 요소 */
export interface SortItem {
  direction: string; // 보통 'ASC' | 'DESC'
  nullHandling: string;
  ascending: boolean;
  property: string;
  ignoreCase: boolean;
}

/** Spring Page 응답에 포함되는 Pageable 정보 */
export interface PageableInfo {
  pageNumber: number;
  pageSize: number;
  unpaged: boolean;
  paged: boolean;
  offset: number;
  sort: SortItem[];
}

/** Spring PageResponse 공통 제네릭 */
export interface PageResponse<T> {
  totalPages: number;
  totalElements: number;

  pageable: PageableInfo;

  numberOfElements: number;
  size: number;
  number: number;

  sort: SortItem[];

  first: boolean;
  last: boolean;
  empty: boolean;

  content: T[];
}

export type BookingStatus =
  | 'WAITING_FOR_APPROVAL' // 예약 요청
  | 'APPROVED' // 승인
  | 'REJECTED' // 거절
  | 'CANCELLED' // 촬영 완료
  | 'COMPLETED' // 촬영 완료
  | 'PHOTOS_DELIVERED' // 사진 전달
  | 'USER_PHOTO_CHECK'; // 사용자가 사진을 승인함

/** 예약 리스트 아이템(현재는 고객/작가 구분 정보 없음) */
export interface BookingListItem {
  bookingId: number;
  shootingDate: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  type: string;
  status: BookingStatus;
}

export interface UserBookingListItem extends BookingListItem {
  photographerName: string;
  photographerNickName: string;
  isreview: boolean;
}

export interface PhotographerBookingListItem extends BookingListItem {
  customerName: string;
}

/** 고객용 예약 내역 조회 응답 */
export type GetUserBookingsResponse = PageResponse<UserBookingListItem>;

/** 작가용 예약 내역 조회 응답 */
export type GetPhotographerBookingsResponse = PageResponse<PhotographerBookingListItem>;

/** 예약 리스트 조회 파라미터(페이지네이션) */
export type GetBookingListParams = GetPageable;

/** 월별 예약 가능일 조회 응답 */
export interface GetMonthlyScheduleResponse {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // MONDAY, TUESDAY, ...
  holidayName: string;
  holiday: boolean;
  available: boolean;
}

/** 특정 날짜의 예약 가능 시간 슬롯 */
export interface AvailableDay {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface PatchBookingStatusParams {
  bookingId: number;
}

export interface RejectOrCancelBookingParams extends PatchBookingStatusParams {
  reason: string;
}

/** 예약 생성 요청 */
export interface CreateReservationRequest {
  photographerId: string;
  shootingDate: string; // ISO date-time string
  options: number[];
  requirement: string;
  totalAmount: number;
}

export interface BookingRequestOption {
  id: number;
  count: number;
}

export interface CreateBookingRequest {
  photographerId: string;
  productId: string;
  optionIds: BookingRequestOption[];
  shootingDate: string; // ISO date-time string
  startTime: string;
  requestDetails: string;
}

/** 예약 ZIP 정보 */
export interface ReservationZip {
  id: number;
  url: string;
  fileCount: number;
}

/** 예약 사진 아이템 */
export interface ReservationPhoto {
  id: number;
  url: string;
  sortOrder: number;
}

/** 예약 사진 및 ZIP 조회 응답 */
export interface GetReservationPhotosResponse {
  zip: ReservationZip | null;
  photos: ReservationPhoto[];
  photoConfirmed: boolean;
}

/** 예약 사진 일괄 삭제 요청 */
export interface DeleteReservationPhotosRequest {
  reservationId: number;
  photoIds: number[];
}

/** 예약 결과 ZIP 업로드 요청 (multipart/form-data) */
export interface UploadReservationZipRequest {
  reservationId: number;
  zipFile: {
    uri: string;
    name: string;
    type: string; // 'application/zip'
  };
}

/** 예약 상세 조회 응답 */
export interface BookingDetail {
  bookingId: number;
  customerName: string;
  photographerName: string;
  shootingItems: string;
  shootingDate: string;
  startTime: string;
  endTime: string;
  requestDetails: string;
  status: BookingStatus;
  isreview: boolean;
}

/**
 * GET /api/bookings/list/user
 * 고객용 예약 내역 조회
 */
export const getUserBookings = async (
  pageable: GetBookingListParams,
): Promise<GetUserBookingsResponse> => {
  const qs = buildQuery(pageable);
  const url = qs
    ? `${BOOKINGS_BASE}/list/user?${qs}`
    : `${BOOKINGS_BASE}/list/user`;

  const response = await authFetch(url, { method: 'GET' });
  if (!response.ok) throw new Error(`Failed to get user bookings ${response.status}`);

  return response.json();
};

/**
 * GET /api/bookings/list/photographer
 * 작가용 예약 내역 조회
 */
export const getPhotographerBookings = async (
  pageable: GetBookingListParams,
): Promise<GetPhotographerBookingsResponse> => {
  const qs = buildQuery(pageable);
  const url = qs
    ? `${BOOKINGS_BASE}/list/photographer?${qs}`
    : `${BOOKINGS_BASE}/list/photographer`;

  const response = await authFetch(url, { method: 'GET' });
  if (!response.ok) throw new Error(`Failed to get photographer bookings ${response.status}`);

  return response.json();
};

/**
 * GET /api/schedules/month/{photographerId}
 * 월별 예약 가능일 조회
 * query: year, month
 */
export const getMonthlySchedule = async (
  photographerId: string,
  year: string,
  month: string
): Promise<GetMonthlyScheduleResponse[]> => {
  const qs = buildQuery({ year, month });
  const url = `${SCHEDULES_BASE}/month/${photographerId}?${qs}`;

  const response = await authFetch(url, { method: 'GET' });
  if (!response.ok) throw new Error(`Failed to get monthly schedule ${response.status}`);

  return response.json();
};

/**
 * GET /api/schedules/day/{photographerId}
 * 특정 날짜에 가능한 예약 시간 슬롯 조회
 * query: date (YYYY-MM-DD)
 */
export const getAvailableDays = async (
  photographerId: string,
  date: string, // YYYY-MM-DD
): Promise<AvailableDay[]> => {
  const qs = buildQuery({ date });
  const url = `${SCHEDULES_BASE}/day/${photographerId}?${qs}`;

  const response = await authFetch(url, { method: 'GET' });
  if (!response.ok) throw new Error(`Failed to get available days ${response.status}`);

  return response.json();
};

/**
 * PATCH /api/bookings/{bookingId}/reject
 * 작가가 예약 거절
 */
export const rejectBooking = async (
  params: RejectOrCancelBookingParams
) => {
  const { bookingId, reason } = params;

  const response = await authFetch(`${BOOKINGS_BASE}/${bookingId}/reject`, {
    method: 'PATCH',
    json: { reason },
  });

  if (!response.ok) throw new Error(`Failed to reject booking ${response.status}`);
}

/**
 * PATCH /api/bookings/{bookingId}/complete
 * 작가가 촬영 완료 처리
 */
export const completeBooking = async (
  params: PatchBookingStatusParams
) => {
  const { bookingId } = params;

  const response = await authFetch(`${BOOKINGS_BASE}/${bookingId}/complete`, {
    method: 'PATCH',
  });

  if (!response.ok) throw new Error(`Failed to complete booking ${response.status}`);
}

/**
 * PATCH /api/bookings/{bookingId}/cancel
 * 고객이 예약 취소
 */
export const cancelBooking = async (
  params: RejectOrCancelBookingParams
) => {
  const { bookingId, reason } = params;

  const response = await authFetch(`${BOOKINGS_BASE}/${bookingId}/cancel`, {
    method: 'PATCH',
    json: { reason },
  });

  if (!response.ok) throw new Error(`Failed to cancel booking ${response.status}`);
}

/**
 * PATCH /api/bookings/{bookingId}/approve
 * 작가가 예약 승인
 */
export const approveBooking = async (
  params: PatchBookingStatusParams
) => {
  const { bookingId } = params;

  const response = await authFetch(`${BOOKINGS_BASE}/${bookingId}/approve`, {
    method: 'PATCH',
  });

  if (!response.ok) throw new Error(`Failed to approve booking ${response.status}`);
}

/**
 * PATCH /api/bookings/{bookingId}/deliver
 * 작가가 사진 전달 완료 처리
 */
export const deliverPhotos = async (
  params: PatchBookingStatusParams
) => {
  const { bookingId } = params;

  const response = await authFetch(`${BOOKINGS_BASE}/${bookingId}/deliver`, {
    method: 'PATCH',
  });

  if (!response.ok) throw new Error(`Failed to deliver photos ${response.status}`);
}

/**
 * POST /api/bookings
 * 예약 생성
 */
export const createBooking = async (
  body: CreateBookingRequest
)=> {
  const response = await authFetch(`${BOOKINGS_BASE}`, {
    method: 'POST',
    json: body,
  });

  if (!response.ok) throw new Error(`Failed to create booking ${response.status}`);
}

/**
 * GET /api/reservations/{reservationId}/photos
 * 예약 사진 및 ZIP 조회
 * response: { zip, photos, photoConfirmed }
 */
export const getReservationPhotos = async (
  reservationId: number,
): Promise<GetReservationPhotosResponse> => {
  const response = await authFetch(`${RESERVATIONS_BASE}/${reservationId}/photos`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to get reservation photos ${response.status}`);
  }

  return response.json();
};

/**
 * DELETE /api/reservations/photos
 * 예약 ID + 사진 ID 리스트로 일괄 삭제하고 ZIP을 갱신
 * body: { reservationId, photoIds }
 */
export const deleteReservationPhotos = async (
  body: DeleteReservationPhotosRequest,
): Promise<void> => {
  const response = await authFetch(`${RESERVATIONS_BASE}/photos`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Failed to delete reservation photos ${response.status}`);
  }
};

/**
 * POST /api/reservations/{reservationId}/photos
 * 작가가 결과 ZIP 파일을 업로드(multipart/form-data)
 * form-data: zipFile
 */
export const uploadReservationZip = async (
  params: UploadReservationZipRequest,
): Promise<void> => {
  const response = await authMultipartFetch(
    `${RESERVATIONS_BASE}/${params.reservationId}/photos`,
    [
      {
        name: 'zipFile',
        filename: params.zipFile.name,
        type: params.zipFile.type ?? 'application/zip',
        data: RNBlobUtil.wrap(params.zipFile.uri),
      },
    ],
    'POST',
  );

  if (response.info().status >= 400) {
    throw new Error(`Failed to upload reservation zip ${response.info().status}`);
  }
};

/**
 * GET /api/bookings/{bookingId}
 * 예약 상세 조회
 */
export const getBookingDetail = async (
  bookingId: number,
): Promise<BookingDetail> => {
  const response = await authFetch(`${BOOKINGS_BASE}/${bookingId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to get booking detail ${response.status}`);
  }

  return response.json();
};