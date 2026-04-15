import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/core/stores/authStore';
import { isAdmin, canCreateIncident } from '../../src/core/utils/roles';

type IoniconsName = keyof typeof Ionicons.glyphMap;

function TabIcon({ name, color, size, focused }: {
  name: IoniconsName; color: string; size: number; focused: boolean;
}) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 40 }}>
      <Ionicons
        name={focused ? name.replace('-outline', '') as IoniconsName : name}
        size={size}
        color={color}
      />
      {focused && (
        <View style={{
          position: 'absolute', bottom: -10,
          width: 4, height: 4, borderRadius: 2,
          backgroundColor: '#16a34a',
        }} />
      )}
    </View>
  );
}

export default function TabsLayout() {
  const rol       = useAuthStore((s) => s.user?.rol ?? '');
  const admin     = isAdmin(rol);
  const canCreate = canCreateIncident(rol);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          height: 62,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarActiveTintColor: '#15803d',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarBackground: () => (
          <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
            {/* Línea degradada verde en la parte superior */}
            <LinearGradient
              colors={['#15803d', '#22c55e', '#86efac', '#22c55e', '#15803d']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: 2.5, width: '100%' }}
            />
          </View>
        ),
      }}
    >
      <Tabs.Screen name="home" options={{
        title: 'Inicio',
        tabBarIcon: (p) => <TabIcon name="home-outline" {...p} />,
      }} />
      <Tabs.Screen name="incidents" options={{
        title: 'Incidentes',
        href: admin ? null : undefined,
        tabBarIcon: (p) => <TabIcon name="warning-outline" {...p} />,
      }} />
      <Tabs.Screen name="create-incident" options={{
        title: 'Reportar',
        href: canCreate ? undefined : null,
        tabBarIcon: (p) => <TabIcon name="add-circle-outline" {...p} />,
      }} />
      <Tabs.Screen name="users" options={{
        title: 'Usuarios',
        href: admin ? undefined : null,
        tabBarIcon: (p) => <TabIcon name="people-outline" {...p} />,
      }} />
      <Tabs.Screen name="emergency-types" options={{
        title: 'Tipos',
        href: admin ? undefined : null,
        tabBarIcon: (p) => <TabIcon name="list-outline" {...p} />,
      }} />
      <Tabs.Screen name="profile" options={{
        title: 'Perfil',
        tabBarIcon: (p) => <TabIcon name="person-outline" {...p} />,
      }} />
    </Tabs>
  );
}
