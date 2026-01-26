import { API_BASE_URL } from '@/config/api.ts';
import { authFetch } from '@/api/utils.ts';

const REPORTS_BASE = `${API_BASE_URL}/api/reports`;

export type TargetType = 'CHAT' | 'PROFILE';
export type CommunityTargetType = 'POST' | 'COMMENT';
export const COMMUNITY_REASONS = [
  'SPAM_PROMOTION',         // 스팸/홍보
  'INAPPROPRIATE_CONTENT',  // 부적절한 게시글 (음란물 등)
  'ABUSE_HARASSMENT',       // 욕설/비방/혐오
  'FALSE_INFORMATION',      // 허위 사실
  'PRIVACY_VIOLATION',      // 개인정보 노출
  'COPYRIGHT_VIOLATION',    // 저작권 침해
  'OTHER',                  // 기타
] as const;
export const REASONS = [
  'COPYRIGHT_INFRINGEMENT',
  'UNDISCLOSED_REQUIREMENT',
  'ABUSE_LANGUAGE',
  'FRAUD_SUSPECTED',
  'UNILATERAL_CANCELLATION',
  'NO_SHOW',
  'OTHER',
] as const;
export type REASON = (typeof REASONS)[number];
export type COMMUNITY_REASON = (typeof COMMUNITY_REASONS)[number];

export const mappingReason = (reason: REASON) => {
  switch (reason) {
    case 'COPYRIGHT_INFRINGEMENT': return '저작권 침해 우려';
    case 'UNDISCLOSED_REQUIREMENT': return '미기재 내용 요구';
    case 'ABUSE_LANGUAGE': return '비매너 및 폭언';
    case 'FRAUD_SUSPECTED': return '사기 의심';
    case 'UNILATERAL_CANCELLATION': return '일방적 예약 취소';
    case 'NO_SHOW': return '노쇼 (No-Show)';
    case 'OTHER': return '기타 (직접 입력)';
  }
}

export const mappingCommunityReason = (reason: COMMUNITY_REASON) => {
  switch (reason) {
    case 'SPAM_PROMOTION':
      return '스팸 및 홍보';
    case 'INAPPROPRIATE_CONTENT':
      return '부적절/음란성 콘텐츠';
    case 'ABUSE_HARASSMENT':
      return '욕설 및 비방/혐오';
    case 'FALSE_INFORMATION':
      return '허위 정보 및 사칭';
    case 'PRIVACY_VIOLATION':
      return '개인정보 침해';
    case 'COPYRIGHT_VIOLATION':
      return '무단 도용/저작권 위반';
    case 'OTHER':
      return '기타 (직접 입력)';
  }
}

export interface ReportRequest {
  targetId: string;
  targetType: TargetType;
  reason: REASON;
  customReason: string;
  description: string;
}

export interface CommunityReportRequest {
  targetId: number;
  targetType: CommunityTargetType;
  reason: COMMUNITY_REASON;
  detailReason: string;
}

export const reportUser = async (body: ReportRequest) => {
  const response = await authFetch(`${REPORTS_BASE}`, {
    method: 'POST',
    json: body,
  });

  if (!response.ok) throw new Error('신고를 접수할 수 없습니다.');
}

export const reportCommunityUser = async (body: CommunityReportRequest) => {
  const response = await authFetch(`${REPORTS_BASE}/community`, {
    method: 'POST',
    json: body,
  });

  if (!response.ok) throw new Error('신고를 접수할 수 없습니다.');
}