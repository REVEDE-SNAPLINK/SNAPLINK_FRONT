import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '@/screens/HomeScreen.tsx';
import { MainStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{headerShown: false}}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  )
}