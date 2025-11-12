import { useAuth } from '@/context/AuthContext.tsx';
import React from 'react';
import LoginView from './LoginView';
import { User } from '@/types/auth.ts';
import { useNavigation } from '@react-navigation/native';
import { AuthNavigationProp } from '@/types/navigation';

export default function LoginContainer() {
  const { signIn } = useAuth();
  const authNavigation = useNavigation<AuthNavigationProp>();

  const onLogin = async (apiUrl: string) => {
    console.log(apiUrl);
    const response = { isAllowed: true };
    let token = "asdf";
    const user: User = {
      id: '1',
      name: 'user1',
      email: '',
      userType: 'user',
    }
    signIn(token, user, !response.isAllowed);
    if (!response.isAllowed) {
      authNavigation.navigate('SelectType')
    }
  }

  const handleKakaoLogin = async () => {
    await onLogin('/api/v1/auth/kakao/login');
  }
  const handleNaverLogin = async () => {
    await onLogin('/api/v1/auth/naver/login');
  }
  const handleGoogleLogin = async () => {
    await onLogin('/api/v1/auth/google/login');
  }

  return <LoginView
    onKakaoLogin={handleKakaoLogin}
    onNaverLogin={handleNaverLogin}
    onGoogleLogin={handleGoogleLogin}
  />
}