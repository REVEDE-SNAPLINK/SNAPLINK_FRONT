import React, { useState, useEffect } from 'react';
import LoginView from './LoginView';
import { useNavigation } from '@react-navigation/native';
import { AuthNavigationProp, RootNavigationProp } from '@/types/navigation';
import { useAuthStore } from '@/store/authStore';
import KakaoLoginWebView from '@/components/auth/KakaoLoginWebView';

export default function LoginContainer() {
  const authNavigation = useNavigation<AuthNavigationProp>();
  const rootNavigation = useNavigation<RootNavigationProp>();
  const { status, signInWithKakaoCode } = useAuthStore();
  const [showKakaoWebView, setShowKakaoWebView] = useState(false);

  useEffect(() => {
    if (status === 'needs_signup') {
      authNavigation.navigate('SelectType');
    } else if (status === 'authed') {
      rootNavigation.replace('Main');
    }
  }, [status, authNavigation, rootNavigation]);

  const handleKakaoLogin = () => {
    setShowKakaoWebView(true);
  };

  const handleKakaoSuccess = async (code: string, codeVerifier: string) => {
    setShowKakaoWebView(false);

    try {
      await signInWithKakaoCode(code, codeVerifier);
    } catch (error) {
      console.error('Kakao login failed:', error);
    }
  };

  const handleKakaoClose = () => {
    setShowKakaoWebView(false);
  };

  return (
    <>
      <LoginView onKakaoLogin={handleKakaoLogin} />
      <KakaoLoginWebView
        visible={showKakaoWebView}
        onClose={handleKakaoClose}
        onSuccess={handleKakaoSuccess}
      />
    </>
  );
}