import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen from '@/screens/OnboardingScreen';
import { OnboardingStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OnboardingMain" component={OnboardingScreen} />
    </Stack.Navigator>
  )
}