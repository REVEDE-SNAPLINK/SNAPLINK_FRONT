import { Share } from 'react-native';
import { createShortLink, TargetType } from '@/api/linkHub';
import { safeLogEvent } from '@/utils/analytics';

interface ShareOptions {
  targetType: TargetType;
  targetId: string;
  title: string;
  userId: string | null;
  userType: string;
  utmContent?: string;
}

/**
 * Link Hub 단축 링크를 생성하고 시스템 공유창을 띄웁니다.
 */
export const shareWithShortLink = async ({
  targetType,
  targetId,
  title,
  userId,
  userType,
  utmContent,
}: ShareOptions) => {
  try {
    // 1. 단축 링크 생성 요청
    const { shareUrl, trackingCode } = await createShortLink({
      targetType,
      targetId,
      channel: 'app_share',
      ownerType: 'app_user',
      ownerId: userId || undefined,
      utmContent,
      label: `[App Share] ${targetType} - ${title.substring(0, 20)}`,
    });

    // 2. 시스템 공유창 실행
    await Share.share({
      message: `${title}\n${shareUrl}`,
    });

    // 3. 분석 이벤트 로깅
    safeLogEvent('share_link_created', {
      link_type: targetType,
      target_id: targetId,
      share_channel: 'system_share',
      creator_user_id: userId || 'anonymous',
      creator_user_type: userType || 'guest',
      tracking_code: trackingCode,
      utm_content: utmContent,
    });

  } catch (error) {
    console.error('[Share] Failed to share with short link:', error);
    // 폴백: 에러 발생 시 기존 방식 혹은 안내 (여기서는 단순히 로깅)
    throw error;
  }
};
