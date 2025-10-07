import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/context/ThemeContext.tsx';
import AppNavigator from '@/navigation';
import { AuthProvider } from '@/context/AuthContext.tsx';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SafeAreaProvider>
          <AppNavigator />
        </SafeAreaProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
