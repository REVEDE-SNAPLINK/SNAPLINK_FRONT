import LoginView from './LoginView';
import { useAuthStore } from '@/store/authStore';
import { getKeyHashAndroid } from '@react-native-kakao/core';
import { useEffect } from 'react';

// 또는 일반적인 확인 코드
const fetchHashKey = async () => {
  try {
    const hash = await getKeyHashAndroid();
    console.log("📌 내 앱의 키 해시:", hash);
  } catch (error) {
    console.error("키 해시 추출 실패:", error);
  }
};

export default function LoginContainer() {
  const { signInWithKakao, signInWithProviderToken } = useAuthStore();
  const handleKakaoLogin = async () => {
    try {
      const token = await signInWithKakao();
      if (token !== null && token !== '') {
        signInWithProviderToken("KAKAO", token);
      }
    } catch (error) {
      console.error('Kakao login failed:', error);
    }
  };

  useEffect(() => {
    fetchHashKey();
  }, [])

  return (
    <LoginView onKakaoLogin={handleKakaoLogin} />
  );
}

