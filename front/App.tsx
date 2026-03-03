import 'text-encoding';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from '@/navigation';
import AuthInitializer from '@/components/AuthInitializer';
import { queryClient } from '@/config/queryClient';
import { AlertProvider } from '@/components/theme';
import analytics from '@react-native-firebase/analytics';
import { useEffect } from 'react';
import NotificationHandler from '@/components/NotificationHandler';
import ErrorBoundary from '@/components/ErrorBoundary';
import codePush from '@revopush/react-native-code-push';
import NaverLogin from '@react-native-seoul/naver-login';

async function logAppOpen() {
  await analytics().logEvent('app_open');
}

const consumerKey = 'txtK2qa_9fyHd0VTur39';
const consumerSecret = 'dievjxb5FQ';
const appName = '스냅링크';

const serviceUrlScheme = 'snaplinkSV1KQ3L7CK';

function initNaverLogin() {
  NaverLogin.initialize({
    appName,
    consumerKey,
    consumerSecret,
    serviceUrlSchemeIOS: serviceUrlScheme,
    disableNaverAppAuthIOS: true,
  });
}


function App() {
  useEffect(() => {
    logAppOpen();
    initNaverLogin();
  }, []);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <QueryClientProvider client={queryClient}>
            <AuthInitializer>
              <NotificationHandler>
                <AlertProvider>
                  <AppNavigator />
                </AlertProvider>
              </NotificationHandler>
            </AuthInitializer>
          </QueryClientProvider>
        </GestureHandlerRootView>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

export default codePush({
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  installMode: codePush.InstallMode.IMMEDIATE,
  minimumBackgroundDuration: 0,
})(App);