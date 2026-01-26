import LoginView from './LoginView';
import { useAuthStore } from '@/store/authStore';

export default function LoginContainer() {
  const { signInWithKakao, signInWithApple } = useAuthStore();
  const handleKakaoLogin = async () => {
    await signInWithKakao();
  };
  const handleAppleLogin = async () => {
    await signInWithApple();
  }

  return (
    <LoginView
      onKakaoLogin={handleKakaoLogin}
      onAppleLogin={handleAppleLogin}
    />
  );
}

