import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { useQueryClient } from '@tanstack/react-query';
import { chatQueryKeys, notificationsQueryKeys } from '@/queries/keys';
import { navigateByDeepLink } from '@/navigation';

/**
 * NotificationHandler
 *
 * Foreground 알림 처리 및 알림 탭 이벤트 핸들링
 */
export default function NotificationHandler({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // 앱 시작 시 알림 권한 상태 확인 (자동 요청하지 않음)
    // 권한 요청은 로그인/회원가입 시 safeRegisterFcmDevice에서 처리
    messaging().hasPermission().then(status => {
      console.log('[NotificationHandler] Current permission status:', status);

      // Status 값:
      // -1 = DENIED (거부됨)
      // 0 = NOT_DETERMINED (아직 묻지 않음)
      // 1 = AUTHORIZED (승인됨)
      // 2 = PROVISIONAL (임시 승인, iOS 12+)

      if (status === messaging.AuthorizationStatus.AUTHORIZED ||
          status === messaging.AuthorizationStatus.PROVISIONAL) {
        console.log('[NotificationHandler] Notification permission already granted');
      } else if (status === messaging.AuthorizationStatus.DENIED) {
        console.log('[NotificationHandler] Notification permission denied');
      } else {
        console.log('[NotificationHandler] Notification permission not determined yet');
      }
    });
  }, []);

  useEffect(() => {
    // Foreground 메시지 핸들러 (앱이 열려있을 때)
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('[Foreground] FCM message received:', remoteMessage);

      // 알림 표시
      await displayNotification(remoteMessage);

      // 알림 목록 갱신 (새 알림이 있으므로)
      queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.unreadStatus() });

      // 채팅 관련 알림이면 채팅 목록도 갱신
      const link = remoteMessage.data?.link;
      if (typeof link === 'string' && link.includes('/chat/')) {
        console.log('[Foreground] Chat notification detected, invalidating chat rooms');
        queryClient.invalidateQueries({ queryKey: chatQueryKeys.rooms() });
      }
    });

    return unsubscribe;
  }, [queryClient]);

  useEffect(() => {
    // Foreground 알림 탭 이벤트 핸들러
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      console.log('[Foreground Event]', type, detail);

      if (type === EventType.PRESS) {
        // 알림 탭 시 처리
        console.log('[Notification] User tapped notification:', detail.notification);

        if (detail.notification?.data && detail.notification.data.link && typeof detail.notification.data.link === "string") {
          navigateByDeepLink(detail.notification.data.link);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Background 상태에서 알림 탭 시 처리
    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('[Background] Notification opened app:', remoteMessage);

      const link = remoteMessage.data?.link;
      if (typeof link === 'string') {
        // 네비게이션이 준비될 때까지 약간 대기
        setTimeout(() => {
          navigateByDeepLink(link);
        }, 500);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // 앱이 종료된 상태에서 알림 탭으로 앱이 열렸을 때 처리
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('[Quit] Notification opened app from quit state:', remoteMessage);

          const link = remoteMessage.data?.link;
          if (typeof link === 'string') {
            // 앱 초기화 및 네비게이션 준비 시간 확보
            setTimeout(() => {
              navigateByDeepLink(link);
            }, 1500);
          }
        }
      });
  }, []);

  return <>{children}</>;
}

/**
 * 알림 표시 헬퍼 함수
 */
async function displayNotification(remoteMessage: any) {
  try {
    // Android 알림 채널 생성
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });

    // 알림 표시
    await notifee.displayNotification({
      title: remoteMessage.notification?.title || '새 알림',
      body: remoteMessage.notification?.body || '',
      data: remoteMessage.data,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
        smallIcon: 'ic_launcher', // 앱 아이콘 사용
      },
      ios: {
        sound: 'default',
      },
    });

    console.log('[Notification] Displayed successfully');
  } catch (error) {
    console.error('[Notification] Display error:', error);
  }
}