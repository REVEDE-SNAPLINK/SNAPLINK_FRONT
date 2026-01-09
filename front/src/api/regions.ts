import { API_BASE_URL } from '@/config/api.ts';
import { authFetch } from '@/api/utils.ts';

const REGION_BASE = `${API_BASE_URL}/api/regions`;

export interface GetRegionsResponse {
  id: number;
  city: string;
}

export const getAllRegions = async (): Promise<GetRegionsResponse[]> => {
  const response = await authFetch(`${REGION_BASE}`, {
    method: 'GET',
  });

  if (!response.ok) throw new Error('지역 목록을 불러올 수 없습니다.');

  return response.json();
}