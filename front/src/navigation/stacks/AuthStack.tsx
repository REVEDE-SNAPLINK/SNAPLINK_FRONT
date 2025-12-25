import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginContainer from '@/screens/auth/Login/LoginContainer';
import SelectTypeContainer from '@/screens/auth/SelectType/SelectTypeContainer';
import { AuthStackParamList } from '@/types/navigation';
import UserOnboardingContainer from '@/screens/auth/UserOnboarding/UserOnboardingContainer.tsx';
import { useAuthStore } from '@/store/authStore.ts';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  const { status } = useAuthStore();

  return (
    <Stack.Navigator
      initialRouteName={status === "needs_signup" ? 'SelectType' : 'Login'}
      screenOptions={{headerShown: false}}
    >
      {status === 'needs_signup' ? (
        <>
          <Stack.Screen name="SelectType" component={SelectTypeContainer} />
        </>
      ): (
        <Stack.Screen name="Login" component={LoginContainer} />
      )}
      <Stack.Screen name="UserOnboarding" component={UserOnboardingContainer} />
    </Stack.Navigator>
  )
}