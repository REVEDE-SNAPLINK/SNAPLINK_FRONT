import LoginView from './LoginView';
import { useAuthStore } from '@/store/authStore';
import { useNavigation } from '@react-navigation/native';
import { AuthNavigationProp } from '@/types/navigation.ts';
export default function LoginContainer() {
  const navigation = useNavigation<AuthNavigationProp>();

  const { signInWithKakao, signInWithProviderToken } = useAuthStore();
  const handleKakaoLogin = async () => {
    try {
      const token = await signInWithKakao();
      if (token !== null && token !== '') {
        signInWithProviderToken("KAKAO", token).then((result) => {
          if (result === 'SIGNUP_REQUIRED') {
            navigation.navigate('UserOnboarding');
          }
        });
      }
    } catch (error) {
      console.error('Kakao login failed:', error);
    }
  };

  return (
    <LoginView onKakaoLogin={handleKakaoLogin} />
  );
}

