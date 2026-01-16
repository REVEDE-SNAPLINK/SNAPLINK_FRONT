import { API_BASE_URL } from '@/config/api.ts';
import { authFetch } from '@/api/utils.ts';

const BLOCK_BASE = `${API_BASE_URL}/block`;

export const unblockUser = async (targetId: string) => {
  const response = await authFetch(`${BLOCK_BASE}/${targetId}`, {
    method: 'DELETE',
  });

  if (!response.ok) throw new Error('unblock failed');
}

export const blockUser = async (targetId: string) => {
  const response = await authFetch(`${BLOCK_BASE}/${targetId}`, {
    method: 'GET',
  });

  if (!response.ok) throw new Error('unblock failed');
}

export interface BlockResponse {
  userId: string;
  nickname: string;
  profileImageUrl: string;
}

export const getBlocks = async (): Promise<BlockResponse[]> => {
  const response = await authFetch(`${BLOCK_BASE}/me`, {
    method: 'GET',
  });

  if (!response.ok) throw new Error('unblock failed');

  return response.json()
}