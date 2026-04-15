import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/core/stores/authStore';
import { getRolColor, isAdmin, isResponder, getGreeting } from '../../src/core/utils/roles';

type IoniconsName = keyof typeof Ionicons.glyphMap;

// ── Configuración de stats ───────────────────────────────────────
interface Stat { key: string; label: string; value: number; icon: IoniconsName; color: string }

const STATS_ADMIN: Stat[] = [
  { key: 'total',      label: 'Total',      value: 0, icon: 'layers-outline',           color: '#2563eb' },
  { key: 'activos',    label: 'Activos',    value: 0, icon: 'flame-outline',            color: '#dc2626' },
  { key: 'pendientes', label: 'Pendientes', value: 0, icon: 'time-outline',             color: '#d97706' },
  { key: 'resueltos',  label: 'Resueltos',  value: 0, icon: 'checkmark-circle-outline', color: '#16a34a' },
];
const STATS_CITIZEN: Stat[] = [
  { key: 'total',      label: 'Mis reportes', value: 0, icon: 'document-text-outline',    color: '#2563eb' },
  { key: 'activos',    label: 'Activos',      value: 0, icon: 'flame-outline',            color: '#dc2626' },
  { key: 'pendientes', label: 'Pendientes',   value: 0, icon: 'time-outline',             color: '#d97706' },
  { key: 'resueltos',  label: 'Resueltos',    value: 0, icon: 'checkmark-circle-outline', color: '#16a34a' },
];
const STATS_RESPONDER: Stat[] = [
  { key: 'total',      label: 'Asignados',  value: 0, icon: 'alert-circle-outline',      color: '#2563eb' },
  { key: 'activos',    label: 'En curso',   value: 0, icon: 'flame-outline',             color: '#dc2626' },
  { key: 'pendientes', label: 'Pendientes', value: 0, icon: 'time-outline',              color: '#d97706' },
  { key: 'resueltos',  label: 'Cerrados',   value: 0, icon: 'checkmark-circle-outline',  color: '#16a34a' },
];

// ── Incident placeholder (Phase 3 llenará con datos reales) ──────
interface Incidente {
  id: string; tipo: string; direccion: string;
  prioridad: 'alta' | 'media' | 'baja'; estado: string; fecha: string;
}
const INCIDENTS: Incidente[] = [];

const ESTADO_STYLE: Record<string, { color: string; bg: string }> = {
  'Reportado':   { color: '#d97706', bg: '#fef9c3' },
  'En atención': { color: '#2563eb', bg: '#dbeafe' },
  'Resuelto':    { color: '#16a34a', bg: '#dcfce7' },
  'Cerrado':     { color: '#6b7280', bg: '#f3f4f6' },
};
const PRIORIDAD_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  alta:  { color: '#dc2626', bg: '#fee2e2', border: '#fca5a5' },
  media: { color: '#d97706', bg: '#fef3c7', border: '#fcd34d' },
  baja:  { color: '#16a34a', bg: '#dcfce7', border: '#86efac' },
};

