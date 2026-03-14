import { Platform } from 'react-native';
import { getApiBaseUrl } from '@/config/api.ts';
import { authFetch } from '@/api/utils.ts';

const fcmBase = () => `${getApiBaseUrl()}/api/devices`;

export async function registerFCMdevice(fcmToken: string) {
  const response = await authFetch(fcmBase(), {
    method: 'POST',
    json: {
      fcmToken,
      osType: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
    },
  });

  if (!response.ok) throw new Error(`register fcm device failed: ${response.status}`);
}
