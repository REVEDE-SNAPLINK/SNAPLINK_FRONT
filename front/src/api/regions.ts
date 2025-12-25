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

  if (!response.ok) throw new Error(`get regions failed: ${response.status}`);

  return response.json();
}