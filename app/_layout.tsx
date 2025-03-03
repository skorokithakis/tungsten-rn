import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import * as ScreenOrientation from 'expo-screen-orientation';

import { useColorScheme } from '@/hooks/useColorScheme';
import { ScreensProvider } from '../src/stores/screensStore';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    async function setupOrientation() {
      // Enable all orientations
      await ScreenOrientation.unlockAsync();

      // Get current orientation
      const orientation = await ScreenOrientation.getOrientationAsync();
      console.log('Current orientation:', orientation);

      // Listen to orientation changes
      ScreenOrientation.addOrientationChangeListener((event) => {
        const orientation = event.orientationInfo.orientation;
        console.log('Orientation changed:', orientation);
      });
    }

    setupOrientation();

    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ScreensProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ScreensProvider>
    </ThemeProvider>
  );
}
