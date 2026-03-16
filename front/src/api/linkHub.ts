import { authFetch } from '@/api/utils';

export type TargetType =
  | 'photographer_profile'
  | 'portfolio_post'
  | 'community_post'
  | 'landing'
  | 'store';

export type CreateLinkRequest = {
  targetType: TargetType;
  targetId?: string;
  path?: string;

  channel: 'app_share';
  ownerType: 'app_user';
  ownerId?: string;

  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;

  label?: string;
};

export type CreateLinkResponse = {
  code: string;
  trackingCode: string;
  shareUrl: string;
  path: string;
};

const BASE_URL = 'https://go.snaplink.run';

/**
 * Link Hub 단축 링크 생성 API 호출
 */
export const createShortLink = async (
  payload: CreateLinkRequest,
): Promise<CreateLinkResponse> => {
  const response = await authFetch(`${BASE_URL}/api/links`, {
    method: 'POST',
    json: payload,
  });

  if (!response.ok) {
    throw new Error('단축 링크를 생성할 수 없습니다.');
  }

  return response.json();
};
