import { API_BASE_URL } from '@/config/api';
import { authFetch } from '@/api/utils';

const USER_BASE = `${API_BASE_URL}/api/user`;

// TODO: 백엔드 API 추가 필요
// /** 사용자 프로필 정보 */
// export interface UserProfile {
//   userId: string;
//   email: string;
//   name: string;
//   nickname: string;
//   profileImage?: string;
//   phoneNumber?: string;
// }

// /**
//  * GET /api/user/profile
//  * 사용자 프로필 조회
//  */
// export const getUserProfile = async (): Promise<UserProfile> => {
//   const response = await authFetch(`${USER_BASE}/profile`, {
//     method: 'GET',
//   });
//
//   if (!response.ok) {
//     throw new Error(`Failed to get user profile ${response.status}`);
//   }
//
//   return response.json();
// };

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