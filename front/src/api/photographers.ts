// src/api/photographers.ts
import { API_BASE_URL } from '@/config/api';
import { authFetch, authMultipartFetch, MultipartPart } from '@/api/utils';
import { buildQuery, generateImageFilename, normalizeImageMime } from '@/utils/format';
import RNBlobUtil from 'react-native-blob-util';
import { EditingDeadline, EditingType, SelectionAuthority } from '@/api/shootings.ts';
import { GetRegionsResponse } from '@/api/regions.ts';

const PHOTOGRAPHERS_BASE = `${API_BASE_URL}/api/photographers`;
const PORTFOLIOS_BASE = `${PHOTOGRAPHERS_BASE}/portfolios`;
const REVIEWS_BASE = `${API_BASE_URL}/api/reviews/photographers`;
const HOLIDAYS_BASE = `${PHOTOGRAPHERS_BASE}/holidays`;

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
  scrapped: boolean;
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
  if (!response.ok) throw new Error('작가 프로필을 불러올 수 없습니다.');

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
 * @returns CloudFront key (string)
 */
export const patchPhotographerProfileImage = async (
  params: PatchPhotographerProfileImageParams,
): Promise<string> => {
  // Remove file:// prefix for RNBlobUtil.wrap()
  let filePath = params.image.uri;
  if (filePath.startsWith('file://')) {
    filePath = filePath.replace('file://', '');
  }

  // Check file size for warnings
  try {
    const stat = await RNBlobUtil.fs.stat(filePath);
    if (stat.size > 5 * 1024 * 1024) {
      const fileSizeMB = (stat.size / 1024 / 1024).toFixed(2);
      console.warn(`⚠️ Profile image size: ${fileSizeMB} MB - may cause 413 error`);
    }
  } catch (e) {
    console.error('Failed to check file size:', e);
  }

  const parts: MultipartPart[] = [
    {
      name: 'image',
      filename: generateImageFilename(params.image.type, 'photographer_profile_image_'),
      type: normalizeImageMime(params.image.type),
      data: RNBlobUtil.wrap(filePath),
    },
  ];

  const response = await authMultipartFetch(
    `${PHOTOGRAPHERS_BASE}/profile-image`,
    parts,
    'PATCH',
  );

  if (response.info().status < 200 || response.info().status >= 300) {
    throw new Error('프로필 사진을 업데이트할 수 없습니다.');
  }

  // CloudFront key 반환
  return response.text();
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
  startTime: string;
  endTime: string;
}

export interface ShootingOption {
  name: string;
  description: string;
  price: number;
  additionalTime: number;
}

export interface ShootingProduct {
  name: string;
  basePrice: number;
  description: string;
  photoTime: number;
  personnel: number;
  providesRawFile: boolean;
  editingType: EditingType,
  editingDeadline: EditingDeadline;
  providedEditCount: number;
  selectionAuthority: SelectionAuthority;
  options: ShootingOption[];
}

export interface PhotographerSignRequest {
  description: string;
  regionIds: number[];
  conceptIds: number[];
  schedules: PhotographerScheduleItem[];
  isPublicHolidays: boolean;
  tag: number[]; // Array of tag IDs
  shootingProduct: ShootingProduct;
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

  if (!response.ok) throw new Error('작가 등록을 완료할 수 없습니다.');
};

/* ---------------------------------------------
 * 4) POST /search
 * 작가 검색 (pageable param + body filter)
 * -------------------------------------------- */

export type Gender = 'MALE' | 'FEMALE';

export interface SearchPhotographersBody {
  gender: Gender | null;
  regionIds: number[] | null;
  conceptIds: number[] | null;
  maxPrice: number | null;
  minPrice: number | null;
  query: string | null;
  sort: "RECOMMENDED" | "LATEST" | "REVIEW" | "MAXPRICE" | "MINPRICE";
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

  if (!response.ok) throw new Error('작가 검색을 완료할 수 없습니다.');
  return response.json();
};

/* ---------------------------------------------
 * 5) POST /portfolios
 * 포트폴리오 게시글 업로드 (multipart: request + images[])
 * -------------------------------------------- */

export interface UploadImageFile {
  uri: string;
  name: string;
  type: string;
}

