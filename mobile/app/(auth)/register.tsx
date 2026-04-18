import { useState } from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView, StatusBar,
  Modal, TextInput, FlatList, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/core/stores/authStore';
import AnimatedBackground from '../../src/shared/components/AnimatedBackground';
import InputField from '../../src/shared/components/InputField';
import { LOCALIDADES_CERETE } from '../../src/core/utils/localidades';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const TYPO_TLD   = /\.(con|cmo|ocm|ogr|nte|ccom|comn|om|cpm|cim)$/i;

const LABEL = { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 6, marginLeft: 2 } as const;
const ROW_INPUT = {
  flexDirection: 'row' as const, alignItems: 'center' as const,
  backgroundColor: 'rgba(255,255,255,0.08)',
  borderRadius: 14, borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.15)',
  paddingHorizontal: 12, height: 52,
};

export default function RegisterScreen() {
  const router       = useRouter();
  const { register } = useAuthStore();

  const [nombre,     setNombre]     = useState('');
  const [correo,     setCorreo]     = useState('');
  const [contrasena, setContrasena] = useState('');
  const [telefono,   setTelefono]   = useState('');
  const [localidad,  setLocalidad]  = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [contrasenaError, setContrasenaError] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [busqueda,     setBusqueda]     = useState('');

  const barriosFiltrados = LOCALIDADES_CERETE.filter((b) =>
    b.toLowerCase().includes(busqueda.toLowerCase())
  );

  const seleccionarBarrio = (barrio: string) => {
    setLocalidad(barrio);
    setBusqueda('');
    setModalVisible(false);
    setError('');
  };

  const handleRegister = async () => {
    setError('');
    setContrasenaError('');

    if (!nombre.trim()) { setError('El nombre es obligatorio.'); return; }

    const correoTrim = correo.trim().toLowerCase();
    if (!correoTrim) { setError('El correo es obligatorio.'); return; }
    if (!EMAIL_REGEX.test(correoTrim) || TYPO_TLD.test(correoTrim)) {
      setError('Ingresa un correo válido (ej: usuario@gmail.com).');
      return;
    }

    if (!contrasena) { setContrasenaError('La contraseña es obligatoria.'); return; }
    if (contrasena.length < 8) {
      setContrasenaError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (!telefono.trim()) { setError('El teléfono es obligatorio.'); return; }
    if (!localidad)       { setError('Selecciona tu barrio.'); return; }

    setLoading(true);
    try {
      await register(nombre.trim(), correoTrim, contrasena.trim(), localidad, telefono.trim());
      router.replace('/(tabs)/home');
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 400) {
        setError(err?.response?.data?.message ?? 'Datos inválidos.');
      } else if (status >= 500) {
        setError('Error en el servidor. Intenta de nuevo.');
      } else {
        setError('No se pudo conectar. Verifica tu conexión.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <LinearGradient
        colors={['#030d06', '#071a0d', '#0a2714', '#0f3d1e']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <AnimatedBackground />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Image
              source={require('../../assets/images/logoEcoaler.png')}
              style={{ width: 120, height: 60, resizeMode: 'contain' }}
            />
            <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 8, letterSpacing: 2, textTransform: 'uppercase' }}>
              Emergencias ambientales
            </Text>
          </View>

          {/* Card */}
          <BlurView
            intensity={25}
            tint="dark"
            style={{ borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }}
          >
            <View style={{ padding: 28, backgroundColor: 'rgba(10,30,16,0.55)' }}>

              <Text style={{ color: 'white', fontSize: 26, fontWeight: '700', marginBottom: 4 }}>
                Crea tu cuenta
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 24 }}>
                Únete a la red de respuesta ambiental
              </Text>

              {/* Nombre */}
              <InputField
                icon="person-outline"
                label="Nombre completo"
                placeholder="Tu nombre"
                value={nombre}
                onChangeText={(v) => { setNombre(v); setError(''); }}
                autoCapitalize="words"
              />

              {/* Correo */}
              <InputField
                icon="mail-outline"
                label="Correo electrónico"
                placeholder="correo@ejemplo.com"
                value={correo}
                onChangeText={(v) => { setCorreo(v); setError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {/* Contraseña */}
              <InputField
                icon="lock-closed-outline"
                label="Contraseña"
                placeholder="Mínimo 8 caracteres"
                value={contrasena}
                onChangeText={(v) => { setContrasena(v); setContrasenaError(''); setError(''); }}
                secureTextEntry
                error={contrasenaError}
              />

              {/* ── Fila: Teléfono + Barrio ── */}
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>

                {/* Teléfono — flex menor porque el número siempre es fijo */}
                <View style={{ flex: 0.95 }}>
                  <Text style={LABEL}>Teléfono</Text>
                  <View style={[ROW_INPUT, { paddingHorizontal: 10 }]}>
                    <Ionicons name="call-outline" size={15} color="rgba(255,255,255,0.5)" style={{ marginRight: 6 }} />
                    <TextInput
                      value={telefono}
                      onChangeText={(v) => { setTelefono(v); setError(''); }}
                      placeholder="300..."
                      placeholderTextColor="rgba(255,255,255,0.35)"
                      keyboardType="phone-pad"
                      style={{ flex: 1, color: 'white', fontSize: 13 }}
                    />
                  </View>
                </View>

                {/* Barrio — flex mayor para que se vea el nombre completo */}
                <View style={{ flex: 1.05 }}>
                  <Text style={LABEL}>Barrio / Localidad</Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    activeOpacity={0.8}
                    style={[ROW_INPUT, { paddingHorizontal: 10, borderColor: localidad ? 'rgba(45,158,87,0.6)' : 'rgba(255,255,255,0.15)' }]}
                  >
                    <Ionicons
                      name="location-outline"
                      size={15}
                      color={localidad ? '#2d9e57' : 'rgba(255,255,255,0.5)'}
                      style={{ marginRight: 5 }}
                    />
                    <Text
                      style={{ flex: 1, fontSize: 12, color: localidad ? 'white' : 'rgba(255,255,255,0.35)' }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {localidad || 'Seleccionar'}
                    </Text>
                    <Ionicons name="chevron-down" size={11} color="rgba(255,255,255,0.4)" />
                  </TouchableOpacity>
                </View>

              </View>

              {/* Error */}
              {error !== '' && (
                <View style={{
                  backgroundColor: 'rgba(220,38,38,0.15)', borderWidth: 1,
                  borderColor: 'rgba(220,38,38,0.4)', borderRadius: 10,
                  paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12,
                }}>
                  <Text style={{ color: '#f87171', fontSize: 13, textAlign: 'center' }}>{error}</Text>
                </View>
              )}

              <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.85} style={{ marginTop: 4 }}>
                <LinearGradient
                  colors={['#1a6b3a', '#2d9e57']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}
                >
                  {loading
                    ? <ActivityIndicator color="white" />
                    : <Text style={{ color: 'white', fontWeight: '700', fontSize: 16, letterSpacing: 0.5 }}>Crear cuenta</Text>
                  }
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20, alignItems: 'center' }}>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                  ¿Ya tienes cuenta?{' '}
                  <Text style={{ color: '#2d9e57', fontWeight: '600' }}>Inicia sesión</Text>
                </Text>
              </TouchableOpacity>

            </View>
          </BlurView>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ══ Modal selector de barrios ══════════════════════════════════ */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setModalVisible(false)} />
          <View style={{
            backgroundColor: '#0d2414',
            borderTopLeftRadius: 28, borderTopRightRadius: 28,
            borderWidth: 1, borderBottomWidth: 0,
            borderColor: 'rgba(255,255,255,0.1)',
            maxHeight: '75%',
          }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginTop: 14, marginBottom: 18 }} />
            <Text style={{ color: 'white', fontSize: 17, fontWeight: '800', paddingHorizontal: 24, marginBottom: 14 }}>
              Selecciona tu barrio
            </Text>
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderRadius: 14, borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.12)',
              marginHorizontal: 20, marginBottom: 10,
              paddingHorizontal: 14, height: 46, gap: 8,
            }}>
              <Ionicons name="search-outline" size={16} color="rgba(255,255,255,0.4)" />
              <TextInput
                value={busqueda}
                onChangeText={setBusqueda}
                placeholder="Buscar barrio..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={{ flex: 1, color: 'white', fontSize: 14 }}
                autoFocus
              />
              {busqueda.length > 0 && (
                <TouchableOpacity onPress={() => setBusqueda('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close-circle" size={16} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={barriosFiltrados}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <Text style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 28, fontSize: 14 }}>
                  Sin resultados para "{busqueda}"
                </Text>
              }
              renderItem={({ item }) => {
                const sel = item === localidad;
                return (
                  <TouchableOpacity
                    onPress={() => seleccionarBarrio(item)}
                    style={{
                      flexDirection: 'row', alignItems: 'center',
                      paddingVertical: 13, paddingHorizontal: 14,
                      borderRadius: 12, marginBottom: 3,
                      backgroundColor: sel ? 'rgba(45,158,87,0.18)' : 'transparent',
                      borderWidth: sel ? 1 : 0, borderColor: 'rgba(45,158,87,0.4)',
                    }}
                  >
                    <Ionicons
                      name={sel ? 'location' : 'location-outline'}
                      size={15}
                      color={sel ? '#2d9e57' : 'rgba(255,255,255,0.45)'}
                      style={{ marginRight: 12 }}
                    />
                    <Text style={{ flex: 1, fontSize: 14, color: sel ? '#2d9e57' : 'rgba(255,255,255,0.85)', fontWeight: sel ? '700' : '400' }}>
                      {item}
                    </Text>
                    {sel && <Ionicons name="checkmark-circle" size={17} color="#2d9e57" />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
