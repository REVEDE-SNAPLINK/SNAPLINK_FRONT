import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginContainer from '@/screens/auth/Login/LoginContainer';
import { AuthStackParamList } from '@/types/navigation';
import UserOnboardingContainer from '@/screens/auth/UserOnboarding/UserOnboardingContainer.tsx';
import { useAuthStore } from '@/store/authStore.ts';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  const { status } = useAuthStore();

  return (
    <Stack.Navigator
      initialRouteName={status === 'needs_signup' ? 'UserOnboarding' : 'Login'}
      screenOptions={{ headerShown: false }}
    >
      {status === 'needs_signup' ? (
        <Stack.Screen name="UserOnboarding" component={UserOnboardingContainer} />
      ) : (
        <Stack.Screen name="Login" component={LoginContainer} />
      )}
    </Stack.Navigator>
  )
}