import { useNotificationsQuery } from '@/queries/notifications.ts';
import { useEffect } from 'react';
import notifee from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import { notificationsQueryKeys } from '@/queries/keys.ts';
import { queryClient } from '@/config/queryClient.ts';
import { Platform } from 'react-native';
import { PermissionsAndroid } from 'react-native';

async function requestPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  console.log('FCM 권한 요청 후 상태:', authStatus, 'enabled?', enabled);
}

export default function BadgeSyncHandler({ children }: { children: React.ReactNode }) {
  const qc = queryClient;

  const { data: notifications } = useNotificationsQuery();

  useEffect(() => {
    messaging().hasPermission().then(status => {
      if (status === 1) {
        if (Platform.OS === 'ios') {
          requestPermission();
        } else {
          PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        }
      }
    });
  }, []);

  useEffect(() => {
    const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0;
    notifee.setBadgeCount(unreadCount);
  }, [notifications]);

  useEffect(() => {
    // --------------------------
    // Foreground FCM 처리
    // --------------------------
    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {

      console.log('Foreground FCM payload:', remoteMessage);
      // Notifee 알림 표시
      await notifee.displayNotification({
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        android: { channelId: 'default', smallIcon: 'ic_launcher' },
      });

      // React Query invalidate
      qc.invalidateQueries({ queryKey: notificationsQueryKeys.list() });
      qc.invalidateQueries({ queryKey: notificationsQueryKeys.unreadStatus() });
    });

    // --------------------------
    // Background 알림 클릭 처리
    // --------------------------
    const unsubscribeOnNotificationOpened = messaging().onNotificationOpenedApp(_ => {
      qc.invalidateQueries({ queryKey: notificationsQueryKeys.list() });
      qc.invalidateQueries({ queryKey: notificationsQueryKeys.unreadStatus() });
    });

    // --------------------------
    // Killed 상태에서 앱 푸시 열기 처리
    // --------------------------
    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        qc.invalidateQueries({ queryKey: notificationsQueryKeys.list() });
        qc.invalidateQueries({ queryKey: notificationsQueryKeys.unreadStatus() });
      }
    });

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnNotificationOpened();
    };
  }, [qc]);

  return <>{children}</>;
}