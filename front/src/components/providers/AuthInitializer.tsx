import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuthStore } from '@/store/authStore.ts';
import { KAKAO_NATIVE_APP_KEY } from '@/config/api.ts';
import { initializeKakaoSDK } from '@react-native-kakao/core';
import SplashScreen from 'react-native-splash-screen';
import { loadRefreshToken } from '@/auth/tokenStore.ts';
import { jwtDecode } from 'jwt-decode';

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
    if (!bootstrapped) return;
    console.log('[AuthInitializer] Bootstrapped, hiding splash screen...');
    const t = setTimeout(() => {
      SplashScreen.hide();
      console.log('[AuthInitializer] Splash screen hidden');
    }, 300);
    return () => clearTimeout(t);
  }, [bootstrapped]);

  // AppState 감지: 백그라운드 → 포그라운드 전환 시 토큰 갱신
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (!bootstrapped) return;

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      // 백그라운드/비활성 → 활성 상태로 전환될 때
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('[AuthInitializer] App came to foreground, refreshing token...');
        const { status, getAccessToken } = useAuthStore.getState();

        // 로그인 상태일 때만 토큰 갱신 시도
        if (status === 'authed') {
          try {
            await getAccessToken();
            console.log('[AuthInitializer] Token refreshed on foreground');
          } catch (e) {
            console.error('[AuthInitializer] Token refresh on foreground failed:', e);
          }
        }
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [bootstrapped]);

  // 주기적 refresh token 만료 체크 (포그라운드에서 방치 대응)
  useEffect(() => {
    if (!bootstrapped) return;

    const checkRefreshTokenExpiry = async () => {
      const { status, getAccessToken } = useAuthStore.getState();

      // 로그인 상태가 아니면 스킵
      if (status !== 'authed') return;

      try {
        const refreshToken = await loadRefreshToken();
        if (!refreshToken) return;

        // refresh token 만료 시간 체크
        const decoded = jwtDecode<{ exp?: number }>(refreshToken);
        if (!decoded.exp) return;

        const msUntilExpiry = decoded.exp * 1000 - Date.now();
        const oneHour = 60 * 60 * 1000;

        console.log(`[AuthInitializer] Refresh token expires in ${Math.round(msUntilExpiry / 1000 / 60)} minutes`);

        // 만료 1시간 이내면 미리 갱신
        if (msUntilExpiry > 0 && msUntilExpiry < oneHour) {
          console.log('[AuthInitializer] Refresh token expiring soon, proactive refresh...');
          await getAccessToken();
          console.log('[AuthInitializer] Proactive token refresh completed');
        }
      } catch (e) {
        console.error('[AuthInitializer] Token expiry check failed:', e);
      }
    };

    // 초기 체크
    checkRefreshTokenExpiry();

    // 30분마다 체크
    const interval = setInterval(checkRefreshTokenExpiry, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [bootstrapped]);

  if (!bootstrapped) {
    return null;
  }

  return <>{children}</>;
}
