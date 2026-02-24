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

async function logAppOpen() {
  await analytics().logEvent('app_open');
}

function App() {
  useEffect(() => {
    logAppOpen();
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