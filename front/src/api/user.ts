import { API_BASE_URL } from '@/config/api';
import { authFetch, authMultipartFetch, MultipartPart } from '@/api/utils';
import { generateImageFilename, normalizeImageMime } from '@/utils/format.ts';
import RNBlobUtil from 'react-native-blob-util';

const USER_BASE = `${API_BASE_URL}/api/user`;

/** GET /api/user/me 응답 */
export interface GetMeResponse {
  nickname: string;
  name: string;
  email: string;
  profileImageURI: string;
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
 * @returns CloudFront key (string)
 */
export const patchUserProfileImage = async (
  params: PatchUserProfileImageParams,
): Promise<string> => {
  // Remove file:// prefix for RNBlobUtil.wrap()
  let filePath = params.image.uri;
  if (filePath.startsWith('file://')) {
    filePath = filePath.replace('file://', '');
  }

  // Check file size
  try {
    const stat = await RNBlobUtil.fs.stat(filePath);
    const fileSizeKB = Math.round(stat.size / 1024);
    const fileSizeMB = (stat.size / 1024 / 1024).toFixed(2);

    console.log('=== patchUserProfileImage ===');
    console.log('Original URI:', params.image.uri);
    console.log('Processed Path:', filePath);
    console.log('File Size:', `${fileSizeKB} KB (${fileSizeMB} MB)`);
    console.log('Filename:', generateImageFilename(params.image.type, 'user_profile_image_'));
    console.log('Type:', normalizeImageMime(params.image.type));

    if (stat.size > 5 * 1024 * 1024) {
      console.warn('⚠️ WARNING: File size exceeds 5MB, may cause 413 error');
    }
  } catch (e) {
    console.error('Failed to check file size:', e);
  }

  const parts: MultipartPart[] = [
    {
      name: 'image',
      filename: generateImageFilename(params.image.type, 'user_profile_image_'),
      type: normalizeImageMime(params.image.type),
      data: RNBlobUtil.wrap(filePath),
    },
  ];

  const response = await authMultipartFetch(
    `${USER_BASE}/profile-image`,
    parts,
    'PATCH',
  );

  if (response.info().status < 200 || response.info().status >= 300) {
    throw new Error(`Failed to patch user profile image ${response.info().status}`);
  }

  // CloudFront key 반환
  return response.text();
};