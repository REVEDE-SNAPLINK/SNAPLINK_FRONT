import { API_BASE_URL } from '@/config/api';
import { authFetch, authMultipartFetch, MultipartPart } from '@/api/utils';
import { buildQuery, generateImageFilename, normalizeImageMime } from '@/utils/format.ts';
import RNBlobUtil from 'react-native-blob-util';
import { GetPageable, PageResponse } from '@/api/photographers.ts';

const USER_BASE = `${API_BASE_URL}/api/user`;

/** GET /api/user/me 응답 */
export interface GetMeResponse {
  nickname: string;
  name: string;
  email: string;
  profileImageURI: string;
  role: "USER" | "PHOTOGRAPHER"
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
    throw new Error('프로필 정보를 불러올 수 없습니다.');
  }

  return response.json();
};

/**
 * PATCH /api/user/me
 * 내 기본 프로필 수정 (nickname/email 부분 업데이트 가능)
 */
export const patchMe = async (body: PatchMeRequest) => {
  const response = await authFetch(`${USER_BASE}/me`, {
    method: 'PATCH',
    json: body,
  });

  if (!response.ok) {
    throw new Error('프로필을 업데이트할 수 없습니다.');
  }
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

  // Check file size for warnings
  try {
    const stat = await RNBlobUtil.fs.stat(filePath);
    if (stat.size > 5 * 1024 * 1024) {
      const fileSizeMB = (stat.size / 1024 / 1024).toFixed(2);
      console.warn(`⚠️ User profile image size: ${fileSizeMB} MB - may cause 413 error`);
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
    throw new Error('프로필 사진을 업데이트할 수 없습니다.');
  }

  // CloudFront key 반환
  return response.text();
};

export const checkNickname = async (
  nickname: string,
): Promise<boolean> => {
  const response = await authFetch(`${USER_BASE}/check-nickname?nickname=${nickname}`, {
    method: 'GET',
  });

  if (!response.ok) throw new Error('닉네임 중복 확인을 할 수 없습니다.');

  return response.json();
}

export const checkEmail = async (
  email: string,
): Promise<boolean> => {
  const response = await authFetch(`${USER_BASE}/check-email?email=${email}`, {
    method: 'GET',
  });

  if (!response.ok) throw new Error('이메일 중복 확인을 할 수 없습니다.');

  return response.json();
}

export interface NotificationSettings {
  consentMarketing: boolean;
  consentCommunity: boolean;
  consentChat: boolean;
  consentSystem: boolean;
  consentSchedule: boolean;
}

export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  const response = await authFetch(`${USER_BASE}/me/notifications`, {
    method: 'GET',
  });

  if (!response.ok) throw new Error('알림 설정을 불러올 수 없습니다.');

  return response.json();
}

export const updateNotificationSettings = async (body: NotificationSettings) => {
  const response = await authFetch(`${USER_BASE}/me/notifications`, {
    method: 'PATCH',
    json: body,
  });

  if (!response.ok) throw new Error('알림 설정을 업데이트할 수 없습니다.');
}

export interface GetSearchUserResponse {
  userId: string;
  nickname: string;
  name: string;
  profileImageUrl: string;
  role: "USER" | "PHOTOGRAPHER";
}

export type GetSearchUsersResponse = PageResponse<GetSearchUserResponse>;

export const searchUsersFromNickname = async (
  nickname: string,
  pageable?: GetPageable,
): Promise<GetSearchUsersResponse> => {
  const params = { ...pageable, nickname };
  const qs = buildQuery(params);

  const url = `${USER_BASE}/search?${qs}`;

  const response = await authFetch(url, {
    method: 'GET',
  });

  if (!response.ok) throw new Error('사용자 검색을 완료할 수 없습니다.');

  return response.json();
}