import LoginView from './LoginView';
import { useAuthStore } from '@/store/authStore';
import { showSimpleErrorAlert } from '@/utils/error';
import { Platform } from 'react-native';

// 테스트 계정 ID (플랫폼별 구분)
const TEST_ACCOUNT_IDS = {
  ios: {
    test1: 'ios-test-account-1',
    test2: 'ios-test-account-2',
  },
  android: {
    test1: 'android-test-account-1',
    test2: 'android-test-account-2',
  },
};

export default function LoginContainer() {
  const { signInWithKakao, signInWithApple, signInWithTestAccount } = useAuthStore();

  const handleKakaoLogin = async () => {
    try {
      await signInWithKakao();
    } catch (e: any) {
      if (e.code === 'ERR_CANCELED') return; // User cancelled
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
      if (e.code === 'ERR_CANCELED') return;
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

