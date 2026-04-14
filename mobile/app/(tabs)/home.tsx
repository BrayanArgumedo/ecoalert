import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../src/core/stores/authStore';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <LinearGradient colors={['#0f4a28', '#1a6b3a']} className="px-6 pt-14 pb-8">
        <Text className="text-white/70 text-sm">Bienvenido de vuelta</Text>
        <Text className="text-white text-2xl font-bold mt-1">{user?.nombre ?? 'Usuario'}</Text>
        <View className="mt-2 self-start bg-white/20 rounded-full px-3 py-1">
          <Text className="text-white text-xs font-medium">{user?.rol}</Text>
        </View>
      </LinearGradient>

      {/* Contenido */}
      <View className="flex-1 px-6 py-8 items-center justify-center">
        <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center mb-4">
          <Text className="text-5xl">🌿</Text>
        </View>
        <Text className="text-gray-700 text-xl font-bold text-center">EcoAlert</Text>
        <Text className="text-gray-400 text-sm text-center mt-2">
          Sesión activa correctamente
        </Text>
        <Text className="text-gray-300 text-xs text-center mt-1">{user?.correo}</Text>
      </View>

      {/* Logout temporal */}
      <View className="px-6 pb-10">
        <TouchableOpacity
          onPress={handleLogout}
          className="border border-red-200 rounded-xl py-3 items-center"
        >
          <Text className="text-red-400 text-sm font-medium">Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
