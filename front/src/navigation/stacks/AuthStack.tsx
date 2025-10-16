import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginContainer from '@/screens/auth/Container/LoginContainer.tsx';

type AuthParamList = {
  Login: undefined;
}

const Stack = createNativeStackNavigator<AuthParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{headerShown: false}}
    >
      <Stack.Screen name="Login" component={LoginContainer} />
      <Stack.Screen name="Login" component={LoginContainer} />
    </Stack.Navigator>
  )
}