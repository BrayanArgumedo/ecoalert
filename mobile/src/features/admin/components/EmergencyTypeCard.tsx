import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { TipoEmergencia } from '../../../core/services/emergencyTypesService';

type IoniconsName = keyof typeof Ionicons.glyphMap;

// Alias cortos que vienen de la BD en los tipos sembrados originalmente
const TYPE_ICON_MAP: Record<string, { icon: IoniconsName; color: string }> = {
  earthquake: { icon: 'pulse-outline',        color: '#d97706' },
  flood:      { icon: 'water-outline',         color: '#2563eb' },
  landslide:  { icon: 'trending-down-outline', color: '#92400e' },
  slide:      { icon: 'trending-down-outline', color: '#92400e' },
  hurricane:  { icon: 'thunderstorm-outline',  color: '#7c3aed' },
  fire:       { icon: 'flame-outline',         color: '#dc2626' },
  storm:      { icon: 'thunderstorm-outline',  color: '#4f46e5' },
  pollution:  { icon: 'cloud-outline',         color: '#15803d' },
};

// Íconos disponibles en el selector del formulario (nombres directos de Ionicons)
export const EMERGENCY_ICONS: Array<{ key: IoniconsName; label: string; color: string }> = [
  { key: 'flame-outline',         label: 'Incendio',  color: '#dc2626' },
  { key: 'water-outline',         label: 'Inundación',color: '#2563eb' },
  { key: 'pulse-outline',         label: 'Sismo',     color: '#d97706' },
  { key: 'thunderstorm-outline',  label: 'Tormenta',  color: '#7c3aed' },
  { key: 'rainy-outline',         label: 'Lluvia',    color: '#0284c7' },
  { key: 'flash-outline',         label: 'Rayo',      color: '#f59e0b' },
  { key: 'trending-down-outline', label: 'Desliz.',   color: '#92400e' },
  { key: 'snow-outline',          label: 'Granizo',   color: '#0ea5e9' },
  { key: 'sunny-outline',         label: 'Sequía',    color: '#eab308' },
  { key: 'partly-sunny-outline',  label: 'Calor',     color: '#f97316' },
  { key: 'thermometer-outline',   label: 'Temperat.', color: '#ef4444' },
  { key: 'cloud-outline',         label: 'Contamin.', color: '#6b7280' },
  { key: 'leaf-outline',          label: 'Deforest.', color: '#16a34a' },
  { key: 'nuclear-outline',       label: 'Químico',   color: '#8b5cf6' },
  { key: 'bug-outline',           label: 'Vector',    color: '#84cc16' },
  { key: 'medkit-outline',        label: 'Sanitaria', color: '#ec4899' },
  { key: 'alert-circle-outline',  label: 'Alerta',    color: '#ef4444' },
  { key: 'warning-outline',       label: 'Aviso',     color: '#f97316' },
  { key: 'business-outline',      label: 'Derrumbe',  color: '#64748b' },
  { key: 'home-outline',          label: 'Vivienda',  color: '#7c3aed' },
  { key: 'layers-outline',        label: 'Erosión',   color: '#a16207' },
  { key: 'construct-outline',     label: 'Infraest.', color: '#78716c' },
  { key: 'boat-outline',          label: 'Marejada',  color: '#3b82f6' },
  { key: 'trail-sign-outline',    label: 'Evacuac.',  color: '#0891b2' },
  { key: 'earth-outline',         label: 'Ambiental', color: '#059669' },
  { key: 'radio-outline',         label: 'Alerta SC', color: '#f43f5e' },
  { key: 'skull-outline',         label: 'Tóxico',    color: '#1f2937' },
];

const ICON_COLOR_MAP = Object.fromEntries(EMERGENCY_ICONS.map((ic) => [ic.key, ic.color]));

const FALLBACK_COLORS = [
  '#dc2626', '#d97706', '#2563eb', '#7c3aed', '#15803d',
  '#db2777', '#0891b2', '#9333ea', '#16a34a', '#ea580c',
];

export function getTypeStyle(tipo: TipoEmergencia, index: number): { icon: IoniconsName; color: string } {
  if (tipo.icono) {
    // Alias cortos de la BD (tipos sembrados originalmente)
    if (TYPE_ICON_MAP[tipo.icono]) return TYPE_ICON_MAP[tipo.icono];
    // Nombre Ionicons directo (guardado por el nuevo selector)
    return {
      icon: tipo.icono as IoniconsName,
      color: ICON_COLOR_MAP[tipo.icono] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length],
    };
  }
  return { icon: 'warning-outline', color: FALLBACK_COLORS[index % FALLBACK_COLORS.length] };
}

interface EmergencyTypeCardProps {
  item: TipoEmergencia;
  index: number;
  onEdit: (tipo: TipoEmergencia) => void;
  onDelete: (tipo: TipoEmergencia) => void;
}

export default function EmergencyTypeCard({ item, index, onEdit, onDelete }: EmergencyTypeCardProps) {
  const { icon, color } = getTypeStyle(item, index);

  return (
    <View style={{
      backgroundColor: '#ffffff', borderRadius: 16,
      borderWidth: 1, borderColor: '#f0f0f0', overflow: 'hidden',
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    }}>
      <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: color }} />

      <View style={{ padding: 14, paddingLeft: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: `${color}15`, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon} size={22} color={color} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: '#111827', fontSize: 15, fontWeight: '700' }}>{item.nombre}</Text>
          {item.descripcion
            ? <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 2, lineHeight: 16 }} numberOfLines={2}>{item.descripcion}</Text>
            : <Text style={{ color: '#d1d5db', fontSize: 12, marginTop: 2, fontStyle: 'italic' }}>Sin descripción</Text>
          }
        </View>

        <View style={{ flexDirection: 'row', gap: 6 }}>
          <TouchableOpacity
            onPress={() => onEdit(item)}
            style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="pencil-outline" size={16} color="#2563eb" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onDelete(item)}
            style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="trash-outline" size={16} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
