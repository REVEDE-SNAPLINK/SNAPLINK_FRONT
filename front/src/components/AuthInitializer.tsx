import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore.ts';
import { KAKAO_NATIVE_APP_KEY } from '@/config/api.ts';
import { initializeKakaoSDK } from '@react-native-kakao/core';
import SplashScreen from 'react-native-splash-screen';
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

async function initPush() {
  if (Platform.OS !== 'ios') return;

  // ✅ APNs 등록(이게 먼저!)
  await messaging().registerDeviceForRemoteMessages();
}
/**
 * AuthInitializer - 앱 시작 시 인증 상태를 초기화하는 컴포넌트
 */
export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { bootstrap, bootstrapped } = useAuthStore();

  useEffect(() => {
    (async () => {
      await initializeKakaoSDK(`${KAKAO_NATIVE_APP_KEY}`);
      await initPush();
      await bootstrap();
    })();
  }, [bootstrap]);

  useEffect(() => {
    if (!bootstrapped) return;
    const t = setTimeout(() => SplashScreen.hide(), 1000);
    return () => clearTimeout(t);
  }, [bootstrapped]);

  return <>{children}</>;
}
