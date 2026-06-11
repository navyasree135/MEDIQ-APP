try {
  const KeepAwake = require('expo-keep-awake');
  if (KeepAwake) {
    KeepAwake.activateKeepAwake = () => Promise.resolve();
    KeepAwake.activateKeepAwakeAsync = () => Promise.resolve();
    KeepAwake.deactivateKeepAwake = () => {};
    KeepAwake.useKeepAwake = () => {};
  }
} catch (e) {}

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/providers/auth-provider';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="verify-phone" options={{ headerShown: false }} />
          <Stack.Screen name="continue-profile" options={{ headerShown: false }} />
          <Stack.Screen name="medical-history" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="emergency-alert" options={{ headerShown: false }} />
          <Stack.Screen name="recommended-doctors" options={{ headerShown: false }} />
          <Stack.Screen name="doctor-details" options={{ headerShown: false }} />
          <Stack.Screen name="select-slot" options={{ headerShown: false }} />
          <Stack.Screen name="appointment-summary" options={{ headerShown: false }} />
          <Stack.Screen name="payment" options={{ headerShown: false }} />
          <Stack.Screen name="booking-confirmed" options={{ headerShown: false }} />
          <Stack.Screen name="my-appointments" options={{ headerShown: false }} />
          <Stack.Screen name="appointment-details" options={{ headerShown: false }} />
          <Stack.Screen name="queue-tracker" options={{ headerShown: false }} />
          <Stack.Screen name="hospital-checkin" options={{ headerShown: false }} />
          <Stack.Screen name="prescriptions-list" options={{ headerShown: false }} />
          <Stack.Screen name="prescription-details" options={{ headerShown: false }} />
          <Stack.Screen name="medicine-view" options={{ headerShown: false }} />
          <Stack.Screen name="medicine-reminder" options={{ headerShown: false }} />
          <Stack.Screen name="lab-tests" options={{ headerShown: false }} />
          <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
          <Stack.Screen name="notifications-settings" options={{ headerShown: false }} />
          <Stack.Screen name="help-support" options={{ headerShown: false }} />
          <Stack.Screen name="rate-experience" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
