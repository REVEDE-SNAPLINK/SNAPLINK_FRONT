import { API_BASE_URL } from '@/config/api';
import { authFetch } from '@/api/utils';
import { buildQuery } from '@/utils/format';
import type { GetPageable, PageResponse } from '@/api/photographers'; // 이미 photographers.ts에 공통 타입 있으니 재사용 추천

const ME_BASE = `${API_BASE_URL}/api/me`;

export interface MyReviewPhoto {
  photoId: number;
  url: string;
}

export interface MyReviewItem {
  id: number;
  reservationId: number;
  photographerId: number;
  photographerNickname: string;
  photographerProfileImage?: string;
  rating: number;
  shootingTag: string;
  content: string;
  imageUrls: string[];
  createdAt: string;
}

export type GetMyReviewsResponse = PageResponse<MyReviewItem>;

export const getMyReviews = async (
  pageable: GetPageable,
): Promise<GetMyReviewsResponse> => {
  const qs = buildQuery(pageable ?? {});
  const url = qs ? `${ME_BASE}/reviews?${qs}` : `${ME_BASE}/reviews`;

  const response = await authFetch(url, { method: 'GET' });
  if (!response.ok) throw new Error(`Failed to get my reviews ${response.status}`);
  return response.json();
};