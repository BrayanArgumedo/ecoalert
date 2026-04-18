import { useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StatusBar,
  Platform, ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/core/stores/authStore';
import { isAdmin, isResponder, canCreateIncident } from '../../src/core/utils/roles';
import { useIncidents, FILTROS } from '../../src/features/incidents/hooks/useIncidents';
import IncidentCard from '../../src/features/incidents/components/IncidentCard';
import EmptyIncidents from '../../src/features/incidents/components/EmptyIncidents';

export default function IncidentsScreen() {
  const router    = useRouter();
  const rol       = useAuthStore((s) => s.user?.rol ?? '');
  const admin     = isAdmin(rol);
  const responder = isResponder(rol);
  const canCreate = canCreateIncident(rol);

  const { incidencias, filtro, setFiltro, loading, refreshing, error, cargar } = useIncidents();

  useEffect(() => { cargar(); }, [cargar]);

  const headerTitle = admin ? 'Todos los incidentes' : responder ? 'Incidentes asignados' : 'Mis reportes';
  const headerSubtitle = incidencias.length > 0
    ? `${incidencias.length} registro${incidencias.length !== 1 ? 's' : ''}`
    : 'Sin incidentes';

  return (
    <View style={{ flex: 1, backgroundColor: '#f8faf9' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8faf9" translucent={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => cargar(true)} tintColor="#16a34a" colors={['#16a34a']} />
        }
      >
        {/* ══ Header ══════════════════════════════════════════════════ */}
        <LinearGradient
          colors={['#dcfce7', '#f0fdf4', '#ffffff']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ paddingTop: Platform.OS === 'ios' ? 56 : 48, paddingHorizontal: 20, paddingBottom: 24, overflow: 'hidden' }}
        >
          <View style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(34,197,94,0.12)' }} />
          <View style={{ position: 'absolute', top: 20, right: 80, width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(134,239,172,0.2)' }} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#16a34a', fontSize: 13, fontWeight: '600' }}>EcoAlert</Text>
              <Text style={{ color: '#111827', fontSize: 22, fontWeight: '800', marginTop: 2 }}>{headerTitle}</Text>
              <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>{headerSubtitle}</Text>
            </View>
            {canCreate && (
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/create-incident' as any)}
                activeOpacity={0.85}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#15803d', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, shadowColor: '#16a34a', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 }}
              >
                <Ionicons name="add" size={16} color="white" />
                <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>Reportar</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>

          {/* ══ Chips de filtro ══════════════════════════════════════ */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 4, marginBottom: 20 }}>
            {FILTROS.map((f) => {
              const activo = filtro === f.key;
              return (
                <TouchableOpacity
                  key={f.key}
                  onPress={() => setFiltro(f.key)}
                  activeOpacity={0.8}
                  style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, backgroundColor: activo ? '#15803d' : '#ffffff', borderColor: activo ? '#15803d' : '#e5e7eb' }}
                >
                  <Text style={{ color: activo ? 'white' : '#6b7280', fontWeight: '700', fontSize: 13 }}>{f.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ══ Contenido ════════════════════════════════════════════ */}
          {loading
            ? <View style={{ alignItems: 'center', paddingTop: 60 }}><ActivityIndicator size="large" color="#16a34a" /><Text style={{ color: '#9ca3af', marginTop: 14, fontSize: 14 }}>Cargando incidentes...</Text></View>
            : error !== ''
            ? (
              <View style={{ alignItems: 'center', paddingTop: 60 }}>
                <Ionicons name="cloud-offline-outline" size={48} color="#e5e7eb" />
                <Text style={{ color: '#6b7280', fontSize: 14, marginTop: 14, textAlign: 'center' }}>{error}</Text>
                <TouchableOpacity onPress={() => cargar()} style={{ marginTop: 16 }}>
                  <Text style={{ color: '#16a34a', fontWeight: '700', fontSize: 14 }}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            )
            : incidencias.length === 0
            ? <EmptyIncidents filtro={filtro} canCreate={canCreate} />
            : incidencias.map((inc) => <IncidentCard key={inc.id_incidencia} item={inc} rol={rol} onStatusChanged={() => cargar()} />)
          }
        </View>
      </ScrollView>
    </View>
  );
}
