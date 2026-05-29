// app/(tabs)/home.tsx
// Pantalla principal (Dashboard). Muestra las tarjetas de resumen de
// incidencias, filtros de estado y prioridad, búsqueda libre y paginación.
// Toda la lógica de carga y filtrado vive en useHome.

import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StatusBar, Platform, ActivityIndicator, Modal, TextInput, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/core/stores/authStore';
import { ROLES, getRolColor, getRolDisplay, isAdmin, isResponder, canCreateIncident, getGreeting } from '../../src/core/utils/roles';
import { avatarUrl } from '../../src/core/utils/avatar';
import { useHome, type FiltroPrioridad } from '../../src/features/incidents/hooks/useHome';
import IncidentCard from '../../src/features/incidents/components/IncidentCard';

type IoniconsName = keyof typeof Ionicons.glyphMap;

// ── Stat cards ────────────────────────────────────────────────────────────────
type StatKey = 'total' | 'activos' | 'pendientes' | 'resueltos';

interface StatConfig {
  key:   StatKey;
  label: string;
  icon:  IoniconsName;
  color: string;
}

// Mapeo stat key → filtroEstado
const STAT_TO_ESTADO: Record<StatKey, string> = {
  total:      'todos',
  activos:    'en_proceso',
  pendientes: 'pendiente',
  resueltos:  'resuelta',
};

const STATS_ADMIN: StatConfig[] = [
  { key: 'total',      label: 'Total',      icon: 'layers-outline',           color: '#2563eb' },
  { key: 'activos',    label: 'Activos',    icon: 'flame-outline',            color: '#dc2626' },
  { key: 'pendientes', label: 'Pendientes', icon: 'time-outline',             color: '#d97706' },
  { key: 'resueltos',  label: 'Resueltos',  icon: 'checkmark-circle-outline', color: '#16a34a' },
];
const STATS_CITIZEN: StatConfig[] = [
  { key: 'total',      label: 'Mis reportes', icon: 'document-text-outline',    color: '#2563eb' },
  { key: 'activos',    label: 'Activos',      icon: 'flame-outline',            color: '#dc2626' },
  { key: 'pendientes', label: 'Pendientes',   icon: 'time-outline',             color: '#d97706' },
  { key: 'resueltos',  label: 'Resueltos',    icon: 'checkmark-circle-outline', color: '#16a34a' },
];
const STATS_RESPONDER: StatConfig[] = [
  { key: 'total',      label: 'Asignados',  icon: 'alert-circle-outline',      color: '#2563eb' },
  { key: 'activos',    label: 'En curso',   icon: 'flame-outline',             color: '#dc2626' },
  { key: 'pendientes', label: 'Pendientes', icon: 'time-outline',              color: '#d97706' },
  { key: 'resueltos',  label: 'Cerrados',   icon: 'checkmark-circle-outline',  color: '#16a34a' },
];

// ── Prioridad opciones (solo admin) ───────────────────────────────────────────
const PRIORIDAD_OPTS: { key: FiltroPrioridad; label: string; color: string; bg: string }[] = [
  { key: 'todas',   label: 'Todas',   color: '#6b7280', bg: '#f3f4f6' },
  { key: 'normal',  label: 'Normal',  color: '#16a34a', bg: '#f0fdf4' },
  { key: 'alta',    label: 'Alta',    color: '#d97706', bg: '#fffbeb' },
  { key: 'critica', label: 'Crítica', color: '#dc2626', bg: '#fef2f2' },
];