export interface CreatePortfolioParams {
  content: string;
  isLinked: boolean;
  images: UploadImageFile[];
}

/**
 * POST /api/photographers/portfolios
 *
 * multipart/form-data:
 * - title: JSON
 * - content: JSON
 * - isLinked: JSON
 * - images: array(files)
 */
export const createPortfolio = async (
  params: CreatePortfolioParams,
): Promise<void> => {
  // Check file sizes for warnings
  for (let i = 0; i < params.images.length; i++) {
    const img = params.images[i];
    let filePath = img.uri;
    if (filePath.startsWith('file://')) {
      filePath = filePath.replace('file://', '');
    }

    try {
      const stat = await RNBlobUtil.fs.stat(filePath);
      if (stat.size > 5 * 1024 * 1024) {
        const fileSizeMB = (stat.size / 1024 / 1024).toFixed(2);
        console.warn(`⚠️ Portfolio image ${i + 1}: ${fileSizeMB} MB - may cause 413 error`);
      }
    } catch (e) {
      console.error(`Failed to check file size for image ${i + 1}:`, e);
    }
  }

  const parts: MultipartPart[] = [
    {
      name: 'contetnt',
      type: 'application/json',
      data: params.content,
    },
    {
      name: 'isLinked',
      type: 'application/json',
      data: String(params.isLinked),
    },

    // images는 file 파트들
    ...params.images.map((img) => {
      // Remove file:// prefix for RNBlobUtil.wrap()
      let filePath = img.uri;
      if (filePath.startsWith('file://')) {
        filePath = filePath.replace('file://', '');
      }

      return {
        name: 'images',
        filename: img.name,
        type: img.type,
        data: RNBlobUtil.wrap(filePath),
      };
    }),
  ];

  const response = await authMultipartFetch(
    `${PORTFOLIOS_BASE}`,
    parts,
    'POST',
  );

  if (response.info().status < 200 || response.info().status >= 300) {
    throw new Error('포트폴리오를 등록할 수 없습니다.');
  }
};

/* ---------------------------------------------
 * 6) GET /api/reviews/photographers/{photographerId}/reviews  (paging)
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
    ? `${REVIEWS_BASE}/${photographerId}/reviews?${qs}`
    : `${REVIEWS_BASE}/${photographerId}/reviews`;

  const response = await authFetch(url, { method: 'GET' });
  if (!response.ok) throw new Error('리뷰를 불러올 수 없습니다.');

  return response.json();
};

/* ---------------------------------------------
 * 7) GET /api/reviews/photographers/{photographerId}/summary
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
 * GET /api/reviews/photographers/{photographerId}/summary
 * 작가 리뷰 요약(평균 별점, 전체 리뷰 수, 최신 사진 10개, 최신 리뷰 5개)
 */
export const getPhotographerReviewSummary = async (
  photographerId: string,
): Promise<GetPhotographerReviewSummaryResponse> => {
  const response = await authFetch(`${REVIEWS_BASE}/${photographerId}/summary`, {
    method: 'GET',
  });

  if (!response.ok) throw new Error('리뷰 요약을 불러올 수 없습니다.');

  return response.json();
};

/* ---------------------------------------------
 * 8) GET /me/scrapped (paging)
 * 내가 스크랩한 작가 목록 조회
 * - "검색 결과와 동일한 형식"이라고 했으니 SearchPhotographersResponse 재사용
 * -------------------------------------------- */

export const getMyScrappedPhotographers = async (
  pageable: GetPageable,
): Promise<SearchPhotographersResponse> => {
  const qs = buildQuery(pageable);
  const url = qs
    ? `${PHOTOGRAPHERS_BASE}/me/scrapped?${qs}`
    : `${PHOTOGRAPHERS_BASE}/me/scrapped`;

  const response = await authFetch(url, { method: 'GET' });
  if (!response.ok) throw new Error('스크랩한 작가를 불러올 수 없습니다.');

  return response.json();
};

/* ---------------------------------------------
 * 9) POST /{photographerId}/scrap
 * 작가 스크랩(토글일 가능성 높음)
 * response: { isScrapped: boolean }
 * -------------------------------------------- */

export interface ScrapResponse {
  isScrapped: boolean;
}

