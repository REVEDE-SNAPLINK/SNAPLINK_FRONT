import { Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext.tsx';

export default function LoginScreen({ navigation }: any) {
  const { autoLogin, setAutoLogin, signIn } = useAuth();

  const onLogin = async () => {
    const isNew = false;
    await signIn('TOKEN_X', { id: '123', userType: 'user', name: 'User' });
    if (isNew) {
      navigation.navigate('SignupStart');
    }
  }


  return (
    <SafeAreaView>
      <View>
        <Text>Login Page</Text>
        <View>
          <Switch value={autoLogin} onValueChange={setAutoLogin} />
        </View>
        <TouchableOpacity onPress={onLogin}>
          <Text>로그인</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}