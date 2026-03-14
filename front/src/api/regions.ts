import { getApiBaseUrl } from '@/config/api.ts';
import { authFetch } from '@/api/utils.ts';

const regionBase = () => `${getApiBaseUrl()}/api/regions`;

export interface GetRegionsResponse {
  id: number;
  city: string;
}

export const getAllRegions = async (): Promise<GetRegionsResponse[]> => {
  const response = await authFetch(`${regionBase()}`, {
    method: 'GET',
  });

  if (!response.ok) throw new Error('지역 목록을 불러올 수 없습니다.');

  return response.json();
}