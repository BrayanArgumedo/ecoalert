// app/(auth)/_layout.tsx
// Layout del grupo de autenticación. Agrupa las pantallas de login y
// registro en un Stack sin header visible.

import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
