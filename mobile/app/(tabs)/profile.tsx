import { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StatusBar,
  Platform, Modal, Image, FlatList, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/core/stores/authStore';
import { getRolColor, getRolDisplay } from '../../src/core/utils/roles';
import { avatarUrl, AVATAR_SEEDS } from '../../src/core/utils/avatar';

export default function ProfileScreen() {
  const router                      = useRouter();
  const { user, logout, updateAvatar } = useAuthStore();
  const rolColor                    = getRolColor(user?.rol ?? '');

  const [avatarModal, setAvatarModal] = useState(false);
  const [selected,    setSelected]    = useState<string | null>(null);
  const [saving,      setSaving]      = useState(false);

  const currentSeed = user?.avatar_seed ?? user?.nombre ?? 'default';

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const handleSaveAvatar = async () => {
    if (!selected || selected === currentSeed) { setAvatarModal(false); return; }
    setSaving(true);
    try {
      await updateAvatar(selected);
      setAvatarModal(false);
      setSelected(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8faf9' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ══ Header ════════════════════════════════════════════ */}
        <LinearGradient
          colors={['#dcfce7', '#f0fdf4', '#ffffff']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ paddingTop: Platform.OS === 'ios' ? 56 : 48, paddingHorizontal: 20, paddingBottom: 28, alignItems: 'center', overflow: 'hidden' }}
        >
          <View style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(34,197,94,0.1)' }} />
          <View style={{ position: 'absolute', top: 30, left: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(134,239,172,0.15)' }} />

          {/* Avatar grande + botón editar */}
          <TouchableOpacity onPress={() => setAvatarModal(true)} activeOpacity={0.85} style={{ marginBottom: 14 }}>
            <View style={{
              width: 88, height: 88, borderRadius: 26, overflow: 'hidden',
              backgroundColor: `${rolColor}15`,
              borderWidth: 3, borderColor: `${rolColor}35`,
            }}>
              <Image
                source={{ uri: avatarUrl(currentSeed, 88) }}
                style={{ width: 88, height: 88 }}
              />
            </View>
            {/* Badge editar */}
            <View style={{
              position: 'absolute', bottom: -4, right: -4,
              width: 26, height: 26, borderRadius: 13,
              backgroundColor: '#15803d', borderWidth: 2, borderColor: '#ffffff',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name="pencil" size={12} color="white" />
            </View>
          </TouchableOpacity>

          <Text style={{ color: '#111827', fontSize: 20, fontWeight: '800' }}>{user?.nombre}</Text>
          <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>Toca el avatar para cambiarlo</Text>

          <View style={{
            marginTop: 10, paddingHorizontal: 14, paddingVertical: 5,
            borderRadius: 20, backgroundColor: `${rolColor}12`,
            borderWidth: 1.5, borderColor: `${rolColor}35`,
            flexDirection: 'row', alignItems: 'center', gap: 6,
          }}>
            <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: rolColor }} />
            <Text style={{ color: rolColor, fontSize: 12, fontWeight: '700' }}>{getRolDisplay(user?.rol ?? '')}</Text>
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
            <InfoRow icon="mail-outline"             label="Correo"    value={user?.correo ?? '—'}              iconColor="#2563eb" />
            <Divider />
            <InfoRow icon="location-outline"         label="Localidad" value={user?.localidad ?? 'Sin localidad'} iconColor="#d97706" />
            <Divider />
            <InfoRow icon="shield-checkmark-outline" label="Rol"       value={getRolDisplay(user?.rol ?? '') || '—'}                 iconColor={rolColor} valueColor={rolColor} />
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

      {/* ══ Modal selector de avatar ════════════════════════════════ */}
      <Modal visible={avatarModal} transparent animationType="slide" onRequestClose={() => !saving && setAvatarModal(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} activeOpacity={1} onPress={() => !saving && setAvatarModal(false)} />
        <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}>

          {/* Handle */}
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#e5e7eb', alignSelf: 'center', marginBottom: 20 }} />

          <Text style={{ color: '#111827', fontSize: 18, fontWeight: '800', marginBottom: 4 }}>Elige tu avatar</Text>
          <Text style={{ color: '#9ca3af', fontSize: 13, marginBottom: 20 }}>Selecciona uno y guarda los cambios</Text>

          {/* Vista previa */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View style={{
              width: 80, height: 80, borderRadius: 24, overflow: 'hidden',
              backgroundColor: '#f0fdf4', borderWidth: 2.5, borderColor: '#86efac',
            }}>
              <Image
                source={{ uri: avatarUrl(selected ?? currentSeed, 80) }}
                style={{ width: 80, height: 80 }}
              />
            </View>
            <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 8 }}>Vista previa</Text>
          </View>

          {/* Grid de opciones */}
          <FlatList
            data={AVATAR_SEEDS}
            keyExtractor={(item) => item}
            numColumns={4}
            scrollEnabled={false}
            columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
            renderItem={({ item }) => {
              const isSelected = (selected ?? currentSeed) === item;
              return (
                <TouchableOpacity
                  onPress={() => setSelected(item)}
                  disabled={saving}
                  style={{
                    width: 68, height: 68, borderRadius: 20, overflow: 'hidden',
                    borderWidth: isSelected ? 2.5 : 1.5,
                    borderColor: isSelected ? '#15803d' : '#e5e7eb',
                  }}
                >
                  <Image source={{ uri: avatarUrl(item, 68) }} style={{ width: 68, height: 68 }} />
                  {isSelected && (
                    <View style={{
                      position: 'absolute', bottom: 2, right: 2,
                      width: 18, height: 18, borderRadius: 9,
                      backgroundColor: '#15803d', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Ionicons name="checkmark" size={11} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />

          {/* Botón guardar */}
          <TouchableOpacity
            onPress={handleSaveAvatar}
            disabled={saving || !selected || selected === currentSeed}
            activeOpacity={0.85}
            style={{
              marginTop: 8, borderRadius: 14, overflow: 'hidden',
              opacity: (!selected || selected === currentSeed) ? 0.5 : 1,
            }}
          >
            <LinearGradient
              colors={['#15803d', '#16a34a']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}
            >
              {saving
                ? <ActivityIndicator color="white" size="small" />
                : <>
                    <Ionicons name="checkmark-circle-outline" size={18} color="white" />
                    <Text style={{ color: 'white', fontWeight: '800', fontSize: 15 }}>Guardar avatar</Text>
                  </>
              }
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Modal>
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
