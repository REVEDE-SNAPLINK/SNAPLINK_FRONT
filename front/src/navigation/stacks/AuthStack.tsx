import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginContainer from '@/screens/auth/Login/LoginContainer';
import SelectTypeContainer from '@/screens/auth/SelectType/SelectTypeContainer';
import { AuthStackParamList } from '@/types/navigation';
import UserOnboardingContainer from '@/screens/auth/UserOnboarding/UserOnboardingContainer.tsx';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{headerShown: false}}
    >
      <Stack.Screen name="Login" component={LoginContainer} />
      <Stack.Screen name="SelectType" component={SelectTypeContainer} />
      <Stack.Screen name="UserOnboarding" component={UserOnboardingContainer} />
    </Stack.Navigator>
  )
}