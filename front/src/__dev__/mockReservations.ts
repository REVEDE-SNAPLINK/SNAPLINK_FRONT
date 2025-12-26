import type {
  UserReservationListItem,
  PhotographerReservationListItem,
  PageResponse,
  ReservationDetail,
  GetReservationPhotosResponse,
} from '@/api/reservations';
import { mockPhotographers } from './mockPhotographers';

/**
 * 개발 모드용 더미 예약 데이터
 */

// 고객용 예약 목록
let mockUserReservations: UserReservationListItem[] = [
  {
    reservationId: 1,
    reservedDate: '2025-02-01',
    startTime: '14:00',
    endTime: '16:00',
    status: 'CONFIRMED',
    type: '프로필 촬영',
    photographerName: '김작가',
    photographerNickname: '김작가',
  },
  {
    reservationId: 2,
    reservedDate: '2025-01-20',
    startTime: '10:00',
    endTime: '13:00',
    status: 'COMPLETED',
    type: '가족 촬영',
    photographerName: '이사진',
    photographerNickname: '이사진',
  },
  {
    reservationId: 3,
    reservedDate: '2025-01-15',
    startTime: '15:00',
    endTime: '18:00',
    status: 'REVIEWED',
    type: '웨딩 촬영',
    photographerName: '박스냅',
    photographerNickname: '박스냅',
  },
  {
    reservationId: 4,
    reservedDate: '2025-01-05',
    startTime: '11:00',
    endTime: '13:00',
    status: 'REJECTED',
    type: '커플 촬영',
    photographerName: '최포토',
    photographerNickname: '최포토',
  },
];

// 작가용 예약 목록
let mockPhotographerReservations: PhotographerReservationListItem[] = [
  {
    reservationId: 1,
    reservedDate: '2025-02-01',
    startTime: '10:00',
    endTime: '12:00',
    status: 'CONFIRMED',
    type: '프로필 촬영',
    userName: '홍길동',
    userNickname: '고객A',
  },
  {
    reservationId: 2,
    reservedDate: '2025-01-25',
    startTime: '14:00',
    endTime: '16:00',
    status: 'COMPLETED',
    type: '가족 촬영',
    userName: '김철수',
    userNickname: '고객B',
  },
];

// 예약 상세 정보
const mockReservationDetails: Record<number, ReservationDetail> = {
  1: {
    reservationId: 1,
    photographerName: '김작가',
    shootingOptions: ['기본 촬영', '보정 포함'],
    shootingDateTime: '2025.02.01(토) 14:00',
    requirement: '자연스러운 분위기로 촬영해주세요.',
    status: 'CONFIRMED',
  },
  2: {
    reservationId: 2,
    photographerName: '이사진',
    shootingOptions: ['기본 촬영', '가족 4인'],
    shootingDateTime: '2025.01.20(월) 10:00',
    requirement: '아이들이 어려서 짧게 진행 부탁드립니다.',
    status: 'COMPLETED',
  },
};

// 예약 사진 데이터
const mockReservationPhotos: Record<number, GetReservationPhotosResponse> = {
  2: {
    zip: {
      id: 1,
      url: 'https://example.com/photos.zip',
      fileCount: 50,
    },
    photos: [
      { id: 1, url: 'https://picsum.photos/800/600?random=1', sortOrder: 1 },
      { id: 2, url: 'https://picsum.photos/800/600?random=2', sortOrder: 2 },
      { id: 3, url: 'https://picsum.photos/800/600?random=3', sortOrder: 3 },
      { id: 4, url: 'https://picsum.photos/800/600?random=4', sortOrder: 4 },
      { id: 5, url: 'https://picsum.photos/800/600?random=5', sortOrder: 5 },
    ],
    photoConfirmed: true,
  },
  3: {
    zip: null,
    photos: [
      { id: 6, url: 'https://picsum.photos/800/600?random=6', sortOrder: 1 },
      { id: 7, url: 'https://picsum.photos/800/600?random=7', sortOrder: 2 },
    ],
    photoConfirmed: false,
  },
};