export const togglePhotographerScrap = async (
  photographerId: string,
): Promise<ScrapResponse> => {
  const response = await authFetch(`${PHOTOGRAPHERS_BASE}/${photographerId}/scrap`, {
    method: 'POST',
  });

  if (!response.ok) throw new Error('스크랩을 변경할 수 없습니다.');
  return response.json();
};

export const deleteHoliday = async (
  holidayId: number
) => {
  const response = await authFetch(`${HOLIDAYS_BASE}/${holidayId}`, {
    method: 'DELETE',
  });

  if (!response.ok) throw new Error('휴가를 삭제할 수 없습니다.');
}

export interface GetHolidayResponse {
  id: number;
  holidayDate: string; // YYYY-MM-DD
  photographerId: string;
}

export interface CreateHolidayRequest {
  holidayDate: string;
}

export const createHolidays = async (
  body: CreateHolidayRequest
): Promise<GetHolidayResponse> => {
  const response = await authFetch(`${HOLIDAYS_BASE}`, {
    method: 'POST',
    json: body
  });

  if (!response.ok) throw new Error('휴가를 등록할 수 없습니다.');
  return response.json();
}

export interface Tag {
  id: number;
  name: string;
}

export const getTags = async (): Promise<Tag[]> => {
  const response = await authFetch(`${PHOTOGRAPHERS_BASE}/tag`, {
    method: 'GET',
  });

  if (!response.ok) throw new Error('태그를 불러올 수 없습니다.');

  return response.json();
}

export interface PortfolioPhoto {
  photoId: number;
  imageUrl: string;
  sortOrder: number;
}

export interface GetPortfolioResponse {
  postId: number;
  content: string;
  representativeImageUrl: string;
  createdAt: string;
  photographerId: string;
  photographerName: string;
  photos: PortfolioPhoto[];
}

export const getPortfolioPost = async (postId: number): Promise<GetPortfolioResponse> => {
  const response = await authFetch(`${PORTFOLIOS_BASE}/${postId}`, {
    method: 'GET',
  });

  if (!response.ok) throw new Error('포트폴리오를 불러올 수 없습니다.');

  return response.json();
}

export interface UpdatePortfolioPostRequest {
  request: {
    content: string;
    deletePhotoIds: number[];
    photoOrders: {
      photoId: number;
      sortOrder: number;
    }[];
  };
  newImages: UploadImageFile[];
}

export const updatePortfolioPost = async (
  postId: number, body: UpdatePortfolioPostRequest
) => {
  // Check file sizes for new images
  for (let i = 0; i < body.newImages.length; i++) {
    const img = body.newImages[i];
    let filePath = img.uri;
    if (filePath.startsWith('file://')) {
      filePath = filePath.replace('file://', '');
    }

    try {
      const stat = await RNBlobUtil.fs.stat(filePath);
      if (stat.size > 5 * 1024 * 1024) {
        const fileSizeMB = (stat.size / 1024 / 1024).toFixed(2);
        console.warn(`⚠️ Portfolio image ${i + 1}: ${fileSizeMB} MB - may cause 413 error`);
      }
    } catch (e) {
      console.error(`Failed to check file size for image ${i + 1}:`, e);
    }
  }

  const parts: MultipartPart[] = [
    // request는 JSON 파트
    {
      name: 'request',
      type: 'application/json',
      data: JSON.stringify(body.request),
    },

    // newImages는 file 파트들
    ...body.newImages.map((img) => {
      // Remove file:// prefix for RNBlobUtil.wrap()
      let filePath = img.uri;
      if (filePath.startsWith('file://')) {
        filePath = filePath.replace('file://', '');
      }

      return {
        name: 'newImages',
        filename: img.name,
        type: img.type,
        data: RNBlobUtil.wrap(filePath),
      };
    }),
  ];

  const response = await authMultipartFetch(
    `${PORTFOLIOS_BASE}/${postId}`,
    parts,
    'PATCH',
  );

  if (response.info().status < 200 || response.info().status >= 300) {
    throw new Error('포트폴리오를 수정할 수 없습니다.');
  }
}

