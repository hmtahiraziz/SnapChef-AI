import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        gestureEnabled: false,
        // Match auth header gradient so the status-bar area never flashes white.
        contentStyle: { backgroundColor: '#E8E4EF' },
      }}>
      <Stack.Screen name="sign-in" options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="sign-up" options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen name="verify-email" options={{ gestureEnabled: true }} />
      <Stack.Screen name="forgot-password" options={{ gestureEnabled: true }} />
      <Stack.Screen name="reset-password" options={{ gestureEnabled: true }} />
    </Stack>
  );
}
