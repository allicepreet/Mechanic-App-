import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { MechanicProvider } from '@/components/MechanicContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <MechanicProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="mechanic" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </MechanicProvider>
  );
}
