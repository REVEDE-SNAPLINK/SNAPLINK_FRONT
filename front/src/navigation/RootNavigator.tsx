import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/context/AuthContext.tsx';
import { useEffect, useState } from 'react';
import SplashScreen from '@/screens/SplashScreen.tsx';
import MainStack from '@/navigation/stacks/MainStack.tsx';
import AuthStack from '@/navigation/stacks/AuthStack.tsx';
import OnboardingStack from '@/navigation/stacks/OnboardingStack.tsx';

export type RootStackParamList = { Onboarding: undefined; Auth: undefined; Main: undefined; }

const Stack = createNativeStackNavigator<RootStackParamList>();

// 최소 스플래시 노출 시간(ms)
const MIN_SPLASH_DELAY = __DEV__ ? 400 : 1200;

export default function RootNavigator() {
  const { status, onboardingSeen } = useAuth();
  const [minDelayDone, setMinDelayDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinDelayDone(true), MIN_SPLASH_DELAY);
    return () => clearTimeout(t);
  }, []);

  const shouldShowSplash = !minDelayDone || status === 'checking';
  if (shouldShowSplash) {
    return <SplashScreen/>;
  }

  return (
    <Stack.Navigator screenOptions={{headerShown: false}} >
      {!onboardingSeen ? (
        <Stack.Screen name="Onboarding" component={OnboardingStack} />
      ) : status === 'signedIn' ? (
        <Stack.Screen name="Main" component={MainStack} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  )
}