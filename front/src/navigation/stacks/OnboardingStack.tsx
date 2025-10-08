import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen from '@/screens/OnboardingScreen';

const Stack = createNativeStackNavigator();

export default function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OnboardingMain" component={OnboardingScreen} />
    </Stack.Navigator>
  )
}