import { View, Text, TouchableOpacity, ScrollView, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/core/stores/authStore';
import { getRolColor } from '../../src/core/utils/roles';

export default function ProfileScreen() {
  const router           = useRouter();
  const { user, logout } = useAuthStore();
  const rolColor         = getRolColor(user?.rol ?? '');

  const initials = user?.nombre
    ?.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase() ?? '??';

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8faf9' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ══ Header con gradiente mint ════════════════════════ */}
        <LinearGradient
          colors={['#dcfce7', '#f0fdf4', '#ffffff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: Platform.OS === 'ios' ? 56 : 48,
            paddingHorizontal: 20, paddingBottom: 28,
            alignItems: 'center', overflow: 'hidden',
          }}
        >
          {/* Blobs decorativos */}
          <View style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(34,197,94,0.1)' }} />
          <View style={{ position: 'absolute', top: 30, left: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(134,239,172,0.15)' }} />
          {/* Avatar */}
          <View style={{
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: `${rolColor}15`,
            borderWidth: 3, borderColor: `${rolColor}35`,
            alignItems: 'center', justifyContent: 'center', marginBottom: 14,
          }}>
            <Text style={{ color: rolColor, fontSize: 28, fontWeight: '800' }}>{initials}</Text>
          </View>

          <Text style={{ color: '#111827', fontSize: 20, fontWeight: '800' }}>{user?.nombre}</Text>

          <View style={{
            marginTop: 8, paddingHorizontal: 14, paddingVertical: 5,
            borderRadius: 20, backgroundColor: `${rolColor}12`,
            borderWidth: 1.5, borderColor: `${rolColor}35`,
            flexDirection: 'row', alignItems: 'center', gap: 6,
          }}>
            <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: rolColor }} />
            <Text style={{ color: rolColor, fontSize: 12, fontWeight: '700' }}>{user?.rol}</Text>
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 20, paddingTop: 20, gap: 12 }}>

          {/* ══ Info ════════════════════════════════════════════ */}
          <View style={{
            backgroundColor: '#ffffff', borderRadius: 16,
            borderWidth: 1, borderColor: '#f0f0f0',
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
            overflow: 'hidden',
          }}>
            <InfoRow icon="mail-outline"     label="Correo"    value={user?.correo ?? '—'}             iconColor="#2563eb" />
            <Divider />
            <InfoRow icon="location-outline" label="Localidad" value={user?.localidad ?? 'Sin localidad'} iconColor="#d97706" />
            <Divider />
            <InfoRow icon="shield-checkmark-outline" label="Rol" value={user?.rol ?? '—'}              iconColor={rolColor} valueColor={rolColor} />
          </View>

          {/* ══ Cerrar sesión ════════════════════════════════════ */}
          <TouchableOpacity onPress={handleLogout} activeOpacity={0.85}>
            <View style={{
              backgroundColor: '#ffffff', borderRadius: 16, padding: 16,
              flexDirection: 'row', alignItems: 'center', gap: 14,
              borderWidth: 1, borderColor: '#fee2e2',
              shadowColor: '#dc2626', shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
            }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="log-out-outline" size={20} color="#dc2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#dc2626', fontSize: 15, fontWeight: '700' }}>Cerrar sesión</Text>
                <Text style={{ color: '#fca5a5', fontSize: 12, marginTop: 1 }}>Salir de tu cuenta</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#fca5a5" />
            </View>
          </TouchableOpacity>

          <Text style={{ color: '#9ca3af', fontSize: 11, textAlign: 'center', marginTop: 8 }}>
            EcoAlert v1.0.0 · Gestión de emergencias ambientales
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: '#f3f4f6', marginHorizontal: 16 }} />;
}

function InfoRow({ icon, label, value, iconColor, valueColor }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string; value: string; iconColor: string; valueColor?: string;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 }}>
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${iconColor}12`, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={19} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#9ca3af', fontSize: 11, marginBottom: 2 }}>{label}</Text>
        <Text style={{ color: valueColor ?? '#111827', fontSize: 14, fontWeight: '600' }}>{value}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#e5e7eb" />
    </View>
  );
}
