// src/api/notifications.ts
import { getApiBaseUrl } from '@/config/api';
import { authFetch } from '@/api/utils';

const notificationsBase = () => `${getApiBaseUrl()}/api/notifications`;

export interface NotificationItem {
  id: number;
  title: string;
  body: string;
  isRead: boolean;
  deeplink: string;
  createdAt: string; // ISO date-time
}
/**
 * GET /api/notifications
 * 최근 알림 20개 조회
 */
export const getNotifications = async (): Promise<NotificationItem[]> => {
  const response = await authFetch(`${notificationsBase()}`, { method: 'GET' });
  if (!response.ok) throw new Error('알림 목록을 불러올 수 없습니다.');
  return response.json();
};

/**
 * GET /api/notifications/unread-status
 * 안 읽은 알림 존재 여부(true/false)
 */
export const getUnreadNotificationStatus = async (): Promise<boolean> => {
  const response = await authFetch(`${notificationsBase()}/unread-status`, { method: 'GET' });
  if (!response.ok) throw new Error('알림 상태를 불러올 수 없습니다.');
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
  const response = await authFetch(`${notificationsBase()}/${params.notificationId}/read`, {
    method: 'PATCH',
  });

  if (!response.ok) throw new Error('알림을 읽음 처리할 수 없습니다.');
};