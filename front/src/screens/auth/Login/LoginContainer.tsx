import LoginView from './LoginView';
import { useAuthStore } from '@/store/authStore';

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

  return (
    <LoginView onKakaoLogin={handleKakaoLogin} />
  );
}

