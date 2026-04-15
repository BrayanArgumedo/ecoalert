import { View, Text, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AnimatedBackground from '../../src/shared/components/AnimatedBackground';

export default function EmergencyTypesScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#030d06' }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#030d06', '#071a0d', '#0a2714']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <AnimatedBackground />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        <View style={{ width: 72, height: 72, borderRadius: 22, backgroundColor: 'rgba(139,92,246,0.15)', borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Ionicons name="list-outline" size={34} color="#8b5cf6" />
        </View>
        <Text style={{ color: 'white', fontSize: 20, fontWeight: '800', textAlign: 'center' }}>Tipos de emergencia</Text>
        <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
          Disponible en la siguiente fase.
        </Text>
      </View>
    </View>
  );
}
