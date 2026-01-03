// src/api/bookings.ts
import { API_BASE_URL } from '@/config/api';
import { authFetch, authMultipartFetch, toBlobPath } from '@/api/utils';
import { GetPageable } from '@/api/community';
import { buildQuery } from '@/utils/format';
import RNBlobUtil from 'react-native-blob-util';
import { UploadImageFile } from '@/api/reviews.ts';

const BOOKINGS_BASE = `${API_BASE_URL}/api/bookings`
const PHOTOS_BASE = `${API_BASE_URL}/api/booking/photos`;


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
  | 'CANCELLED' // 촬영 취소
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

export interface BookingRequestOption {
  id: number;
  count: number;
}

export interface CreateBookingRequest {
  photographerId: string;
  productId: number;
  options: BookingRequestOption[];
  shootingDate: string; // ISO date-time string
  startTime: string;
  requestDetails: string;
}

/** 예약 ZIP 정보 */
export interface BookingZip {
  id: number;
  url: string;
  fileCount: number;
}

/** 예약 사진 아이템 */
export interface BookingPhoto {
  id: number;
  url: string;
  sortOrder: number;
}

/** 예약 사진 및 ZIP 조회 응답 */
export interface GetBookingPhotosResponse {
  zip: BookingZip | null;
  photos: BookingPhoto[];
  photoConfirmed: boolean;
}

/** 예약 사진 일괄 삭제 요청 */
export interface UpdateBookingPhotosRequest {
  deletePhotoIds: number[];
  newPhotos: UploadImageFile[];
}

/** 예약 결과 ZIP 업로드 요청 (multipart/form-data) */
export interface UploadBookingZipRequest {
  bookingId: number;
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

  if (!response.ok) throw new Error(`Failed to create booking ${response.status} ${response.statusText}`);
}

/**
 * GET /api/bookings/photos/{bookingId}
 * 예약 사진 및 ZIP 조회
 * response: { zip, photos, photoConfirmed }
 */
export const getBookingPhotos = async (
  bookingId: number,
): Promise<GetBookingPhotosResponse> => {
  const response = await authFetch(`${PHOTOS_BASE}/${bookingId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to get booking photos ${response.status}`);
  }

  return response.json();
};

/**
 * POST /api/booking/photos/{bookingId}/update
 * 사진 추가 및 삭제
 * body: { deletePhotoIds, newPhotos }
 */
export const updateBookingPhotos = async (
  bookingId: number,
  body: UpdateBookingPhotosRequest,
): Promise<void> => {
  const photoParts = await Promise.all(
    body.newPhotos.map(async (photo) => {
      const path = await toBlobPath(photo.uri);
      // 실제로 존재하는지 확인(디버깅에 도움)
      await RNBlobUtil.fs.stat(path);

      return {
        name: 'newPhotos',
        filename: photo.name ?? 'photo.jpg',
        type: photo.type,
        data: RNBlobUtil.wrap(path),
      };
    }),
  );

  const parts = [
    {
      name: 'deletePhotoIds',
      type: 'application/json',
      data: JSON.stringify(body.deletePhotoIds),
    },
    ...photoParts,
  ];

  const response = await authMultipartFetch(
    `${PHOTOS_BASE}/${bookingId}/update`,
    parts,
    'POST',
  );

  if (response.info().status >= 400) {
    throw new Error(`Failed to update booking photos ${response.info().status}`);
  }
};

/**
 * POST /api/bookings/photos/{bookingId}
 * 작가가 결과 ZIP 파일을 업로드(multipart/form-data)
 * form-data: zipFile
 */
export const uploadBookingZip = async (params: UploadBookingZipRequest): Promise<void> => {
  const path = await toBlobPath(params.zipFile.uri);
  await RNBlobUtil.fs.stat(path);

  const response = await authMultipartFetch(
    `${PHOTOS_BASE}/${params.bookingId}`,
    [
      {
        name: 'zipFile',
        filename: params.zipFile.name,
        type: params.zipFile.type ?? 'application/zip',
        data: RNBlobUtil.wrap(path),
      },
    ],
    'POST',
  );

  if (response.info().status >= 400) {
    throw new Error(`Failed to upload booking zip ${response.info().status}`);
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