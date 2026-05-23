import { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StatusBar,
  Platform, Modal, Image, FlatList, ActivityIndicator,
  TextInput, KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/core/stores/authStore';
import { getRolColor, getRolDisplay } from '../../src/core/utils/roles';
import { avatarUrl, AVATAR_SEEDS } from '../../src/core/utils/avatar';

export default function ProfileScreen() {
  const router                                              = useRouter();
  const { user, logout, updateAvatar, updateProfile, changePassword } = useAuthStore();
  const rolColor                                           = getRolColor(user?.rol ?? '');
  const currentSeed                                        = user?.avatar_seed ?? user?.nombre ?? 'default';

  // ── Avatar ────────────────────────────────────────────────────
  const [avatarModal,  setAvatarModal]  = useState(false);
  const [selectedSeed, setSelectedSeed] = useState<string | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);

  // ── Editar datos ──────────────────────────────────────────────
  const [editModal,     setEditModal]     = useState(false);
  const [editNombre,    setEditNombre]    = useState('');
  const [editTelefono,  setEditTelefono]  = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError,  setProfileError]  = useState('');

  // ── Modal éxito contraseña ───────────────────────────────────
  const [successModal, setSuccessModal] = useState(false);

  // ── Cambiar contraseña ────────────────────────────────────────
  const [pwdModal,      setPwdModal]      = useState(false);
  const [pwdActual,     setPwdActual]     = useState('');
  const [pwdNueva,      setPwdNueva]      = useState('');
  const [pwdConfirmar,  setPwdConfirmar]  = useState('');
  const [savingPwd,     setSavingPwd]     = useState(false);
  const [pwdError,      setPwdError]      = useState('');
  const [showActual,    setShowActual]    = useState(false);
  const [showNueva,     setShowNueva]     = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);

  // ── Handlers ─────────────────────────────────────────────────

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const handleSaveAvatar = async () => {
    if (!selectedSeed || selectedSeed === currentSeed) { setAvatarModal(false); return; }
    setSavingAvatar(true);
    try {
      await updateAvatar(selectedSeed);
      setAvatarModal(false);
      setSelectedSeed(null);
    } finally {
      setSavingAvatar(false);
    }
  };

  const openEditModal = () => {
    setEditNombre(user?.nombre ?? '');
    setEditTelefono(user?.telefono ?? '');
    setProfileError('');
    setEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (!editNombre.trim()) { setProfileError('El nombre es requerido'); return; }
    setSavingProfile(true);
    setProfileError('');
    try {
      await updateProfile(editNombre.trim(), editTelefono.trim());
      setEditModal(false);
    } catch (err: any) {
      setProfileError(err?.response?.data?.message ?? err?.message ?? 'Error al guardar');
    } finally {
      setSavingProfile(false);
    }
  };

  const openPwdModal = () => {
    setPwdActual(''); setPwdNueva(''); setPwdConfirmar('');
    setPwdError('');
    setShowActual(false); setShowNueva(false); setShowConfirmar(false);
    setPwdModal(true);
  };

  const handleChangePassword = async () => {
    if (!pwdActual)              { setPwdError('Ingresa tu contraseña actual'); return; }
    if (pwdNueva.length < 6)    { setPwdError('La nueva contraseña debe tener al menos 6 caracteres'); return; }
    if (pwdNueva !== pwdConfirmar) { setPwdError('Las contraseñas no coinciden'); return; }
    setSavingPwd(true);
    setPwdError('');
    try {
      await changePassword(pwdActual, pwdNueva);
      setPwdModal(false);
      setSuccessModal(true);
    } catch (err: any) {
      setPwdError(err?.response?.data?.message ?? err?.message ?? 'Error al cambiar contraseña');
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8faf9' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <LinearGradient
          colors={['#dcfce7', '#f0fdf4', '#ffffff']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ paddingTop: Platform.OS === 'ios' ? 56 : 48, paddingHorizontal: 20, paddingBottom: 28, alignItems: 'center', overflow: 'hidden' }}
        >
          <View style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(34,197,94,0.1)' }} />
          <View style={{ position: 'absolute', top: 30, left: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(134,239,172,0.15)' }} />

          <TouchableOpacity onPress={() => setAvatarModal(true)} activeOpacity={0.85} style={{ marginBottom: 14 }}>
            <View style={{ width: 88, height: 88, borderRadius: 26, overflow: 'hidden', backgroundColor: `${rolColor}15`, borderWidth: 3, borderColor: `${rolColor}35` }}>
              <Image source={{ uri: avatarUrl(currentSeed, 88) }} style={{ width: 88, height: 88 }} />
            </View>
            <View style={{ position: 'absolute', bottom: -4, right: -4, width: 26, height: 26, borderRadius: 13, backgroundColor: '#15803d', borderWidth: 2, borderColor: '#ffffff', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="pencil" size={12} color="white" />
            </View>
          </TouchableOpacity>

          <Text style={{ color: '#111827', fontSize: 20, fontWeight: '800' }}>{user?.nombre}</Text>
          <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>Toca el avatar para cambiarlo</Text>

          <View style={{ marginTop: 10, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, backgroundColor: `${rolColor}12`, borderWidth: 1.5, borderColor: `${rolColor}35`, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: rolColor }} />
            <Text style={{ color: rolColor, fontSize: 12, fontWeight: '700' }}>{getRolDisplay(user?.rol ?? '')}</Text>
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 20, paddingTop: 20, gap: 12 }}>

          {/* ── Mis datos ──────────────────────────────────────────── */}
          <SectionLabel>Mis datos</SectionLabel>
          <View style={{ backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#f0f0f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, overflow: 'hidden' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 }}>
              <Text style={{ color: '#374151', fontSize: 13, fontWeight: '700' }}>Información personal</Text>
              <TouchableOpacity onPress={openEditModal} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#bbf7d0' }}>
                <Ionicons name="pencil-outline" size={13} color="#15803d" />
                <Text style={{ color: '#15803d', fontSize: 12, fontWeight: '700' }}>Editar</Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: 1, backgroundColor: '#f3f4f6' }} />
            <InfoRow icon="person-outline"  label="Nombre"   value={user?.nombre ?? '—'}                   iconColor="#15803d" />
            <Divider />
            <InfoRow icon="call-outline"    label="Teléfono" value={user?.telefono || 'Sin teléfono'}       iconColor="#15803d" />
          </View>

          {/* ── Mi cuenta ──────────────────────────────────────────── */}
          <SectionLabel>Mi cuenta</SectionLabel>
          <View style={{ backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#f0f0f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, overflow: 'hidden' }}>
            <InfoRow icon="mail-outline"             label="Correo"    value={user?.correo ?? '—'}                  iconColor="#2563eb" />
            <Divider />
            <InfoRow icon="location-outline"         label="Localidad" value={user?.localidad ?? 'Sin localidad'}   iconColor="#d97706" />
            <Divider />
            <InfoRow icon="shield-checkmark-outline" label="Rol"       value={getRolDisplay(user?.rol ?? '') || '—'} iconColor={rolColor} valueColor={rolColor} />
          </View>

          {/* ── Seguridad ──────────────────────────────────────────── */}
          <SectionLabel>Seguridad</SectionLabel>
          <TouchableOpacity onPress={openPwdModal} activeOpacity={0.85}>
            <View style={{ backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#f0f0f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#f5f3ff', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="lock-closed-outline" size={19} color="#7c3aed" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#111827', fontSize: 14, fontWeight: '600' }}>Cambiar contraseña</Text>
                <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 1 }}>Actualiza tu contraseña de acceso</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#e5e7eb" />
            </View>
          </TouchableOpacity>

          {/* ── Cerrar sesión ──────────────────────────────────────── */}
          <TouchableOpacity onPress={handleLogout} activeOpacity={0.85}>
            <View style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: '#fee2e2', shadowColor: '#dc2626', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 }}>
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

      {/* ══ Modal éxito — contraseña actualizada ═══════════════════ */}
      <Modal visible={successModal} transparent animationType="fade" onRequestClose={() => setSuccessModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <View style={{ backgroundColor: '#ffffff', borderRadius: 24, padding: 28, alignItems: 'center', width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 }}>

            {/* Icono animado */}
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="checkmark" size={32} color="white" />
              </View>
            </View>

            <Text style={{ color: '#111827', fontSize: 20, fontWeight: '800', marginBottom: 8, textAlign: 'center' }}>
              ¡Contraseña actualizada!
            </Text>
            <Text style={{ color: '#6b7280', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
              Tu contraseña se cambió correctamente. Úsala la próxima vez que inicies sesión.
            </Text>

            <TouchableOpacity onPress={() => setSuccessModal(false)} activeOpacity={0.85} style={{ width: '100%', borderRadius: 14, overflow: 'hidden' }}>
              <LinearGradient colors={['#15803d', '#16a34a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 14, alignItems: 'center' }}>
                <Text style={{ color: 'white', fontWeight: '800', fontSize: 15 }}>Entendido</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ══ Modal selector de avatar ════════════════════════════════ */}
      <Modal visible={avatarModal} transparent animationType="slide" onRequestClose={() => !savingAvatar && setAvatarModal(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} activeOpacity={1} onPress={() => !savingAvatar && setAvatarModal(false)} />
        <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#e5e7eb', alignSelf: 'center', marginBottom: 20 }} />
          <Text style={{ color: '#111827', fontSize: 18, fontWeight: '800', marginBottom: 4 }}>Elige tu avatar</Text>
          <Text style={{ color: '#9ca3af', fontSize: 13, marginBottom: 20 }}>Selecciona uno y guarda los cambios</Text>

          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View style={{ width: 80, height: 80, borderRadius: 24, overflow: 'hidden', backgroundColor: '#f0fdf4', borderWidth: 2.5, borderColor: '#86efac' }}>
              <Image source={{ uri: avatarUrl(selectedSeed ?? currentSeed, 80) }} style={{ width: 80, height: 80 }} />
            </View>
            <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 8 }}>Vista previa</Text>
          </View>

          <FlatList
            data={AVATAR_SEEDS}
            keyExtractor={(item) => item}
            numColumns={4}
            scrollEnabled={false}
            columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
            renderItem={({ item }) => {
              const isSelected = (selectedSeed ?? currentSeed) === item;
              return (
                <TouchableOpacity
                  onPress={() => setSelectedSeed(item)}
                  disabled={savingAvatar}
                  style={{ width: 68, height: 68, borderRadius: 20, overflow: 'hidden', borderWidth: isSelected ? 2.5 : 1.5, borderColor: isSelected ? '#15803d' : '#e5e7eb' }}
                >
                  <Image source={{ uri: avatarUrl(item, 68) }} style={{ width: 68, height: 68 }} />
                  {isSelected && (
                    <View style={{ position: 'absolute', bottom: 2, right: 2, width: 18, height: 18, borderRadius: 9, backgroundColor: '#15803d', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="checkmark" size={11} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />

          <TouchableOpacity
            onPress={handleSaveAvatar}
            disabled={savingAvatar || !selectedSeed || selectedSeed === currentSeed}
            activeOpacity={0.85}
            style={{ marginTop: 8, borderRadius: 14, overflow: 'hidden', opacity: (!selectedSeed || selectedSeed === currentSeed) ? 0.5 : 1 }}
          >
            <LinearGradient colors={['#15803d', '#16a34a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}>
              {savingAvatar
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

      {/* ══ Modal editar datos ══════════════════════════════════════ */}
      <Modal visible={editModal} transparent animationType="slide" onRequestClose={() => !savingProfile && setEditModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} activeOpacity={1} onPress={() => !savingProfile && setEditModal(false)} />
          <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 28 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#e5e7eb', alignSelf: 'center', marginBottom: 20 }} />
            <Text style={{ color: '#111827', fontSize: 18, fontWeight: '800', marginBottom: 4 }}>Editar datos</Text>
            <Text style={{ color: '#9ca3af', fontSize: 13, marginBottom: 20 }}>Actualiza tu nombre y número de teléfono</Text>

            <LabeledInput
              label="Nombre completo"
              value={editNombre}
              onChangeText={setEditNombre}
              placeholder="Tu nombre completo"
              icon="person-outline"
            />
            <View style={{ height: 12 }} />
            <LabeledInput
              label="Teléfono"
              value={editTelefono}
              onChangeText={setEditTelefono}
              placeholder="Ej: 3001234567"
              icon="call-outline"
              keyboardType="phone-pad"
            />

            {!!profileError && <ErrorBanner message={profileError} />}

            <TouchableOpacity
              onPress={handleSaveProfile}
              disabled={savingProfile}
              activeOpacity={0.85}
              style={{ marginTop: 20, borderRadius: 14, overflow: 'hidden' }}
            >
              <LinearGradient colors={['#15803d', '#16a34a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}>
                {savingProfile
                  ? <ActivityIndicator color="white" size="small" />
                  : <>
                      <Ionicons name="checkmark-circle-outline" size={18} color="white" />
                      <Text style={{ color: 'white', fontWeight: '800', fontSize: 15 }}>Guardar cambios</Text>
                    </>
                }
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ══ Modal cambiar contraseña ════════════════════════════════ */}
      <Modal visible={pwdModal} transparent animationType="slide" onRequestClose={() => !savingPwd && setPwdModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} activeOpacity={1} onPress={() => !savingPwd && setPwdModal(false)} />
          <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 28 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#e5e7eb', alignSelf: 'center', marginBottom: 20 }} />
            <Text style={{ color: '#111827', fontSize: 18, fontWeight: '800', marginBottom: 4 }}>Cambiar contraseña</Text>
            <Text style={{ color: '#9ca3af', fontSize: 13, marginBottom: 20 }}>Ingresa tu contraseña actual y elige una nueva</Text>

            <PasswordInput label="Contraseña actual"           value={pwdActual}    onChangeText={setPwdActual}    show={showActual}    onToggle={() => setShowActual(v => !v)} />
            <View style={{ height: 12 }} />
            <PasswordInput label="Nueva contraseña"            value={pwdNueva}     onChangeText={setPwdNueva}     show={showNueva}     onToggle={() => setShowNueva(v => !v)} />
            <View style={{ height: 12 }} />
            <PasswordInput label="Confirmar nueva contraseña"  value={pwdConfirmar} onChangeText={setPwdConfirmar} show={showConfirmar} onToggle={() => setShowConfirmar(v => !v)} />

            {!!pwdError && <ErrorBanner message={pwdError} />}

            <TouchableOpacity
              onPress={handleChangePassword}
              disabled={savingPwd}
              activeOpacity={0.85}
              style={{ marginTop: 20, borderRadius: 14, overflow: 'hidden' }}
            >
              <LinearGradient colors={['#7c3aed', '#9333ea']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}>
                {savingPwd
                  ? <ActivityIndicator color="white" size="small" />
                  : <>
                      <Ionicons name="lock-closed-outline" size={18} color="white" />
                      <Text style={{ color: 'white', fontWeight: '800', fontSize: 15 }}>Actualizar contraseña</Text>
                    </>
                }
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return (
    <Text style={{ color: '#6b7280', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, paddingLeft: 4 }}>
      {children}
    </Text>
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
    </View>
  );
}

function LabeledInput({ label, value, onChangeText, placeholder, icon, keyboardType }: {
  label: string; value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  icon: keyof typeof Ionicons.glyphMap;
  keyboardType?: 'default' | 'phone-pad' | 'email-address';
}) {
  return (
    <View>
      <Text style={{ color: '#374151', fontSize: 13, fontWeight: '600', marginBottom: 8 }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, backgroundColor: '#f9fafb', paddingHorizontal: 14, gap: 10 }}>
        <Ionicons name={icon} size={18} color="#9ca3af" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#d1d5db"
          keyboardType={keyboardType ?? 'default'}
          style={{ flex: 1, paddingVertical: 13, fontSize: 14, color: '#111827' }}
        />
      </View>
    </View>
  );
}

function PasswordInput({ label, value, onChangeText, show, onToggle }: {
  label: string; value: string;
  onChangeText: (v: string) => void;
  show: boolean; onToggle: () => void;
}) {
  return (
    <View>
      <Text style={{ color: '#374151', fontSize: 13, fontWeight: '600', marginBottom: 8 }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, backgroundColor: '#f9fafb', paddingHorizontal: 14, gap: 10 }}>
        <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="••••••••"
          placeholderTextColor="#d1d5db"
          secureTextEntry={!show}
          style={{ flex: 1, paddingVertical: 13, fontSize: 14, color: '#111827' }}
        />
        <TouchableOpacity onPress={onToggle}>
          <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <View style={{ marginTop: 12, padding: 12, borderRadius: 10, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fca5a5', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Ionicons name="alert-circle-outline" size={16} color="#dc2626" />
      <Text style={{ color: '#dc2626', fontSize: 13, flex: 1 }}>{message}</Text>
    </View>
  );
}
