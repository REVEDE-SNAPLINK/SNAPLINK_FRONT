import { API_BASE_URL } from '@/config/api';
import { authFetch } from '@/api/utils';

const USER_BASE = `${API_BASE_URL}/api/user`;

/** GET /api/user/me 응답 */
export interface GetMeResponse {
  nickname: string;
  name: string;
  email: string;
}

/** PATCH /api/user/me body */
export interface PatchMeRequest {
  nickname?: string;
  email?: string;
}

/**
 * GET /api/user/me
 * 내 기본 프로필 조회 (nickname, name, email)
 */
export const getMe = async (): Promise<GetMeResponse> => {
  const response = await authFetch(`${USER_BASE}/me`, { method: 'GET' });

  if (!response.ok) {
    throw new Error(`Failed to get me ${response.status}`);
  }

  return response.json();
};

/**
 * PATCH /api/user/me
 * 내 기본 프로필 수정 (nickname/email 부분 업데이트 가능)
 */
export const patchMe = async (body: PatchMeRequest): Promise<GetMeResponse> => {
  const response = await authFetch(`${USER_BASE}/me`, {
    method: 'PATCH',
    json: body, // authFetch가 stringify + Content-Type 처리
  });

  if (!response.ok) {
    throw new Error(`Failed to patch me ${response.status}`);
  }

  return response.json();
};

/** 프로필 이미지 업로드/변경 (multipart/form-data) */
export interface PatchUserProfileImageParams {
  image: {
    uri: string;
    name: string;
    type: string; // e.g. 'image/jpeg'
  };
}

/**
 * PATCH /api/user/profile-image
 * 유저 프로필 사진 업로드/변경
 *
 * multipart/form-data: image
 * ⚠️ Content-Type 직접 지정하지 말기(boundary 깨짐)
 */
export const patchUserProfileImage = async (
  params: PatchUserProfileImageParams,
): Promise<void> => {
  const formData = new FormData();

  formData.append('image', {
    uri: params.image.uri,
    name: params.image.name,
    type: params.image.type,
  } as any);

  const response = await authFetch(`${USER_BASE}/profile-image`, {
    method: 'PATCH',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to patch user profile image ${response.status}`);
  }
};