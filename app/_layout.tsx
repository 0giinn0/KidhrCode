import { Stack, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../lib/constants';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Redirect href="/(tabs)" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/login" options={{ presentation: 'modal' }} />
        <Stack.Screen name="auth/signup" options={{ presentation: 'modal' }} />
        <Stack.Screen name="course/[id]" />
        <Stack.Screen name="exercise/[id]" />
        <Stack.Screen name="creator" />
        <Stack.Screen name="creator/create-course" />
        <Stack.Screen name="creator/edit-course/[id]" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="certificate" />
        <Stack.Screen name="certificate/[id]" />
      </Stack>
    </>
  );
}
