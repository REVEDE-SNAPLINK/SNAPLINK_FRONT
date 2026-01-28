import LoginView from './LoginView';
import { useAuthStore } from '@/store/authStore';
import { showSimpleErrorAlert } from '@/utils/error';

export default function LoginContainer() {
  const { signInWithKakao, signInWithApple, status } = useAuthStore();
  const isLoading = status === 'loading';

  const handleKakaoLogin = async () => {
    try {
      await signInWithKakao();
    } catch (e: any) {
      if (e.code === 'ERR_CANCELED') return; // User cancelled
      showSimpleErrorAlert('로그인 실패', e);
    }
  };

  const handleAppleLogin = async () => {
    try {
      await signInWithApple();
    } catch (e: any) {
      if (e.code === 'ERR_CANCELED') return;
      showSimpleErrorAlert('로그인 실패', e);
    }
  }

  return (
    <LoginView
      onKakaoLogin={handleKakaoLogin}
      onAppleLogin={handleAppleLogin}
      isLoading={isLoading}
    />
  );
}

