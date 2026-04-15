import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuthStore } from '../../src/core/stores/authStore';
import AnimatedBackground from '../../src/shared/components/AnimatedBackground';
import InputField from '../../src/shared/components/InputField';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contrasenaError, setContrasenaError] = useState('');

  const handleLogin = async () => {
    setError('');
    setContrasenaError('');

    if (!correo.trim() || !contrasena.trim()) {
      setError('Ingresa tu correo y contraseña para continuar.');
      return;
    }

    if (contrasena.length < 8) {
      setContrasenaError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await login(correo.trim(), contrasena);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401) {
        setError(err?.response?.data?.message ?? 'Correo o contraseña incorrectos.');
      } else if (status >= 500) {
        setError('Error en el servidor. Intenta de nuevo más tarde.');
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
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
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
            style={{
              borderRadius: 28,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.12)',
            }}
          >
            <View style={{ padding: 28, backgroundColor: 'rgba(10,30,16,0.55)' }}>

              <Text style={{ color: 'white', fontSize: 26, fontWeight: '700', marginBottom: 4 }}>
                Bienvenido
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 28 }}>
                Inicia sesión para continuar
              </Text>

              <InputField
                icon="mail-outline"
                label="Correo electrónico"
                placeholder="correo@ejemplo.com"
                value={correo}
                onChangeText={(v) => { setCorreo(v); setError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <InputField
                icon="lock-closed-outline"
                label="Contraseña"
                placeholder="••••••••"
                value={contrasena}
                onChangeText={(v) => { setContrasena(v); setContrasenaError(''); setError(''); }}
                secureTextEntry
                error={contrasenaError}
              />

              {/* Mensaje de error inline */}
              {error !== '' && (
                <View style={{
                  backgroundColor: 'rgba(220,38,38,0.15)',
                  borderWidth: 1,
                  borderColor: 'rgba(220,38,38,0.4)',
                  borderRadius: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  marginBottom: 12,
                }}>
                  <Text style={{ color: '#f87171', fontSize: 13, textAlign: 'center' }}>
                    {error}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
                style={{ marginTop: 4 }}
              >
                <LinearGradient
                  colors={['#1a6b3a', '#2d9e57']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    height: 52,
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={{ color: 'white', fontWeight: '700', fontSize: 16, letterSpacing: 0.5 }}>
                      Iniciar sesión
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/(auth)/register')}
                style={{ marginTop: 20, alignItems: 'center' }}
              >
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                  ¿No tienes cuenta?{' '}
                  <Text style={{ color: '#2d9e57', fontWeight: '600' }}>Regístrate</Text>
                </Text>
              </TouchableOpacity>

            </View>
          </BlurView>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
