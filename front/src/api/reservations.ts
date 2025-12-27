// src/api/reservations.ts
import { API_BASE_URL } from '@/config/api';
import { authFetch } from '@/api/utils';
import { GetPageable } from '@/api/community';
import { buildQuery } from '@/utils/format';

const RESERVATIONS_BASE = `${API_BASE_URL}/api/reservations`;


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

/** 예약 상태(작가가 변경하는 상태 포함) */
export type ReservationStatus =
  | 'REQUESTED' // 예약 요청
  | 'CONFIRMED' // 승인
  | 'REJECTED' // 거절
  | 'COMPLETED' // 촬영 완료
  | 'DELIVERED' // 사진 전달
  | 'REVIEWED'; // 리뷰 입력

/** 예약 리스트 아이템(현재는 고객/작가 구분 정보 없음) */
export interface ReservationListItem {
  reservationId: number;
  reservedDate: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  type: string;
}

export interface UserReservationListItem extends ReservationListItem {
  photographerName: string;
  photographerNickName: string;
}

export interface PhotographerReservationListItem extends ReservationListItem {
  userName: string;
  userNickname: string;
}

/** 고객용 예약 내역 조회 응답 */
export type GetUserReservationsResponse = PageResponse<UserReservationListItem>;

/** 작가용 예약 내역 조회 응답 */
export type GetPhotographerReservationsResponse = PageResponse<PhotographerReservationListItem>;

/** 예약 리스트 조회 파라미터(페이지네이션) */
export type GetReservationListParams = GetPageable;

/** 월별 예약 가능일 조회 응답 */
export interface GetMonthlyScheduleResponse {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // MONDAY, TUESDAY, ...
  status: string;
  note: string;
  available: boolean;
}

/** 특정 날짜의 예약 가능 시간 슬롯 */
export interface AvailableSlot {
  time: string;
  available: boolean;
}

/** 작가용 예약 상태 변경 요청 */
export interface PatchReservationStatusParams {
  reservationId: number;
  status: ReservationStatus;
}

/** 예약 생성 요청 */
export interface CreateReservationRequest {
  photographerId: string;
  shootingDate: string; // ISO date-time string
  options: number[];
  requirement: string;
  totalAmount: number;
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
export interface ReservationDetail {
  reservationId: number;
  photographerName: string;
  customerName: string;
  shootingOptions: string[];
  shootingDateTime: string; // "2025.11.03(월) 18:00"
  requirement: string;
  status: ReservationStatus;
}

/**
 * GET /api/reservations/list/user
 * 고객용 예약 내역 조회
 */
export const getUserReservations = async (
  pageable: GetReservationListParams,
): Promise<GetUserReservationsResponse> => {
  const qs = buildQuery(pageable);
  const url = qs
    ? `${RESERVATIONS_BASE}/list/user?${qs}`
    : `${RESERVATIONS_BASE}/list/user`;

  const response = await authFetch(url, { method: 'GET' });
  if (!response.ok) throw new Error(`Failed to get user reservations ${response.status}`);

  return response.json();
};

/**
 * GET /api/reservations/list/photographer
 * 작가용 예약 내역 조회
 */
export const getPhotographerReservations = async (
  pageable: GetReservationListParams,
): Promise<GetPhotographerReservationsResponse> => {
  const qs = buildQuery(pageable);
  const url = qs
    ? `${RESERVATIONS_BASE}/list/photographer?${qs}`
    : `${RESERVATIONS_BASE}/list/photographer`;

  const response = await authFetch(url, { method: 'GET' });
  if (!response.ok) throw new Error(`Failed to get photographer reservations ${response.status}`);

  return response.json();
};

/**
 * GET /api/reservations/monthly-schedule
 * 월별 예약 가능일 조회
 * query: photographerId, month(YYYY-MM)
 */
export const getMonthlySchedule = async (
  photographerId: string,
  month: string, // YYYY-MM
): Promise<GetMonthlyScheduleResponse[]> => {
  const qs = buildQuery({ photographerId, month });
  const url = qs
    ? `${RESERVATIONS_BASE}/monthly-schedule?${qs}`
    : `${RESERVATIONS_BASE}/monthly-schedule`;

  const response = await authFetch(url, { method: 'GET' });
  if (!response.ok) throw new Error(`Failed to get monthly schedule ${response.status}`);

  return response.json();
};

/**
 * GET /api/reservations/available-slots
 * 특정 날짜에 가능한 예약 시간 슬롯 조회
 * query: photographerId, date(YYYY-MM-DD)
 * response: AvailableSlot[]
 */
export const getAvailableSlots = async (
  photographerId: string,
  date: string, // YYYY-MM-DD
): Promise<AvailableSlot[]> => {
  const qs = buildQuery({ photographerId, date });
  const url = qs
    ? `${RESERVATIONS_BASE}/available-slots?${qs}`
    : `${RESERVATIONS_BASE}/available-slots`;

  const response = await authFetch(url, { method: 'GET' });
  if (!response.ok) throw new Error(`Failed to get available slots ${response.status}`);

  return response.json();
};

/**
 * PATCH /api/reservations/{reservationId}/status
 * 작가용 예약 상태 변경
 * body: { status }
 */
export const patchReservationStatus = async (
  params: PatchReservationStatusParams,
): Promise<void> => {
  const { reservationId, status } = params;

  const response = await authFetch(`${RESERVATIONS_BASE}/${reservationId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) throw new Error(`Failed to patch reservation status ${response.status}`);
};

/**
 * POST /api/reservations
 * 예약 생성
 */
export const createReservation = async (
  body: CreateReservationRequest,
): Promise<void> => {
  const response = await authFetch(`${RESERVATIONS_BASE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error(`Failed to create reservation ${response.status}`);
};

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
 *
 * ⚠️ multipart에서는 Content-Type을 직접 지정하지 마세요(boundary 깨짐)
 */
export const uploadReservationZip = async (
  params: UploadReservationZipRequest,
): Promise<void> => {
  const formData = new FormData();

  formData.append('zipFile', {
    uri: params.zipFile.uri,
    name: params.zipFile.name,
    type: params.zipFile.type ?? 'application/zip',
  } as any);

  const response = await authFetch(`${RESERVATIONS_BASE}/${params.reservationId}/photos`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload reservation zip ${response.status}`);
  }
};

/**
 * GET /api/reservations/{reservationId}
 * 예약 상세 조회
 */
export const getReservationDetail = async (
  reservationId: number,
): Promise<ReservationDetail> => {
  const response = await authFetch(`${RESERVATIONS_BASE}/${reservationId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to get reservation detail ${response.status}`);
  }

  return response.json();
};