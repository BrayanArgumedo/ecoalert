// app/index.tsx
// Pantalla de entrada: redirige según el estado de autenticación.
// Muestra un spinner mientras loadSession restaura la sesión guardada,
// luego redirige a Home si ya está autenticado o a Login si no lo está.

import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../src/core/stores/authStore';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#1a6b3a" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}
