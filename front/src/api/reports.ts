import { API_BASE_URL } from '@/config/api.ts';
import { authFetch } from '@/api/utils.ts';

const REPORTS_BASE = `${API_BASE_URL}/api/reports`;

export type TargetType = 'CHAT' | 'PROFILE';
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

export const mappingReason = (reason: REASON) => {
  switch (reason) {
    case 'COPYRIGHT_INFRINGEMENT': return '저작권 침해가 우려돼요';
    case 'UNDISCLOSED_REQUIREMENT': return '기재되지 않은 내용을 요구해요';
    case 'ABUSE_LANGUAGE': return '욕설, 비방 및 폭언을 해요';
    case 'FRAUD_SUSPECTED': return '사기인 것 같아요';
    case 'UNILATERAL_CANCELLATION': return '일방적으로 예약을 취소했어요';
    case 'NO_SHOW': return '촬영 장소에 나오지 않았어요';
    case 'OTHER': return '기타(직접 작성)';
  }
}

export interface ReportRequest {
  targetId: string;
  targetType: TargetType;
  reason: REASON;
  customReason: string;
  description: string;
}

export const reportUser = async (body: ReportRequest) => {
  const response = await authFetch(`${REPORTS_BASE}`, {
    method: 'POST',
    json: body,
  });

  if (!response.ok) throw new Error(`Failed to fetch report for ${response.status} ${response.statusText}`);
}