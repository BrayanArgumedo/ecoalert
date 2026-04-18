import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

interface EmptyIncidentsProps {
  filtro: string;
  canCreate: boolean;
}

export default function EmptyIncidents({ filtro, canCreate }: EmptyIncidentsProps) {
  const router = useRouter();

  const msg = filtro === 'todos'
    ? 'No hay incidentes registrados aún.'
    : `No hay incidentes con ese estado.`;

  return (
    <View style={{
      backgroundColor: '#ffffff', borderRadius: 16, padding: 32,
      alignItems: 'center', borderWidth: 1, borderColor: '#f0f0f0',
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    }}>
      <View style={{ width: 60, height: 60, borderRadius: 18, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
        <Ionicons name="leaf-outline" size={26} color="#16a34a" />
      </View>
      <Text style={{ color: '#111827', fontSize: 15, fontWeight: '700', marginBottom: 6 }}>Sin incidentes</Text>
      <Text style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: canCreate && filtro === 'todos' ? 20 : 0 }}>
        {msg}
      </Text>
      {canCreate && filtro === 'todos' && (
        <TouchableOpacity onPress={() => router.push('/(tabs)/create-incident' as any)} activeOpacity={0.85}>
          <LinearGradient
            colors={['#15803d', '#16a34a']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}
          >
            <Ionicons name="add-circle-outline" size={16} color="white" />
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>Reportar emergencia</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}
