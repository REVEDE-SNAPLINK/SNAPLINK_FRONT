import { Platform } from 'react-native';
import { API_BASE_URL } from '@/config/api.ts';

const FCM_BASE = `${API_BASE_URL}/devices`;

export async function registerFCMdevice(fcmToken: string) {
  const response = await fetch(FCM_BASE, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fcmToken,
      osType: Platform.OS === 'ios' ? 'IOS': 'ANDROID'
    })
  });

  console.log(JSON.stringify({
    url: FCM_BASE,
    method: 'post',
    body: {
      fcmToken,
      osType: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
    },
    status: response.status,
    statusText: response.statusText
  }));

  if (!response.ok) throw new Error(`register fcm device failed: ${response.status}`);
}

export async function deleteFCMToken(fcmToken: string) {
  const response = await fetch(`${FCM_BASE}/logout`, {
    method: 'delete',
    body: JSON.stringify({
      fcmToken,
    })
  })

  console.log(JSON.stringify({
    url: FCM_BASE+'/logout',
    method: 'delete',
    body: {
      fcmToken,
    },
    status: response.status,
    statusText: response.statusText
  }));

  if (!response.ok) throw new Error(`register fcm token failed: ${response.status}`);
}