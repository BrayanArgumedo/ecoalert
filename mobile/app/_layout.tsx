import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '../src/core/stores/authStore';
import { authEvents } from '../src/core/services/api';
import '../global.css';

export default function RootLayout() {
  const loadSession = useAuthStore((s) => s.loadSession);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  useEffect(() => {
    loadSession();

    // Si el refresh token expira, cerrar sesión y redirigir al login
    const handleExpired = async () => {
      await logout();
      router.replace('/(auth)/login');
    };
    authEvents.on('session-expired', handleExpired);

    return () => {
      authEvents.off('session-expired', handleExpired);
    };
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
