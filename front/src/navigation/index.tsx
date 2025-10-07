import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import RootNavigator from '@/navigation/RootNavigator.tsx';

export const navigationRef = createNavigationContainerRef();

const linking = {
  prefixes: [
    'snaplink://', // native URI scheme
    'https://snap.lnk' // domain for redirection
  ],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'auth/login',
          SelectType: 'auth/select',
        }
      },
      Main: {
        screens: {
          Home: 'home',
        }
      }
    }
  }
}

export default function AppNavigator() {
  return (
    <NavigationContainer linking={linking} ref={navigationRef}>
      <RootNavigator />
    </NavigationContainer>
  )
}