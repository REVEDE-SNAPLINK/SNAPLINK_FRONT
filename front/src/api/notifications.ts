// src/api/notifications.ts
import { API_BASE_URL } from '@/config/api';
import { authFetch } from '@/api/utils';

const NOTIFICATIONS_BASE = `${API_BASE_URL}/api/notifications`;

export interface NotificationItem {
  id: number;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string; // ISO date-time
}

// export type NotificationCategory = '일정' | '게시글' | '리뷰';
//
// export interface Notification {
//   id: string;
//   category: NotificationCategory;
//   type: string;
//   message: string;
//   time?: string;
//   relatedId?: string;
//
//   // 게시글 알림 관련
//   postMessage?: string;
//   commentCount?: number;
//   relatedImage?: string;
//
//   // 일정 알림 관련 (유저)
//   photographerNickname?: string;
//
//   // 일정 알림 관련 (작가)
//   userNickname?: string;
//
//   bookingType?: string;
//   datetime?: string;
// }

/**
 * GET /api/notifications
 * 최근 알림 20개 조회
 */
export const getNotifications = async (): Promise<NotificationItem[]> => {
  const response = await authFetch(`${NOTIFICATIONS_BASE}`, { method: 'GET' });
  if (!response.ok) throw new Error(`Failed to get notifications ${response.status}`);
  return response.json();
};

/**
 * GET /api/notifications/unread-status
 * 안 읽은 알림 존재 여부(true/false)
 */
export const getUnreadNotificationStatus = async (): Promise<boolean> => {
  const response = await authFetch(`${NOTIFICATIONS_BASE}/unread-status`, { method: 'GET' });
  if (!response.ok) throw new Error(`Failed to get unread status ${response.status}`);
  return response.json();
};

export interface PatchNotificationReadParams {
  notificationId: number;
}

/**
 * PATCH /api/notifications/{notificationId}/read
 * 특정 알림 읽음 처리(isRead=true)
 */
export const patchNotificationRead = async (
  params: PatchNotificationReadParams,
): Promise<void> => {
  const response = await authFetch(`${NOTIFICATIONS_BASE}/${params.notificationId}/read`, {
    method: 'PATCH',
  });

  if (!response.ok) throw new Error(`Failed to patch notification read ${response.status}`);
};