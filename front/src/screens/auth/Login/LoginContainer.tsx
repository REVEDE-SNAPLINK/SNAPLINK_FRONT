import { useAuth } from '@/context/AuthContext.tsx';
import React from 'react';
import LoginView from './LoginView';
import { User } from '@/types/auth.ts';

export default function LoginContainer({ navigation }: any) {
  const { signIn } = useAuth();

  const onLogin = async (apiUrl: string) => {
    console.log(apiUrl);
    const response = { isAllowed: false };
    let token = "asdf";
    const user: User = {
      id: '1',
      name: 'user1',
      email: '',
      userType: 'user',
    }
    signIn(token, user, !response.isAllowed);
    if (response.isAllowed) {
      navigation.replace('Home');
    } else {
      navigation.navigate('Login/auth/select');
    }
  }

  const handleKakaoLogin = async () => {
    await onLogin('/api/v1/auth/kakao/login');
  }
  const handleNaverLogin = async () => {
    await onLogin('/api/v1/auth/kakao/login');
  }
  const handleGoogleLogin = async () => {
    await onLogin('/api/v1/auth/kakao/login');
  }

  return <LoginView
    onKakaoLogin={handleKakaoLogin}
    onNaverLogin={handleNaverLogin}
    onGoogleLogin={handleGoogleLogin}
  />
}