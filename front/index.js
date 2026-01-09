/**
 * @format
 */
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';

// 백그라운드 메시지 핸들러 (앱이 종료되었거나 백그라운드일 때)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('[Background] FCM message received:', remoteMessage);

  // notifee로 로컬 알림 표시
  await displayNotification(remoteMessage);
});

// 알림 표시 헬퍼 함수
async function displayNotification(remoteMessage) {
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

// 알림 탭 이벤트 핸들러 (백그라운드)
notifee.onBackgroundEvent(async ({ type, detail }) => {
  console.log('[Background Event]', type, detail);

  if (type === EventType.PRESS) {
    // 알림 탭 시 처리 (필요시 딥링크 등)
    console.log('[Notification] User tapped notification:', detail.notification);
  }
});

AppRegistry.registerComponent(appName, () => App);
