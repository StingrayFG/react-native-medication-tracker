import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
 
import { useColorScheme } from '@/hooks/useColorScheme';

import db from '@/db/client';
import migrations from '@/drizzle/migrations';
import backgroundServices from '@/services/backgroundServices';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  //
  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    if (error) {
      console.log(success, error)
    }
  }, [success, error])

  useEffect(() => {
    (async () => {
      await backgroundServices.startBackgroundService();
    })();
  }, [])

  //
  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name='(panels)' options={{ headerShown: false }}/>
        <Stack.Screen name='+not-found' />
      </Stack>
      <StatusBar style='auto' />
    </ThemeProvider>
  );
}
