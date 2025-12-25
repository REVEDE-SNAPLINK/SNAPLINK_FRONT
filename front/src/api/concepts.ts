import { API_BASE_URL } from '@/config/api.ts';
import { authFetch } from '@/api/utils.ts';

const REGION_BASE = `${API_BASE_URL}/api/concepts`;

export interface GetConceptsResponse {
  id: number;
  conceptName: string;
}

export const getAllConcepts = async () => {
  const response = await authFetch(`${REGION_BASE}`, {
    method: 'GET',
  });

  if (!response.ok) throw new Error(`get concepts failed: ${response.status}`);

  return response.json();
}