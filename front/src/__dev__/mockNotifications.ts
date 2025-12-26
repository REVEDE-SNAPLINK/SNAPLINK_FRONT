import type { NotificationItem } from '@/api/notifications';

/**
 * 개발 모드용 더미 알림 데이터
 */

let mockNotifications: NotificationItem[] = [
  {
    id: 1,
    title: '예약 확정',
    body: '김작가님과의 촬영이 확정되었습니다.',
    isRead: false,
    createdAt: '2025-01-25T10:00:00Z',
  },
  {
    id: 2,
    title: '리뷰 작성 요청',
    body: '촬영이 완료되었습니다. 리뷰를 작성해주세요!',
    isRead: false,
    createdAt: '2025-01-24T14:30:00Z',
  },
  {
    id: 3,
    title: '사진 업로드 완료',
    body: '작가님이 촬영 사진을 업로드했습니다.',
    isRead: true,
    createdAt: '2025-01-23T16:00:00Z',
  },
  {
    id: 4,
    title: '댓글 알림',
    body: '내 게시글에 새로운 댓글이 달렸습니다.',
    isRead: true,
    createdAt: '2025-01-22T09:15:00Z',
  },
  {
    id: 5,
    title: '좋아요 알림',
    body: '내 게시글을 5명이 좋아합니다.',
    isRead: true,
    createdAt: '2025-01-21T11:30:00Z',
  },
];

/**
 * 모든 알림 조회
 */
export const getMockNotifications = (): NotificationItem[] => {
  return [...mockNotifications];
};

/**
 * 알림 읽음 처리
 */
export const markMockNotificationAsRead = (notificationId: number): boolean => {
  const notification = mockNotifications.find((n) => n.id === notificationId);
  if (notification) {
    notification.isRead = true;
    return true;
  }
  return false;
};

/**
 * 모든 알림 읽음 처리
 */
export const markAllMockNotificationsAsRead = (): boolean => {
  mockNotifications.forEach((n) => {
    n.isRead = true;
  });
  return true;
};

/**
 * 알림 삭제
 */
export const deleteMockNotification = (notificationId: number): boolean => {
  const initialLength = mockNotifications.length;
  mockNotifications = mockNotifications.filter((n) => n.id !== notificationId);
  return mockNotifications.length < initialLength;
};

/**
 * 알림 추가 (테스트용)
 */
export const addMockNotification = (title: string, body: string): NotificationItem => {
  const newNotification: NotificationItem = {
    id: Math.max(...mockNotifications.map((n) => n.id), 0) + 1,
    title,
    body,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  mockNotifications.unshift(newNotification);
  return newNotification;
};
