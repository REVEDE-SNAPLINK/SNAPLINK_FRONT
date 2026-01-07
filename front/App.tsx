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
import BadgeSyncHandler from '@/components/BadgeSyncHandler.tsx';

async function logAppOpen() {
  await analytics().logEvent('app_open');
}

export default function App() {
  useEffect(() => {
    logAppOpen();
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <AuthInitializer>
            <AlertProvider>
              <BadgeSyncHandler>
                <AppNavigator />
              </BadgeSyncHandler>
            </AlertProvider>
          </AuthInitializer>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