export const deletePortfolioPost = async (
  postId: number
) => {
  const response = await authFetch(`${PORTFOLIOS_BASE}/${postId}`, {
    method: 'DELETE',
  });

  if (!response.ok) throw new Error('포트폴리오를 삭제할 수 없습니다.');
}

export type PhotographerStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'REJECTED' | 'SUSPENDED';

export const getStatusMe = async (): Promise<PhotographerStatus> => {
  const response = await authFetch(`${PHOTOGRAPHERS_BASE}/status/me`, {
    method: 'GET',
  });

  if (!response.ok) throw new Error('작가 상태를 불러올 수 없습니다.');

  return response.json();
};

export const activePhotographer = async () => {
  const response = await authFetch(`${PHOTOGRAPHERS_BASE}/me/active`, {
    method: 'POST',
  });

  if (!response.ok) throw new Error('작가를 활성화할 수 없습니다.');
}

export const inactivePhotographer = async () => {
  const response = await authFetch(`${PHOTOGRAPHERS_BASE}/me/inactive`, {
    method: 'POST',
  });

  if (!response.ok) throw new Error('작가를 비활성화할 수 없습니다.');
}

export interface GetPhotographerRegionsAndConceptsAndTagsResponse {
  regions: GetRegionsResponse[];
  concepts: Tag[];
  tags: Tag[];
}

export const getPhotographerRegionsAndConceptsAndTags = async (
  photographerId: string,
): Promise<GetPhotographerRegionsAndConceptsAndTagsResponse> => {
  const response = await authFetch(`${PHOTOGRAPHERS_BASE}/${photographerId}/regions`, {
    method: 'GET',
  });

  if (!response.ok) throw new Error('작가 정보를 불러올 수 없습니다.');

  return response.json();
}

export interface UpdatePhotographerProfileRequest {
  description: string;
  regionIds: number[];
  conceptIds: number[];
  tagIds: number[];
}

export const updatePhotographerProfile = async (
  body: UpdatePhotographerProfileRequest,
) => {
  const response = await authFetch(`${PHOTOGRAPHERS_BASE}/profile`, {
    method: 'PATCH',
    json: body
  });

  if (!response.ok) throw new Error('프로필을 업데이트할 수 없습니다.');
}

/* ---------------------------------------------
 * POST /search/multi
 * AI 멀티모달 작가 검색 (텍스트 + 이미지)
 * -------------------------------------------- */

export interface MultiSearchPhotographerResult {
  userId: string;
  provider: string;
  email: string;
  name: string;
  nickname: string;
  birthDate: string;
  gender: string;
  profileImageUrl: string;
  role: string;
  userStatus: string;
  description: string;
  basePrice: number;
  baseTime: number;
  averageRating: number;
  reviewCount: number;
  responseRate: number;
  avgResponseMinutes: string;
  matchedImageUrl: string;
  similarityScore: number;
}

export interface SearchPhotographersMultiParams {
  queryText?: string;
  queryImages?: UploadImageFile[];
}

/**
 * POST /api/photographers/search/multi
 * AI 멀티모달 검색 (텍스트 + 이미지)
 *
 * multipart/form-data:
 * - queryText: string (선택)
 * - queryImages: file[] (선택)
 */
export const searchPhotographersMulti = async (
  params: SearchPhotographersMultiParams,
): Promise<MultiSearchPhotographerResult[]> => {
  const parts: MultipartPart[] = [];

  if (params.queryText) {
    parts.push({
      name: 'queryText',
      data: JSON.stringify(params.queryText),
    });
  }

  if (params.queryImages && params.queryImages.length > 0) {
    for (const img of params.queryImages) {
      let filePath = img.uri;
      if (filePath.startsWith('file://')) {
        filePath = filePath.replace('file://', '');
      }

      parts.push({
        name: 'queryImages',
        filename: img.name,
        type: normalizeImageMime(img.type),
        data: RNBlobUtil.wrap(filePath),
      });
    }
  }

  const response = await authMultipartFetch(
    `${PHOTOGRAPHERS_BASE}/search/multi`,
    parts,
    'POST',
  );

  if (response.info().status < 200 || response.info().status >= 300) {
    throw new Error('AI 작가 검색을 완료할 수 없습니다.');
  }

  const text = response.text() as string;
  return JSON.parse(text);
}