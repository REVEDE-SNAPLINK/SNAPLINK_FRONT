import { useQuery } from '@tanstack/react-query';
import { getNotifications, getUnreadNotificationStatus } from '@/api/notifications';
import { notificationsQueryKeys } from '@/queries/keys';

/**
 * 최근 알림 목록(최신 20개)
 * 앱 시작 시 / 화면 진입 시 / 주기적 갱신에 사용
 */
export const useNotificationsQuery = () =>
  useQuery({
    queryKey: notificationsQueryKeys.list(),
    queryFn: getNotifications,
    staleTime: 1000 * 10, // 10초 정도(원하면 조절)
  });

/**
 * 안 읽은 알림 존재 여부
 * 아이콘 N 표시 등
 */
export const useUnreadNotificationStatusQuery = () =>
  useQuery({
    queryKey: notificationsQueryKeys.unreadStatus(),
    queryFn: getUnreadNotificationStatus,
    staleTime: 1000 * 5, // 더 자주 바뀔 수 있어 짧게
  });