// src/shared/components/SectionCard.tsx
// Tarjeta contenedora con encabezado (ícono + título + subtítulo opcional).
// Usada en el formulario de crear incidencia para agrupar campos relacionados.

import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type IoniconsName = keyof typeof Ionicons.glyphMap;

interface SectionCardProps {
  title: string;
  icon: IoniconsName;
  subtitle?: string;
  required?: boolean;
  children: React.ReactNode;
}

export default function SectionCard({ title, icon, subtitle, required, children }: SectionCardProps) {
  return (
    <View style={{
      backgroundColor: '#ffffff', borderRadius: 16, padding: 16,
      borderWidth: 1, borderColor: '#f0f0f0',
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <View style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon} size={16} color="#16a34a" />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ color: '#111827', fontWeight: '700', fontSize: 14 }}>{title}</Text>
            {required && <Text style={{ color: '#dc2626', fontSize: 13, fontWeight: '700' }}>*</Text>}
          </View>
          {subtitle && <Text style={{ color: '#9ca3af', fontSize: 11, marginTop: 1 }}>{subtitle}</Text>}
        </View>
      </View>
      {children}
    </View>
  );
}
