import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore.ts';
import { KAKAO_NATIVE_APP_KEY } from '@/config/api.ts';
import { initializeKakaoSDK } from '@react-native-kakao/core';
import SplashScreen from 'react-native-splash-screen';

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

        // Bootstrap 실행 (FCM 등록은 로그인/회원가입 후 진행)
        await bootstrap();

        const elapsed = Date.now() - startTime;
        console.log(`[AuthInitializer] Initialization completed in ${elapsed}ms`);
      } catch (e) {
        console.error('[AuthInitializer] Initialization error:', e);
        // 초기화 실패해도 앱은 계속 진행 (anon 상태로)
        // bootstrapped를 true로 설정하여 스플래시 화면이 닫히도록 함
        useAuthStore.setState({ bootstrapped: true, status: 'anon' });
      }
    })();
  }, [bootstrap]);

  useEffect(() => {
    SplashScreen.hide();
    if (!bootstrapped) return;
    console.log('[AuthInitializer] Bootstrapped, hiding splash screen...');
    const t = setTimeout(() => {
      SplashScreen.hide();
      console.log('[AuthInitializer] Splash screen hidden');
    }, 500); // 1000ms -> 500ms로 단축
    return () => clearTimeout(t);
  }, [bootstrapped]);

  if (!bootstrapped) {
    return null;
  }

  return <>{children}</>;
}
