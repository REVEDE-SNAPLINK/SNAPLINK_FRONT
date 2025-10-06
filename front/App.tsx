import { SafeAreaView, StatusBar, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext.tsx';

function MainScreen() {
  const { theme } = useTheme();
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}
    >
      <TouchableOpacity style={{ backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', width: 200, height: 40 }}>
        <Text style={{ color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily["800"], fontWeight: 800, fontSize: theme.typography.size.xl }}>Hello World!!</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const barStyle = isDarkMode ? 'light-content' : 'dark-content';

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <StatusBar barStyle={barStyle} />
        <MainScreen />
      </SafeAreaProvider>
    </ThemeProvider>
  )
}
