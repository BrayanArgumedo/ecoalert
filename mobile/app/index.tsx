import { Redirect } from 'expo-router';

export default function Index() {
  // TODO: verificar sesión activa con Zustand/MMKV y redirigir según rol
  return <Redirect href="/(auth)/login" />;
}