/**
 * 고객 예약 목록 조회 (페이지네이션)
 */
export const getMockUserReservationsPage = (
  page: number = 0,
  size: number = 10,
): PageResponse<UserReservationListItem> => {
  const startIndex = page * size;
  const endIndex = startIndex + size;
  const paginatedItems = mockUserReservations.slice(startIndex, endIndex);

  return {
    content: paginatedItems,
    totalPages: Math.ceil(mockUserReservations.length / size),
    totalElements: mockUserReservations.length,
    size: size,
    number: page,
    numberOfElements: paginatedItems.length,
    first: page === 0,
    last: endIndex >= mockUserReservations.length,
    empty: paginatedItems.length === 0,
    pageable: {
      pageNumber: page,
      pageSize: size,
      sort: [],
      offset: startIndex,
      paged: true,
      unpaged: false,
    },
    sort: [],
  };
};

/**
 * 작가 예약 목록 조회 (페이지네이션)
 */
export const getMockPhotographerReservationsPage = (
  page: number = 0,
  size: number = 10,
): PageResponse<PhotographerReservationListItem> => {
  const startIndex = page * size;
  const endIndex = startIndex + size;
  const paginatedItems = mockPhotographerReservations.slice(startIndex, endIndex);

  return {
    content: paginatedItems,
    totalPages: Math.ceil(mockPhotographerReservations.length / size),
    totalElements: mockPhotographerReservations.length,
    size: size,
    number: page,
    numberOfElements: paginatedItems.length,
    first: page === 0,
    last: endIndex >= mockPhotographerReservations.length,
    empty: paginatedItems.length === 0,
    pageable: {
      pageNumber: page,
      pageSize: size,
      sort: [],
      offset: startIndex,
      paged: true,
      unpaged: false,
    },
    sort: [],
  };
};

/**
 * 예약 상세 조회
 */
export const getMockReservationDetail = (reservationId: number): ReservationDetail | null => {
  return mockReservationDetails[reservationId] || null;
};

/**
 * 예약 사진 조회
 */
export const getMockReservationPhotos = (reservationId: number): GetReservationPhotosResponse | null => {
  return mockReservationPhotos[reservationId] || null;
};

/**
 * 예약 상태 변경
 */
export const updateMockReservationStatus = (
  reservationId: number,
  status: string,
  isPhotographer: boolean = false,
): boolean => {
  const reservations = isPhotographer ? mockPhotographerReservations : mockUserReservations;
  const index = reservations.findIndex((r) => r.reservationId === reservationId);

  if (index === -1) return false;

  reservations[index] = {
    ...reservations[index],
    status: status as any,
  };

  if (mockReservationDetails[reservationId]) {
    mockReservationDetails[reservationId].status = status as any;
  }

  return true;
};

/**
 * 예약 취소
 */
export const cancelMockReservation = (reservationId: number): boolean => {
  return updateMockReservationStatus(reservationId, 'CANCELLED');
};

/**
 * 예약 생성 (고객)
 */
export const createMockReservation = (
  photographerId: string,
  shootingDate: string,
  type: string,
): UserReservationListItem => {
  const newId = Math.max(...mockUserReservations.map((r) => r.reservationId), 0) + 1;

  // 실제 작가 데이터에서 정보 가져오기
  const photographer = mockPhotographers.find((p) => p.id === photographerId);
  const photographerNickname = photographer?.nickname || `작가${photographerId}`;

  const newReservation: UserReservationListItem = {
    reservationId: newId,
    reservedDate: shootingDate.split('T')[0],
    startTime: '14:00',
    endTime: '16:00',
    status: 'CONFIRMED',
    type: type,
    photographerName: photographerNickname,
    photographerNickname: photographerNickname,
  };

  mockUserReservations.unshift(newReservation);
  return newReservation;
};
