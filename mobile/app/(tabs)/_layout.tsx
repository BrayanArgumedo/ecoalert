import { Tabs } from 'expo-router';

export default function TabsLayout() {
  // TODO: configurar tabs con iconos según rol del usuario
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="incidents" options={{ title: 'Incidencias' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
