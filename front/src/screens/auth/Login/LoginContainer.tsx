import LoginView from './LoginView';
import { useAuthStore } from '@/store/authStore';
import { showSimpleErrorAlert } from '@/utils/error';
import { Platform } from 'react-native';

// 테스트 계정 ID (플랫폼별 구분)
const TEST_ACCOUNT_IDS = {
  ios: {
    test1: 'ios-test-account-111',
    test2: 'ios-test-account-22',
  },
  android: {
    test1: 'android-test-account-1',
    test2: 'android-test-account-2',
  },
};

/**
 * 사용자가 로그인을 취소한 경우인지 확인
 * - Kakao: 메시지에 'cancel' 포함 또는 특정 에러 코드
 * - Apple: code === 1001 (ERR_CANCELED) 또는 'ERR_CANCELED' 문자열
 */
const isLoginCanceled = (error: any): boolean => {
  if (!error) return false;

  // Apple: appleAuth.Error.CANCELED = 1001
  if (error.code === 1001 || error.code === '1001') return true;

  // 일반적인 취소 코드
  if (error.code === 'ERR_CANCELED') return true;

  // 메시지에 cancel/cancelled 포함 (Kakao 등)
  const message = error.message?.toLowerCase() || '';
  return message.includes('cancel');
};

export default function LoginContainer() {
  const { signInWithKakao, signInWithApple, signInWithTestAccount } = useAuthStore();

  const handleKakaoLogin = async () => {
    try {
      await signInWithKakao();
    } catch (e: any) {
      if (isLoginCanceled(e)) return;
      showSimpleErrorAlert('로그인 실패', e);
    }
  };

  const handleTest1Login = async () => {
    try {
      const testId = Platform.OS === 'ios'
        ? TEST_ACCOUNT_IDS.ios.test1
        : TEST_ACCOUNT_IDS.android.test1;
      await signInWithTestAccount(testId);
    } catch (e: any) {
      showSimpleErrorAlert('테스트 로그인 실패', e);
    }
  };

  const handleTest2Login = async () => {
    try {
      const testId = Platform.OS === 'ios'
        ? TEST_ACCOUNT_IDS.ios.test2
        : TEST_ACCOUNT_IDS.android.test2;
      await signInWithTestAccount(testId);
    } catch (e: any) {
      showSimpleErrorAlert('테스트 로그인 실패', e);
    }
  };

  const handleAppleLogin = async () => {
    try {
      await signInWithApple();
    } catch (e: any) {
      if (isLoginCanceled(e)) return;
      showSimpleErrorAlert('로그인 실패', e);
    }
  }

  return (
    <LoginView
      onKakaoLogin={handleKakaoLogin}
      onTest1Login={handleTest1Login}
      onTest2Login={handleTest2Login}
      onAppleLogin={handleAppleLogin}
    />
  );
}

