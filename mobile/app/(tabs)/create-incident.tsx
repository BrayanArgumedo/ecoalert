import { View, Text, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AnimatedBackground from '../../src/shared/components/AnimatedBackground';

export default function CreateIncidentScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#030d06' }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#030d06', '#071a0d', '#0a2714']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <AnimatedBackground />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        <View style={{ width: 72, height: 72, borderRadius: 22, backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Ionicons name="add-circle-outline" size={34} color="#ef4444" />
        </View>
        <Text style={{ color: 'white', fontSize: 20, fontWeight: '800', textAlign: 'center' }}>Reportar emergencia</Text>
        <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
          Disponible en la siguiente fase.
        </Text>
      </View>
    </View>
  );
}