export default function HomeScreen() {
  const router    = useRouter();
  const user      = useAuthStore((s) => s.user);
  const rol       = user?.rol ?? '';
  const rolColor  = getRolColor(rol);
  const admin     = isAdmin(rol);
  const responder = isResponder(rol);
  const stats     = admin ? STATS_ADMIN : responder ? STATS_RESPONDER : STATS_CITIZEN;

  const [selectedStat, setSelectedStat] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#f8faf9' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8faf9" translucent={false} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* ══ Header con gradiente mint ════════════════════════════ */}
        <LinearGradient
          colors={['#dcfce7', '#f0fdf4', '#ffffff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: Platform.OS === 'ios' ? 56 : 48,
            paddingHorizontal: 20,
            paddingBottom: 24,
            overflow: 'hidden',
          }}
        >
          {/* Blob decorativo grande (top-right) */}
          <View style={{
            position: 'absolute', top: -40, right: -40,
            width: 160, height: 160, borderRadius: 80,
            backgroundColor: 'rgba(34,197,94,0.12)',
          }} />
          {/* Blob decorativo pequeño */}
          <View style={{
            position: 'absolute', top: 20, right: 80,
            width: 60, height: 60, borderRadius: 30,
            backgroundColor: 'rgba(134,239,172,0.2)',
          }} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#16a34a', fontSize: 13, fontWeight: '600' }}>
                {getGreeting()} 👋
              </Text>
              <Text style={{ color: '#111827', fontSize: 22, fontWeight: '800', marginTop: 2 }}>
                {user?.nombre}
              </Text>
              <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>
                {today.charAt(0).toUpperCase() + today.slice(1)}
              </Text>
            </View>
            {/* Avatar */}
            <View style={{
              width: 50, height: 50, borderRadius: 25,
              backgroundColor: `${rolColor}20`,
              borderWidth: 2.5, borderColor: `${rolColor}45`,
              alignItems: 'center', justifyContent: 'center',
              shadowColor: rolColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
            }}>
              <Text style={{ color: rolColor, fontSize: 20, fontWeight: '800' }}>
                {user?.nombre?.[0]?.toUpperCase() ?? 'U'}
              </Text>
            </View>
          </View>

          {/* Role badge */}
          <View style={{ flexDirection: 'row', marginTop: 14 }}>
            <View style={{
              paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
              backgroundColor: `${rolColor}15`,
              borderWidth: 1.5, borderColor: `${rolColor}40`,
              flexDirection: 'row', alignItems: 'center', gap: 6,
            }}>
              <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: rolColor }} />
              <Text style={{ color: rolColor, fontSize: 12, fontWeight: '700' }}>{rol}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>

          {/* ══ Panel de control title ════════════════════════════ */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: '#111827', fontSize: 18, fontWeight: '800' }}>Panel de control</Text>
            <Text style={{ color: '#9ca3af', fontSize: 13, marginTop: 2 }}>
              Gestión de emergencias ambientales
            </Text>
          </View>

          {/* ══ Stats cards (estilo SIREAL) ═══════════════════════ */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingRight: 4, marginBottom: 24 }}
          >
            {stats.map((s) => {
              const active = selectedStat === s.key;
              return (
                <TouchableOpacity
                  key={s.key}
                  onPress={() => setSelectedStat(active ? null : s.key)}
                  activeOpacity={0.8}
                >
                  <View style={{
                    width: 120,
                    backgroundColor: '#ffffff',
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: active ? 2 : 1,
                    borderColor: active ? s.color : '#f0f0f0',
                    shadowColor: active ? s.color : '#000',
                    shadowOffset: { width: 0, height: active ? 4 : 2 },
                    shadowOpacity: active ? 0.18 : 0.06,
                    shadowRadius: active ? 10 : 6,
                    elevation: active ? 6 : 2,
                  }}>
                    <View style={{
                      width: 38, height: 38, borderRadius: 10,
                      backgroundColor: `${s.color}15`,
                      alignItems: 'center', justifyContent: 'center',
                      marginBottom: 12,
                    }}>
                      <Ionicons name={s.icon} size={20} color={s.color} />
                    </View>
                    <Text style={{ color: '#111827', fontSize: 26, fontWeight: '800', lineHeight: 30 }}>
                      {s.value}
                    </Text>
                    <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 4, fontWeight: '500' }}>
                      {s.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ══ Botón reportar ════════════════════════════════════ */}
          {!admin && !responder && (
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/create-incident' as any)}
              activeOpacity={0.85}
              style={{ marginBottom: 24 }}
            >
              <LinearGradient
                colors={['#15803d', '#16a34a']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 14, flexDirection: 'row',
                  alignItems: 'center', justifyContent: 'center',
                  paddingVertical: 16, gap: 10,
                  shadowColor: '#16a34a',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
                }}
              >
                <Ionicons name="add-circle-outline" size={22} color="white" />
                <Text style={{ color: 'white', fontWeight: '800', fontSize: 15 }}>
                  Reportar emergencia
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* ══ Incidentes recientes ══════════════════════════════ */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Text style={{ color: '#111827', fontSize: 16, fontWeight: '800' }}>
              {admin ? 'Incidentes recientes' : responder ? 'Asignados recientes' : 'Mis reportes'}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/incidents' as any)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}
            >
              <Text style={{ color: '#16a34a', fontSize: 13, fontWeight: '700' }}>Ver todos</Text>
              <Ionicons name="arrow-forward" size={13} color="#16a34a" />
            </TouchableOpacity>
          </View>

          {INCIDENTS.length === 0
            ? <EmptyIncidents admin={admin} responder={responder} />
            : INCIDENTS.map((item) => <IncidentCard key={item.id} item={item} rol={rol} />)
          }

        </View>
      </ScrollView>
    </View>
  );
}

// ── Empty state ──────────────────────────────────────────────────
function EmptyIncidents({ admin, responder }: { admin: boolean; responder: boolean }) {
  const msg = admin
    ? 'No hay incidentes registrados aún.'
    : responder
    ? 'No tienes incidentes asignados actualmente.'
    : 'Aún no has reportado ninguna emergencia.';

  return (
    <View style={{
      backgroundColor: '#ffffff', borderRadius: 16, padding: 32,
      alignItems: 'center', borderWidth: 1, borderColor: '#f0f0f0',
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    }}>
      <View style={{
        width: 60, height: 60, borderRadius: 18,
        backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
      }}>
        <Ionicons name="leaf-outline" size={26} color="#16a34a" />
      </View>
      <Text style={{ color: '#111827', fontSize: 15, fontWeight: '700', marginBottom: 6 }}>Todo tranquilo</Text>
      <Text style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', lineHeight: 20 }}>{msg}</Text>
    </View>
  );
}

// ── Incident card ────────────────────────────────────────────────
function IncidentCard({ item, rol }: { item: Incidente; rol: string }) {
  const estado    = ESTADO_STYLE[item.estado]        ?? { color: '#6b7280', bg: '#f3f4f6' };
  const prioridad = PRIORIDAD_STYLE[item.prioridad]  ?? { color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb' };
  const admin     = isAdmin(rol);
  const responder = isResponder(rol);

  return (
    <View style={{
      backgroundColor: '#ffffff', borderRadius: 16, marginBottom: 12,
      borderWidth: 1, borderColor: '#f0f0f0', overflow: 'hidden',
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    }}>
      {/* Accent borde izquierdo por prioridad */}
      <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: prioridad.color }} />

      <View style={{ padding: 16, paddingLeft: 20 }}>
        {/* Fila superior */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={{ color: '#111827', fontWeight: '700', fontSize: 14 }}>{item.tipo}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
              <Ionicons name="location-outline" size={12} color="#9ca3af" />
              <Text style={{ color: '#9ca3af', fontSize: 12 }} numberOfLines={1}>{item.direccion}</Text>
            </View>
          </View>
          <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: estado.bg }}>
            <Text style={{ color: estado.color, fontSize: 11, fontWeight: '700' }}>{item.estado}</Text>
          </View>
        </View>

        {/* Fila inferior: prioridad + fecha */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: prioridad.bg, borderWidth: 1, borderColor: prioridad.border }}>
            <Text style={{ color: prioridad.color, fontSize: 11, fontWeight: '700', textTransform: 'capitalize' }}>
              Prioridad {item.prioridad}
            </Text>
          </View>
          <Text style={{ color: '#9ca3af', fontSize: 11 }}>{item.fecha}</Text>
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: '#f3f4f6', marginBottom: 12 }} />

        {/* Botones acción */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <ActionBtn icon="eye-outline"           label="Ver"    color="#2563eb" bg="#dbeafe" />
          {(admin || responder) && (
            <ActionBtn icon="swap-horizontal-outline" label="Estado" color="#d97706" bg="#fef3c7" />
          )}
          {admin && (
            <ActionBtn icon="close-circle-outline"   label="Cerrar" color="#dc2626" bg="#fee2e2" />
          )}
        </View>
      </View>
    </View>
  );
}

function ActionBtn({ icon, label, color, bg }: { icon: IoniconsName; label: string; color: string; bg: string }) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: bg }}
    >
      <Ionicons name={icon} size={14} color={color} />
      <Text style={{ color, fontSize: 12, fontWeight: '700' }}>{label}</Text>
    </TouchableOpacity>
  );
}
