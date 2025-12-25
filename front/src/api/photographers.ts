// src/api/photographers.ts
import { API_BASE_URL } from '@/config/api';
import { authFetch } from '@/api/utils';
import { buildQuery } from '@/utils/format';

const PHOTOGRAPHERS_BASE = `${API_BASE_URL}/api/photographers`;

/* ---------------------------------------------
 * Common: Spring Page types (재사용)
 * -------------------------------------------- */

export interface SortItem {
  direction: string;
  nullHandling: string;
  ascending: boolean;
  property: string;
  ignoreCase: boolean;
}

export interface PageableInfo {
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  unpaged: boolean;
  offset: number;
  sort: SortItem[];
}

export interface PageResponse<T> {
  totalPages?: number; // 어떤 응답은 totalPages/totalElements가 없어서 optional로 둠(스펙 상 혼재)
  totalElements?: number;

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

/** 목록 조회용 pageable params */
export interface GetPageable {
  page?: number;
  size?: number;
  sort?: string[]; // e.g. ['createdAt,DESC']
}

/* ---------------------------------------------
 * Common: Spring LocalTime
 * -------------------------------------------- */

export interface LocalTime {
  hour: number;
  minute: number;
  second: number;
  nano: number;
}

/* ---------------------------------------------
 * 1) GET /{photographerId}/profile
 * 작가 프로필 상세 조회 (+ 포트폴리오 썸네일 목록, paging params 존재)
 * -------------------------------------------- */

export interface PhotographerPortfolioThumb {
  id: number;
  thumbnailUrl: string;
}

export interface GetPhotographerProfileResponse {
  nickname: string;
  profileImageUrl: string;
  description: string;
  responseRate: number;
  responseTime: string;
  portfolioCount: number;
  reviewCount: number;
  portfolios: PhotographerPortfolioThumb[];
}

/**
 * GET /api/photographers/{photographerId}/profile
 * 작가 프로필 상세 조회
 *
 * query: page(0..), size, sort (기본 createdAt,DESC)
 */
export const getPhotographerProfile = async (
  photographerId: string,
  pageable?: GetPageable,
): Promise<GetPhotographerProfileResponse> => {
  const qs = buildQuery(pageable ?? {});
  const url = qs
    ? `${PHOTOGRAPHERS_BASE}/${photographerId}/profile?${qs}`
    : `${PHOTOGRAPHERS_BASE}/${photographerId}/profile`;

  const response = await authFetch(url, { method: 'GET' });
  if (!response.ok) throw new Error(`Failed to get photographer profile ${response.status}`);

  return response.json();
};

/* ---------------------------------------------
 * 2) PATCH /profile-image
 * 작가 프로필 사진 업로드/변경 (multipart)
 * -------------------------------------------- */

export interface PatchPhotographerProfileImageParams {
  image: {
    uri: string;
    name: string;
    type: string; // e.g. 'image/jpeg'
  };
}

/**
 * PATCH /api/photographers/profile-image
 * 작가 프로필 사진 업로드/변경
 *
 * multipart/form-data: image
 * ⚠️ Content-Type 직접 지정하지 말기(boundary 깨짐)
 */
export const patchPhotographerProfileImage = async (
  params: PatchPhotographerProfileImageParams,
): Promise<void> => {
  const formData = new FormData();
  formData.append('image', {
    uri: params.image.uri,
    name: params.image.name,
    type: params.image.type,
  } as any);

  const response = await authFetch(`${PHOTOGRAPHERS_BASE}/profile-image`, {
    method: 'PATCH',
    body: formData,
  });

  if (!response.ok) throw new Error(`Failed to patch profile image ${response.status}`);
};

/* ---------------------------------------------
 * 3) POST /sign
 * 작가 기본 정보 등록
 * -------------------------------------------- */

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface PhotographerScheduleItem {
  dayOfWeek: DayOfWeek;
  startTime: LocalTime;
  endTime: LocalTime;
}

/**
 * swagger에 isEnhanced 값이 "일부제공"처럼 문자열로 보였어서 string으로 둠.
 * 서버가 boolean/enum이면 이후 좁혀도 됨.
 */
export interface PhotographerSignRequest {
  description: string;
  basePrice: number;
  baseTime: number;
  basePeople: number;
  regionId: number[];
  conceptId: number[];
  schedules: PhotographerScheduleItem[];
  isPublicHolidays: boolean;
  isOriginal: boolean;
  isEnhanced: string;
  enhancedTime: string;
  enhancedPermission: string;
}

/**
 * POST /api/photographers/sign
 * 작가 기본 정보 등록
 */
export const signPhotographer = async (
  body: PhotographerSignRequest,
): Promise<void> => {
  const response = await authFetch(`${PHOTOGRAPHERS_BASE}/sign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error(`Failed to sign photographer ${response.status}`);
};

/* ---------------------------------------------
 * 4) POST /search
 * 작가 검색 (pageable param + body filter)
 * -------------------------------------------- */

export type Gender = 'MAN' | 'WOMAN';

export interface SearchPhotographersBody {
  gender?: Gender;
  regionIds?: number[];
  conceptIds?: number[];
  maxPrice?: number;
  minPrice?: number;
  query?: string;
}

export interface PhotographerSearchItem {
  id: string; // photographerId
  nickname: string;
  profileImageUrl: string;
  averageRating: number;
  reviewCount: number;
  basePrice: number;
  baseTime: number;
  gender: Gender;
  concepts: string[];
  portfolioImages: string[];
}

export type SearchPhotographersResponse = PageResponse<PhotographerSearchItem>;

/**
 * POST /api/photographers/search
 *
 * query: page, size, sort (pageable)
 * body: SearchPhotographersBody
 */
export const searchPhotographers = async (
  pageable: GetPageable,
  body: SearchPhotographersBody,
): Promise<SearchPhotographersResponse> => {
  const qs = buildQuery(pageable);
  const url = qs ? `${PHOTOGRAPHERS_BASE}/search?${qs}` : `${PHOTOGRAPHERS_BASE}/search`;

  const response = await authFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error(`Failed to search photographers ${response.status}`);
  return response.json();
};

/* ---------------------------------------------
 * 5) POST /portfolios
 * 포트폴리오 게시글 업로드 (multipart: request + images[])
 * -------------------------------------------- */

export interface CreatePortfolioRequest {
  content: string;
}

export interface UploadImageFile {
  uri: string;
  name: string;
  type: string;
}

export interface CreatePortfolioParams {
  request: CreatePortfolioRequest;
  images: UploadImageFile[];
}

/**
 * POST /api/photographers/portfolios
 *
 * multipart/form-data:
 * - request: JSON (content)
 * - images: array(files)
 */
export const createPortfolio = async (
  params: CreatePortfolioParams,
): Promise<void> => {
  const formData = new FormData();

  // request(JSON)
  formData.append('request', JSON.stringify(params.request));

  // images(files) - 같은 key로 여러 번 append
  params.images.forEach((img) => {
    formData.append('images', {
      uri: img.uri,
      name: img.name,
      type: img.type,
    } as any);
  });

  const response = await authFetch(`${PHOTOGRAPHERS_BASE}/portfolios`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error(`Failed to create portfolio ${response.status}`);
};

/* ---------------------------------------------
 * 6) GET /{photographerId}/reviews  (paging)
 * 작가 전체 리뷰 목록 조회
 * -------------------------------------------- */

export interface ReviewReply {
  content: string;
  createdAt: string;
}

export interface PhotographerReviewItem {
  reviewId: number;
  writerNickname: string;
  writerProfileKey: string;
  rating: number;
  createdAt: string;
  shootingTag: string;
  content: string;
  photoKeys: string[];
  reply?: ReviewReply | null;
}

export type GetPhotographerReviewsResponse = PageResponse<PhotographerReviewItem>;

/**
 * GET /api/photographers/{photographerId}/reviews
 * 작가 전체 리뷰 목록 조회 (paging)
 */
export const getPhotographerReviews = async (
  photographerId: string,
  pageable: GetPageable,
): Promise<GetPhotographerReviewsResponse> => {
  const qs = buildQuery(pageable);
  const url = qs
    ? `${PHOTOGRAPHERS_BASE}/${photographerId}/reviews?${qs}`
    : `${PHOTOGRAPHERS_BASE}/${photographerId}/reviews`;

  const response = await authFetch(url, { method: 'GET' });
  if (!response.ok) throw new Error(`Failed to get photographer reviews ${response.status}`);

  return response.json();
};

/* ---------------------------------------------
 * 7) GET /{photographerId}/reviews/summary
 * 작가 리뷰 요약 조회
 * -------------------------------------------- */

export interface LatestReviewSummaryItem {
  content: string;
  photoKey: string;
  createdAt: string; // '2025-12-24'
}

export interface GetPhotographerReviewSummaryResponse {
  averageRating: number;
  totalReviewCount: number;
  topPhotoKeys: string[];
  latestReviews: LatestReviewSummaryItem[];
}

/**
 * GET /api/photographers/{photographerId}/reviews/summary
 * 작가 리뷰 요약(평균 별점, 전체 리뷰 수, 최신 사진 10개, 최신 리뷰 5개)
 */
export const getPhotographerReviewSummary = async (
  photographerId: string,
): Promise<GetPhotographerReviewSummaryResponse> => {
  const response = await authFetch(`${PHOTOGRAPHERS_BASE}/${photographerId}/reviews/summary`, {
    method: 'GET',
  });

  if (!response.ok) throw new Error(`Failed to get photographer review summary ${response.status}`);

  return response.json();
};