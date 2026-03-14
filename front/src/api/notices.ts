import { getApiBaseUrl } from '@/config/api.ts';
import { PageResponse } from '@/api/photographers.ts';

const noticesBase = () => `${getApiBaseUrl()}/api/notices`;

export interface NoticeDetailResponse {
  id: number;
  title: string;
  body: string;
  date: string;
  writeerName: string;
}

export const getNoticeDetail = async (
  id: number
): Promise<NoticeDetailResponse> => {
  const response = await fetch(`${noticesBase()}/${id}`, {
    method: 'GET',
  });

  if (!response.ok) throw new Error('공지사항을 불러올 수 없습니다.');

  return response.json();
}

export interface GetNoticeResponse {
  id: number;
  title: string;
  date: string;
}

export type GetNoticesResponse = PageResponse<GetNoticeResponse>;

// @/api/notices.ts (수정 제안)
export const getNotices = async (pageable: { page: number; size?: number }): Promise<GetNoticesResponse> => {
  const params = new URLSearchParams({
    page: pageable.page.toString(),
    size: (pageable.size || 10).toString(),
  });

  const response = await fetch(`${noticesBase()}?${params}`, {
    method: 'GET',
  });

  if (!response.ok) throw new Error('공지사항 목록을 불러올 수 없습니다.');
  return response.json();
}