// ── Paginación estilo SIREAL ──────────────────────────────────────────────────
function Paginacion({ pagina, totalPaginas, irAPagina }: {
  pagina: number; totalPaginas: number; irAPagina: (p: number) => void;
}) {
  if (totalPaginas <= 1) return null;

  const pages: (number | '...')[] = [];
  if (totalPaginas <= 5) {
    for (let i = 1; i <= totalPaginas; i++) pages.push(i);
  } else {
    pages.push(1);
    if (pagina > 3) pages.push('...');
    for (let i = Math.max(2, pagina - 1); i <= Math.min(totalPaginas - 1, pagina + 1); i++) pages.push(i);
    if (pagina < totalPaginas - 2) pages.push('...');
    pages.push(totalPaginas);
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 6, marginTop: 20, marginBottom: 8, paddingHorizontal: 4 }}>
      <TouchableOpacity
        onPress={() => irAPagina(pagina - 1)}
        disabled={pagina === 1}
        style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, backgroundColor: pagina === 1 ? '#f9fafb' : '#f0fdf4', borderWidth: 1, borderColor: pagina === 1 ? '#e5e7eb' : '#86efac' }}
      >
        <Text style={{ color: pagina === 1 ? '#d1d5db' : '#15803d', fontSize: 12, fontWeight: '700' }}>← Anterior</Text>
      </TouchableOpacity>

      {pages.map((p, idx) =>
        p === '...'
          ? <Text key={`e${idx}`} style={{ color: '#9ca3af', fontSize: 13, paddingHorizontal: 2 }}>...</Text>
          : (
            <TouchableOpacity
              key={p}
              onPress={() => irAPagina(p as number)}
              style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: p === pagina ? '#15803d' : '#ffffff', borderWidth: 1, borderColor: p === pagina ? '#15803d' : '#e5e7eb', alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: p === pagina ? 'white' : '#374151', fontSize: 13, fontWeight: '700' }}>{p}</Text>
            </TouchableOpacity>
          )
      )}

      <TouchableOpacity
        onPress={() => irAPagina(pagina + 1)}
        disabled={pagina === totalPaginas}
        style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, backgroundColor: pagina === totalPaginas ? '#f9fafb' : '#f0fdf4', borderWidth: 1, borderColor: pagina === totalPaginas ? '#e5e7eb' : '#86efac' }}
      >
        <Text style={{ color: pagina === totalPaginas ? '#d1d5db' : '#15803d', fontSize: 12, fontWeight: '700' }}>Siguiente →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Pantalla ──────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router    = useRouter();
  const user      = useAuthStore((s) => s.user);
  const rol       = user?.rol ?? '';
  const rolColor  = getRolColor(rol);
  const admin     = isAdmin(rol);
  const responder = isResponder(rol);
  const canCreate = canCreateIncident(rol);

  const statConfig = admin ? STATS_ADMIN : responder ? STATS_RESPONDER : STATS_CITIZEN;

  // Stat card seleccionada (controla filtroEstado en el hook)
  const [selectedStat, setSelectedStat] = useState<StatKey | null>(null);
  const [avatarLoaded, setAvatarLoaded] = useState(false);

  // Modal de prioridad (solo admin)
  const [prioModal, setPrioModal] = useState(false);

  const {
    stats, loading, error, recargar,
    setFiltroEstado,
    filtroPrioridad, setFiltroPrioridad,
    busqueda, setBusqueda,
    items, totalFiltradas, pagina, totalPaginas, irAPagina,
  } = useHome();

  const handleStatPress = (key: StatKey) => {
    const isActive = selectedStat === key;
    const newStat  = isActive ? null : key;
    setSelectedStat(newStat);
    setFiltroEstado((isActive ? 'todos' : STAT_TO_ESTADO[key]) as any);
  };

  const prioActiva = PRIORIDAD_OPTS.find((o) => o.key === filtroPrioridad) ?? PRIORIDAD_OPTS[0];

  const today = new Date().toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  const representante = rol === ROLES.REPRESENTANTE;

  const seccionTitulo = admin
    ? 'Todos los incidentes'
    : responder
    ? 'Incidentes asignados'
    : representante
    ? 'Incidentes de mi localidad'
    : 'Mis reportes';

  return (
    <View style={{ flex: 1, backgroundColor: '#f8faf9' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8faf9" translucent={false} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* ══ Header ═══════════════════════════════════════════════════ */}
        <LinearGradient
          colors={['#dcfce7', '#f0fdf4', '#ffffff']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ paddingTop: Platform.OS === 'ios' ? 56 : 48, paddingHorizontal: 20, paddingBottom: 24, overflow: 'hidden' }}
        >
          <View style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(34,197,94,0.12)' }} />
          <View style={{ position: 'absolute', top: 20, right: 80, width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(134,239,172,0.2)' }} />

          {/* Greeting */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#16a34a', fontSize: 13, fontWeight: '600' }}>{getGreeting()} 👋</Text>
              <Text style={{ color: '#111827', fontSize: 22, fontWeight: '800', marginTop: 2 }}>{user?.nombre}</Text>
              <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>{today.charAt(0).toUpperCase() + today.slice(1)}</Text>
            </View>
            <View style={{ width: 50, height: 50, borderRadius: 25, overflow: 'hidden', backgroundColor: `${rolColor}20`, borderWidth: 2.5, borderColor: `${rolColor}45`, alignItems: 'center', justifyContent: 'center', shadowColor: rolColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 }}>
              {!avatarLoaded && (
                <Text style={{ color: rolColor, fontSize: 20, fontWeight: '800', position: 'absolute' }}>
                  {user?.nombre?.[0]?.toUpperCase() ?? 'U'}
                </Text>
              )}
              {user?.avatar_seed && (
                <Image
                  source={{ uri: avatarUrl(user.avatar_seed, 50) }}
                  style={{ width: 50, height: 50, opacity: avatarLoaded ? 1 : 0 }}
                  onLoad={() => setAvatarLoaded(true)}
                />
              )}
            </View>
          </View>

          {/* Rol badge */}
          <View style={{ flexDirection: 'row', marginTop: 14 }}>
            <View style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: `${rolColor}15`, borderWidth: 1.5, borderColor: `${rolColor}40`, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: rolColor }} />
              <Text style={{ color: rolColor, fontSize: 12, fontWeight: '700' }}>{getRolDisplay(rol)}</Text>
            </View>
          </View>

          {/* Panel de control */}
          <View style={{ marginTop: 20, marginBottom: 12 }}>
            <Text style={{ color: '#111827', fontSize: 16, fontWeight: '800' }}>Panel de control</Text>
            <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>Gestión de emergencias ambientales</Text>
          </View>

          {/* Stats cards — interactivos como filtro */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 4 }}>
            {statConfig.map((s) => {
              const active = selectedStat === s.key;
              const valor  = loading ? '—' : String(stats[s.key]);
              return (
                <TouchableOpacity
                  key={s.key}
                  onPress={() => handleStatPress(s.key)}
                  activeOpacity={0.8}
                >
                  <View style={{
                    width: 120, backgroundColor: '#ffffff', borderRadius: 16, padding: 16,
                    borderWidth: active ? 2 : 1,
                    borderColor: active ? s.color : '#f0f0f0',
                    shadowColor: active ? s.color : '#000',
                    shadowOffset: { width: 0, height: active ? 4 : 2 },
                    shadowOpacity: active ? 0.18 : 0.06,
                    shadowRadius: active ? 10 : 6,
                    elevation: active ? 6 : 2,
                  }}>
                    <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: `${s.color}15`, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                      <Ionicons name={s.icon} size={20} color={s.color} />
                    </View>
                    <Text style={{ color: '#111827', fontSize: 26, fontWeight: '800', lineHeight: 30 }}>{valor}</Text>
                    <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 4, fontWeight: '500' }}>{s.label}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </LinearGradient>

        {/* ══ Cuerpo ═══════════════════════════════════════════════════ */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>

          {/* Botón reportar */}
          {canCreate && (
            <TouchableOpacity onPress={() => router.push('/(tabs)/create-incident' as any)} activeOpacity={0.85} style={{ marginBottom: 24 }}>
              <LinearGradient colors={['#15803d', '#16a34a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10, shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 }}
              >
                <Ionicons name="add-circle-outline" size={22} color="white" />
                <Text style={{ color: 'white', fontWeight: '800', fontSize: 15 }}>Reportar emergencia</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* ── Barra de búsqueda ─────────────────────────────────── */}
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: '#ffffff', borderRadius: 14,
            borderWidth: 1, borderColor: '#e5e7eb',
            paddingHorizontal: 14, paddingVertical: 10,
            marginBottom: 16,
            shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
          }}>
            <Ionicons name="search-outline" size={18} color="#9ca3af" />
            <TextInput
              value={busqueda}
              onChangeText={setBusqueda}
              placeholder={admin ? 'Buscar por tipo, usuario o descripción...' : 'Buscar reporte...'}
              placeholderTextColor="#9ca3af"
              style={{ flex: 1, marginLeft: 10, fontSize: 14, color: '#111827' }}
            />
            {busqueda.length > 0 && (
              <TouchableOpacity onPress={() => setBusqueda('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>

          {/* ── Cabecera sección ───────────────────────────────────── */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <View>
              <Text style={{ color: '#111827', fontSize: 16, fontWeight: '800' }}>{seccionTitulo}</Text>
              {!loading && (
                <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>
                  {totalFiltradas} {totalFiltradas === 1 ? 'registro' : 'registros'}
                  {selectedStat && selectedStat !== 'total'
                    ? ` · ${statConfig.find((s) => s.key === selectedStat)?.label}`
                    : ''}
                  {filtroPrioridad !== 'todas' ? ` · ${prioActiva.label}` : ''}
                </Text>
              )}
            </View>

            {/* Botón prioridad (solo admin) */}
            {admin && (
              <TouchableOpacity
                onPress={() => setPrioModal(true)}
                activeOpacity={0.8}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 5,
                  paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
                  backgroundColor: filtroPrioridad !== 'todas' ? prioActiva.bg : '#f3f4f6',
                  borderWidth: 1,
                  borderColor: filtroPrioridad !== 'todas' ? `${prioActiva.color}50` : '#e5e7eb',
                }}
              >
                <Ionicons
                  name="funnel-outline"
                  size={13}
                  color={filtroPrioridad !== 'todas' ? prioActiva.color : '#6b7280'}
                />
                <Text style={{
                  fontSize: 12, fontWeight: '700',
                  color: filtroPrioridad !== 'todas' ? prioActiva.color : '#6b7280',
                }}>
                  {filtroPrioridad !== 'todas' ? prioActiva.label : 'Prioridad'}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={11}
                  color={filtroPrioridad !== 'todas' ? prioActiva.color : '#9ca3af'}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* ── Contenido ─────────────────────────────────────────── */}
          {loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <ActivityIndicator color="#16a34a" size="large" />
              <Text style={{ color: '#9ca3af', fontSize: 13, marginTop: 12 }}>Cargando incidentes...</Text>
            </View>
          ) : error !== '' ? (
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#f0f0f0' }}>
              <Ionicons name="cloud-offline-outline" size={40} color="#e5e7eb" />
              <Text style={{ color: '#6b7280', fontSize: 13, marginTop: 12, textAlign: 'center' }}>{error}</Text>
              <TouchableOpacity onPress={recargar} style={{ marginTop: 14, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#16a34a', borderRadius: 12 }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : items.length === 0 ? (
            <View style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: '#f0f0f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
              <View style={{ width: 60, height: 60, borderRadius: 18, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Ionicons name="leaf-outline" size={26} color="#16a34a" />
              </View>
              <Text style={{ color: '#111827', fontSize: 15, fontWeight: '700', marginBottom: 6 }}>Todo tranquilo</Text>
              <Text style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
                {selectedStat || filtroPrioridad !== 'todas'
                  ? 'No hay incidentes con los filtros seleccionados.'
                  : admin
                  ? 'No hay incidentes registrados aún.'
                  : responder
                  ? 'No tienes incidentes asignados.'
                  : 'Aún no has reportado ninguna emergencia.'}
              </Text>
            </View>
          ) : (
            <>
              {items.map((inc) => (
                <IncidentCard key={inc.id_incidencia} item={inc} rol={rol} onStatusChanged={recargar} />
              ))}
              <Paginacion pagina={pagina} totalPaginas={totalPaginas} irAPagina={irAPagina} />
            </>
          )}
        </View>
      </ScrollView>

      {/* ══ Modal — filtro prioridad ════════════════════════════════════ */}
      <Modal visible={prioModal} transparent animationType="fade" onRequestClose={() => setPrioModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            activeOpacity={1}
            onPress={() => setPrioModal(false)}
          />
          <View style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 20, width: '100%', maxWidth: 320 }}>
            <Text style={{ color: '#111827', fontSize: 17, fontWeight: '800', marginBottom: 4 }}>Filtrar por prioridad</Text>
            <Text style={{ color: '#9ca3af', fontSize: 13, marginBottom: 16 }}>Selecciona un nivel de prioridad</Text>
            {PRIORIDAD_OPTS.map((op) => {
              const active = filtroPrioridad === op.key;
              return (
                <TouchableOpacity
                  key={op.key}
                  onPress={() => { setFiltroPrioridad(op.key); setPrioModal(false); }}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 12,
                    padding: 12, borderRadius: 12, marginBottom: 8,
                    backgroundColor: active ? op.bg : '#f9fafb',
                    borderWidth: active ? 1.5 : 1,
                    borderColor: active ? `${op.color}50` : '#f3f4f6',
                  }}
                >
                  <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: op.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: `${op.color}30` }}>
                    <Ionicons name="flag-outline" size={16} color={op.color} />
                  </View>
                  <Text style={{ flex: 1, color: '#111827', fontSize: 14, fontWeight: '700' }}>{op.label}</Text>
                  {active && <Ionicons name="checkmark-circle" size={20} color={op.color} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}
