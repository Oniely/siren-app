import { useFonts } from 'expo-font';
import { SplashScreen, Stack, usePathname } from 'expo-router';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React from 'react';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();

  const [loaded] = useFonts({
    // DMSans: require('@/assets/fonts/DMSans-Italic-VariableFont_opsz,wght.ttf'),
    // DMSansBold: require('@/assets/fonts/DMSans-Bold.ttf'),
    BeVietnamProBold: require('@/assets/fonts/Be_Vietnam_Pro/BeVietnamPro-Bold.ttf'),
    BeVietnamProSemiBold: require('@/assets/fonts/Be_Vietnam_Pro/BeVietnamPro-SemiBold.ttf'),
    BeVietnamProRegular: require('@/assets/fonts/Be_Vietnam_Pro/BeVietnamPro-Regular.ttf'),
    BeVietnamProThin: require('@/assets/fonts/Be_Vietnam_Pro/BeVietnamPro-Thin.ttf'),
    BeVietnamProBlack: require('@/assets/fonts/Be_Vietnam_Pro/BeVietnamPro-Black.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  console.log('Route:', pathname);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)/index" />
        <Stack.Screen name="(tabs)/contacts" />
        <Stack.Screen name="(tabs)/messages" />
        <Stack.Screen name="(tabs)/profile" />
        <Stack.Screen name="(tabs)/map" />
        <Stack.Screen name="(tabs)/view_alert" />
        <Stack.Screen name="(tabs)/report_emergency" />
        <Stack.Screen name="(tabs)/emergency_call" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/register" />
        <Stack.Screen name="(auth)/forgot-password" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
