// src/api/reviews.ts
import { API_BASE_URL } from '@/config/api';
import { authFetch, authMultipartFetch } from '@/api/utils';
import RNBlobUtil from 'react-native-blob-util';

const REVIEWS_BASE = `${API_BASE_URL}/api/reviews`;
const RESERVATIONS_BASE = `${API_BASE_URL}/api/reservations`;

/** 리뷰 답글 작성(작가 전용) */
export interface CreateReviewReplyParams {
  reviewId: number;
  content: string; // body: string
}

/**
 * POST /api/reviews/{reviewId}/replies
 * 리뷰 답글 작성 (작가 전용)
 * body: string (reply content)
 */
export const createReviewReply = async (
  params: CreateReviewReplyParams,
): Promise<void> => {
  const response = await authFetch(`${REVIEWS_BASE}/${params.reviewId}/replies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params.content), // ✅ body가 string이라 JSON string으로 보냄
  });

  if (!response.ok) throw new Error(`Failed to create review reply ${response.status}`);
};

/** 촬영 리뷰 작성 요청(request 파트) */
export interface CreateReservationReviewRequest {
  rating: number;
  shootingTag: string;
  content: string;
}

/** 업로드 이미지 파일 */
export interface UploadImageFile {
  uri: string;
  name: string;
  type: string; // e.g. image/jpeg
}

/** 촬영 리뷰 작성(고객 전용) */
export interface CreateReservationReviewParams {
  reservationId: number;
  request: CreateReservationReviewRequest;
  images: UploadImageFile[];
}

/**
 * POST /api/reservations/{reservationId}/reviews
 * 촬영 리뷰 작성 (고객 전용)
 *
 * multipart/form-data:
 * - request: JSON 문자열
 * - images: array(files)
 */
export const createReservationReview = async (
  params: CreateReservationReviewParams,
): Promise<void> => {
  const parts = [
    {
      name: 'request',
      type: 'application/json',
      data: JSON.stringify(params.request),
    },
    ...params.images.map((img) => ({
      name: 'images',
      filename: img.name,
      type: img.type,
      data: RNBlobUtil.wrap(img.uri),
    })),
  ];

  const response = await authMultipartFetch(
    `${RESERVATIONS_BASE}/${params.reservationId}/reviews`,
    parts,
    'POST',
  );

  if (response.info().status >= 400) {
    throw new Error(`Failed to create reservation review ${response.info().status}`);
  }
};

/** 내 리뷰 조회 응답 */
export interface MyReview {
  id: number;
  reservationId: number;
  photographerId: number;
  photographerNickname: string;
  photographerProfileImage?: string;
  rating: number;
  shootingTag: string; // bookingType으로 사용
  content: string;
  imageUrls: string[];
  createdAt: string;
  // 리뷰에 title이 있다면 추가, 없으면 shootingTag 사용
}

export interface GetMyReviewsResponse {
  reviews: MyReview[];
  totalCount: number;
}

/** 리뷰 수정 요청 */
export interface UpdateReviewRequest {
  rating: number;
  shootingTag: string;
  content: string;
  deletePhotoIds: number[];
}

export interface UpdateReviewParams {
  reviewId: number;
  request: UpdateReviewRequest;
  newImages: UploadImageFile[];
}

/**
 * PATCH /api/reviews/{reviewId}
 * 리뷰 수정 (고객 전용)
 *
 * multipart/form-data:
 * - request: JSON 문자열
 * - newImages: array(files)
 */
export const updateReview = async (params: UpdateReviewParams): Promise<void> => {
  const parts = [
    {
      name: 'request',
      type: 'application/json',
      data: JSON.stringify(params.request),
    },
    ...params.newImages.map((img) => ({
      name: 'newImages',
      filename: img.name,
      type: img.type,
      data: RNBlobUtil.wrap(img.uri),
    })),
  ];

  const response = await authMultipartFetch(
    `${REVIEWS_BASE}/${params.reviewId}`,
    parts,
    'PATCH',
  );

  if (response.info().status >= 400) {
    throw new Error(`Failed to update review ${response.info().status}`);
  }
};

/**
 * DELETE /api/reviews/{reviewId}
 * 리뷰 삭제 (고객 전용)
 */
export const deleteReview = async (reviewId: number): Promise<void> => {
  const response = await authFetch(`${REVIEWS_BASE}/${reviewId}`, {
    method: 'DELETE',
  });

  if (!response.ok) throw new Error(`Failed to delete review ${response.status}`);
};