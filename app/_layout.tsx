import { useFonts } from 'expo-font';
import { SplashScreen, Stack, usePathname } from 'expo-router';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React from 'react';
import Loading from '@/components/Loading';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();

  const [loaded] = useFonts({
    DMSans: require('@/assets/fonts/DMSans-Italic-VariableFont_opsz,wght.ttf'),
    DMSansBold: require('@/assets/fonts/DMSans-Bold.ttf'),
    BeVietnamProThin: require('@/assets/fonts/Be_Vietnam_Pro/BeVietnamPro-Thin.ttf'),
    BeVietnamProRegular: require('@/assets/fonts/Be_Vietnam_Pro/BeVietnamPro-Regular.ttf'),
    BeVietnamProMedium: require('@/assets/fonts/Be_Vietnam_Pro/BeVietnamPro-Medium.ttf'),
    BeVietnamProSemiBold: require('@/assets/fonts/Be_Vietnam_Pro/BeVietnamPro-SemiBold.ttf'),
    BeVietnamProBold: require('@/assets/fonts/Be_Vietnam_Pro/BeVietnamPro-Bold.ttf'),
    BeVietnamProBlack: require('@/assets/fonts/Be_Vietnam_Pro/BeVietnamPro-Black.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return <Loading />;
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
        {/* portals  */}
        <Stack.Screen name="user" />
        <Stack.Screen name="responder" />
        <Stack.Screen name="admin" />
        {/* auth */}
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/register" />
        <Stack.Screen name="(auth)/forgot-password" />
        {/* not-found  */}
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
