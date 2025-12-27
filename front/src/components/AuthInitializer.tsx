import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore.ts';
import { KAKAO_NATIVE_APP_KEY } from '@/config/api.ts';
import { initializeKakaoSDK } from '@react-native-kakao/core';
import SplashScreen from 'react-native-splash-screen';
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

async function initPush() {
  if (Platform.OS !== 'ios') return;

  try {
    console.log('[AuthInitializer] Registering for remote notifications...');
    // ✅ APNs 등록(이게 먼저!)
    await messaging().registerDeviceForRemoteMessages();
    console.log('[AuthInitializer] Remote notifications registered');
  } catch (e) {
    console.error('[AuthInitializer] Failed to register for remote notifications:', e);
  }
}

/**
 * AuthInitializer - 앱 시작 시 인증 상태를 초기화하는 컴포넌트
 */
export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { bootstrap, bootstrapped } = useAuthStore();

  useEffect(() => {
    (async () => {
      try {
        console.log('[AuthInitializer] Starting initialization...');
        const startTime = Date.now();

        console.log('[AuthInitializer] Initializing Kakao SDK...');
        await initializeKakaoSDK(`${KAKAO_NATIVE_APP_KEY}`);
        console.log('[AuthInitializer] Kakao SDK initialized');

        // Push 초기화와 bootstrap을 병렬로 실행
        const [, bootstrapResult] = await Promise.allSettled([
          initPush(),
          bootstrap(),
        ]);

        // bootstrap이 실패해도 앱은 계속 실행
        if (bootstrapResult.status === 'rejected') {
          console.error('[AuthInitializer] Bootstrap failed:', bootstrapResult.reason);
        }

        const elapsed = Date.now() - startTime;
        console.log(`[AuthInitializer] Initialization completed in ${elapsed}ms`);
      } catch (e) {
        console.error('[AuthInitializer] Initialization error:', e);
        // 초기화 실패해도 앱은 계속 진행 (anon 상태로)
      }
    })();
  }, [bootstrap]);

  useEffect(() => {
    if (!bootstrapped) return;
    console.log('[AuthInitializer] Bootstrapped, hiding splash screen...');
    const t = setTimeout(() => {
      SplashScreen.hide();
      console.log('[AuthInitializer] Splash screen hidden');
    }, 500); // 1000ms -> 500ms로 단축
    return () => clearTimeout(t);
  }, [bootstrapped]);

  return <>{children}</>;
}
