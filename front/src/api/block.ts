import { API_BASE_URL } from '@/config/api.ts';
import { authFetch } from '@/api/utils.ts';

const BLOCK_BASE = `${API_BASE_URL}/api/block`;

export const unblockUser = async (targetId: string) => {
  const response = await authFetch(`${BLOCK_BASE}/${targetId}`, {
    method: 'DELETE',
  });

  if (!response.ok) throw new Error('차단을 해제할 수 없습니다.');
}

export const blockUser = async (targetId: string) => {
  const response = await authFetch(`${BLOCK_BASE}/${targetId}`, {
    method: 'POST',
  });

  if (!response.ok) throw new Error('사용자를 차단할 수 없습니다.');
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

  if (!response.ok) throw new Error('차단 목록을 불러올 수 없습니다.');

  return response.json()
}