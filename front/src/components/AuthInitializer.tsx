import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore.ts';
import { KAKAO_NATIVE_APP_KEY } from '@/config/api.ts';
import { initializeKakaoSDK } from '@react-native-kakao/core';

/**
 * AuthInitializer - 앱 시작 시 인증 상태를 초기화하는 컴포넌트
 */
export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const bootstrap = useAuthStore(state => state.bootstrap);

  useEffect(() => {
    initializeKakaoSDK(`${KAKAO_NATIVE_APP_KEY}`);
    bootstrap();
  }, [bootstrap]);

  return <>{children}</>;
}
