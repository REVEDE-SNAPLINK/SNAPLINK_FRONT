import { Platform } from 'react-native';
import { API_BASE_URL } from '@/config/api.ts';
import { authFetch } from '@/api/utils.ts';

const FCM_BASE = `${API_BASE_URL}/api/devices`;

export async function registerFCMdevice(fcmToken: string) {
  const response = await authFetch(FCM_BASE, {
    method: 'POST',
    json: {
      fcmToken,
      osType: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
    },
  });

  if (!response.ok) throw new Error(`register fcm device failed: ${response.status}`);
}
