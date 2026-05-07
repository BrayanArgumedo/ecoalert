import { useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StatusBar, Platform, ActivityIndicator, Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  getIncidentById, getIncidentHistory,
  type Incidencia, type HistorialItem,
} from '../src/core/services/incidentsService';
import {
  TIPO_ICON, PRIORIDAD_STYLE, ESTADO_STYLE, resolveIcon,
} from '../src/features/incidents/components/IncidentCard';
import MapLeaflet from '../src/shared/components/MapLeaflet';

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';

async function geocode(address: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const q = encodeURIComponent(`${address}, Cereté, Córdoba, Colombia`);
    const res = await fetch(`${NOMINATIM}?q=${q}&format=json&limit=1`, {
      headers: { 'User-Agent': 'EcoAlert/1.0 (bargumedo0720@gmail.com)' },
    });
    const json = await res.json();
    if (json.length > 0) {
      return { lat: parseFloat(json[0].lat), lon: parseFloat(json[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

export default function IncidentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [incidencia,     setIncidencia]     = useState<Incidencia | null>(null);
  const [historia,       setHistoria]       = useState<HistorialItem[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [coords,         setCoords]         = useState<{ lat: number; lon: number } | null>(null);
  const [geocoding,      setGeocoding]      = useState(false);
  const [scrollEnabled,  setScrollEnabled]  = useState(true);
  const primeraVez = useRef(true);

  const fetchData = useCallback(async () => {
    if (!id) return;
    const esPrimera = primeraVez.current;
    if (esPrimera) { setLoading(true); primeraVez.current = false; }
    try {
      const [inc, hist] = await Promise.all([getIncidentById(id), getIncidentHistory(id)]);
      setIncidencia(inc);
      setHistoria(hist);

      if (inc.latitud !== null && inc.longitud !== null) {
        setCoords({ lat: Number(inc.latitud), lon: Number(inc.longitud) });
      } else if (inc.direccion) {
        if (esPrimera) setGeocoding(true);
        const result = await geocode(inc.direccion);
        setCoords(result);
        if (esPrimera) setGeocoding(false);
      }
    } finally {
      if (esPrimera) setLoading(false);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f8faf9', alignItems: 'center', justifyContent: 'center' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8faf9" />
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={{ color: '#9ca3af', marginTop: 14, fontSize: 14 }}>Cargando detalle...</Text>
      </View>
    );
  }

  if (!incidencia) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f8faf9', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8faf9" />
        <Ionicons name="alert-circle-outline" size={48} color="#d1d5db" />
        <Text style={{ color: '#9ca3af', marginTop: 14, fontSize: 15, textAlign: 'center' }}>Incidencia no encontrada</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: '#f0fdf4', borderRadius: 12 }}>
          <Text style={{ color: '#16a34a', fontWeight: '700' }}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const prioridad = PRIORIDAD_STYLE[incidencia.prioridad] ?? PRIORIDAD_STYLE.normal;
  const estado    = ESTADO_STYLE[incidencia.estado]       ?? ESTADO_STYLE.pendiente;

  const fecha = new Date(incidencia.fecha_reporte).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  const hora = new Date(incidencia.fecha_reporte).toLocaleTimeString('es-CO', {
    hour: '2-digit', minute: '2-digit',
  });

  const openMaps = () => {
    if (coords) {
      Linking.openURL(`https://maps.google.com/?q=${coords.lat},${coords.lon}`);
    } else if (incidencia.direccion) {
      const q = encodeURIComponent(`${incidencia.direccion}, Cereté, Córdoba, Colombia`);
      Linking.openURL(`https://maps.google.com/?q=${q}`);
    }
  };

  const hasLocation = !!(incidencia.direccion || coords || geocoding);

  return (
    <View style={{ flex: 1, backgroundColor: '#f8faf9' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView showsVerticalScrollIndicator={false} scrollEnabled={scrollEnabled} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ══ Header ════════════════════════════════════════════════ */}
        <LinearGradient
          colors={['#dcfce7', '#f0fdf4', '#ffffff']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{
            paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight ?? 0) + 16,
            paddingHorizontal: 20, paddingBottom: 24, overflow: 'hidden',
          }}
        >
          <View style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(34,197,94,0.1)' }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e5e7eb' }}
            >
              <Ionicons name="arrow-back" size={20} color="#374151" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#111827', fontSize: 20, fontWeight: '800' }}>Detalle del incidente</Text>
              <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 1 }}>Información completa</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 20, paddingTop: 20, gap: 14 }}>

          {/* ══ Card principal ════════════════════════════════════ */}
          <View style={{ backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#f0f0f0', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
            {/* Barra de color por prioridad */}
            <View style={{ height: 4, backgroundColor: prioridad.color }} />

            <View style={{ padding: 16 }}>
              {/* Tipo + estado */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                  <View style={{ width: 46, height: 46, borderRadius: 13, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#bbf7d0' }}>
                    <Ionicons name={resolveIcon(incidencia.icono_tipo, incidencia.nombre_tipo)} size={22} color="#16a34a" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#111827', fontWeight: '800', fontSize: 16 }} numberOfLines={2}>
                      {incidencia.nombre_tipo}
                    </Text>
                    <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>Emergencia ambiental</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: estado.bg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, marginLeft: 8 }}>
                  <Ionicons name={estado.icon} size={12} color={estado.color} />
                  <Text style={{ color: estado.color, fontSize: 12, fontWeight: '700' }}>{estado.label}</Text>
                </View>
              </View>

              {/* Badges */}
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: prioridad.bg, borderWidth: 1, borderColor: prioridad.border }}>
                  <Text style={{ color: prioridad.color, fontSize: 12, fontWeight: '700' }}>
                    Prioridad {prioridad.label}
                  </Text>
                </View>
                {incidencia.hay_heridos === 1 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fca5a5' }}>
                    <Ionicons name="medkit-outline" size={12} color="#dc2626" />
                    <Text style={{ color: '#dc2626', fontSize: 12, fontWeight: '700' }}>
                      {incidencia.cantidad_heridos
                        ? `${incidencia.cantidad_heridos} herido${incidencia.cantidad_heridos !== 1 ? 's' : ''}`
                        : 'Heridos reportados'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* ══ Descripción ═══════════════════════════════════════ */}
          <DetailCard title="Descripción" icon="document-text-outline" iconColor="#2563eb">
            <Text style={{ color: '#374151', fontSize: 14, lineHeight: 22 }}>
              {incidencia.descripcion}
            </Text>
          </DetailCard>

          {/* ══ Datos del reporte ═════════════════════════════════ */}
          <DetailCard title="Datos del reporte" icon="person-outline" iconColor="#7c3aed">
            <View style={{ gap: 10 }}>
              <InfoRow label="Reportado por" value={incidencia.nombre_usuario} />
              <Divider />
              <InfoRow label="Localidad" value={incidencia.localidad_usuario} />
              <Divider />
              <InfoRow label="Fecha" value={`${fecha}`} />
              <Divider />
              <InfoRow label="Hora" value={hora} />
            </View>
          </DetailCard>

          {/* ══ Servicios ════════════════════════════════════════ */}
          {incidencia.servicios.length > 0 && (
            <DetailCard title="Servicios requeridos" icon="call-outline" iconColor="#d97706">
              <View style={{ gap: 8 }}>
                {incidencia.servicios.map((s) => {
                  const confirmado = !!s.aceptada;
                  const esResuelta = incidencia.estado === 'resuelta';
                  type SvcS = { bg: string; border: string; color: string; icon: keyof typeof Ionicons.glyphMap };
                  const SVC_MAP: Record<string, SvcS> = {
                    Bombero:    { bg: '#fef2f2', border: '#fca5a5', color: '#dc2626', icon: 'flame-outline'  },
                    Policia:    { bg: '#eff6ff', border: '#bfdbfe', color: '#2563eb', icon: 'shield-outline' },
                    Paramedico: { bg: '#fffbeb', border: '#fde68a', color: '#d97706', icon: 'medkit-outline' },
                  };
                  const SVC_DEFAULT: SvcS = { bg: '#f9fafb', border: '#f3f4f6', color: '#9ca3af', icon: 'construct-outline' };
                  const svcBase = SVC_MAP[s.nombre_rol] ?? SVC_DEFAULT;
                  const svc = confirmado ? svcBase : { ...SVC_DEFAULT, icon: svcBase.icon };

                  const rowBg     = svc.bg;
                  const rowBorder = svc.border;
                  const nameColor = confirmado ? svc.color : '#374151';
                  const svcColor  = svc.color;
                  const badgeBg    = confirmado ? `${svc.color}18` : '#f3f4f6';
                  const badgeColor = confirmado ? svc.color : '#9ca3af';
                  const badgeIcon  = confirmado ? 'checkmark-circle' : 'time-outline';
                  const badgeText  = esResuelta && confirmado ? 'Atendido' : esResuelta ? 'No respondió' : confirmado ? 'Confirmado' : 'Pendiente';
                  const svcIcon    = svc.icon;

                  return (
                    <View key={s.id_servicio} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: rowBg, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: rowBorder }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Ionicons name={svcIcon} size={14} color={svcColor} />

                        <Text style={{ color: nameColor, fontSize: 13, fontWeight: '600' }}>{s.nombre}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: badgeBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7 }}>
                        <Ionicons name={badgeIcon} size={11} color={badgeColor} />
                        <Text style={{ color: badgeColor, fontSize: 11, fontWeight: '700' }}>{badgeText}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </DetailCard>
          )}

          {/* ══ Ubicación + Mapa ════════════════════════════════ */}
          {hasLocation && (
            <DetailCard title="Ubicación" icon="map-outline" iconColor="#16a34a">
              {incidencia.direccion && (
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 14 }}>
                  <Ionicons name="location-outline" size={15} color="#9ca3af" style={{ marginTop: 1 }} />
                  <Text style={{ color: '#374151', fontSize: 14, flex: 1, lineHeight: 20 }}>
                    {incidencia.direccion}
                  </Text>
                </View>
              )}

              {geocoding && (
                <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                  <ActivityIndicator size="small" color="#16a34a" />
                  <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 10 }}>
                    Localizando dirección en el mapa...
                  </Text>
                </View>
              )}

              {!geocoding && coords && (
                <>
                  <MapLeaflet
                    lat={coords.lat}
                    lon={coords.lon}
                    label={incidencia.direccion ?? ''}
                    height={200}
                    onScrollLock={() => setScrollEnabled(false)}
                    onScrollUnlock={() => setScrollEnabled(true)}
                  />
                  <Text style={{ color: '#9ca3af', fontSize: 11, textAlign: 'center', marginTop: 6, marginBottom: 4 }}>
                    {coords.lat.toFixed(5)}, {coords.lon.toFixed(5)}
                  </Text>
                </>
              )}

              {!geocoding && !coords && incidencia.direccion && (
                <Text style={{ color: '#9ca3af', fontSize: 12, textAlign: 'center', marginBottom: 10 }}>
                  No se pudo localizar la dirección en el mapa
                </Text>
              )}

              {!geocoding && (coords || incidencia.direccion) && (
                <TouchableOpacity
                  onPress={openMaps}
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#eff6ff', borderRadius: 12, paddingVertical: 12, borderWidth: 1, borderColor: '#dbeafe' }}
                >
                  <Ionicons name="navigate-outline" size={16} color="#2563eb" />
                  <Text style={{ color: '#2563eb', fontWeight: '700', fontSize: 13 }}>
                    Abrir en Google Maps
                  </Text>
                </TouchableOpacity>
              )}
            </DetailCard>
          )}

          {/* ══ Historial de estados ════════════════════════════ */}
          {historia.length > 0 && (
            <DetailCard title="Historial de estados" icon="time-outline" iconColor="#6b7280">
              {historia.map((h, idx) => {
                const isLast      = idx === historia.length - 1;
                const estStyle    = ESTADO_STYLE[h.estado_nuevo] ?? ESTADO_STYLE.pendiente;
                const fechaH      = new Date(h.fecha_cambio).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
                const horaH       = new Date(h.fecha_cambio).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
                const anteriorLbl = h.estado_anterior ? (ESTADO_STYLE[h.estado_anterior]?.label ?? h.estado_anterior) : null;

                return (
                  <View key={h.id_historial} style={{ flexDirection: 'row', gap: 12 }}>
                    {/* Nodo + línea */}
                    <View style={{ alignItems: 'center', width: 28 }}>
                      <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: estStyle.bg, borderWidth: 2, borderColor: estStyle.color, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name={estStyle.icon} size={13} color={estStyle.color} />
                      </View>
                      {!isLast && (
                        <View style={{ width: 2, flex: 1, backgroundColor: '#e5e7eb', marginTop: 4, marginBottom: 4, minHeight: 16 }} />
                      )}
                    </View>

                    {/* Contenido */}
                    <View style={{ flex: 1, paddingBottom: isLast ? 0 : 18 }}>
                      <Text style={{ color: '#111827', fontWeight: '700', fontSize: 13 }}>
                        {estStyle.label}
                      </Text>
                      {anteriorLbl && (
                        <Text style={{ color: '#9ca3af', fontSize: 11, marginTop: 1 }}>
                          Anterior: {anteriorLbl}
                        </Text>
                      )}
                      <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>
                        {h.nombre_usuario} · {fechaH} {horaH}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </DetailCard>
          )}

          {historia.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 8 }}>
              <Text style={{ color: '#d1d5db', fontSize: 12 }}>Sin cambios de estado registrados</Text>
            </View>
          )}

        </View>
      </ScrollView>
    </View>
  );
}

function DetailCard({
  title, icon, iconColor, children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#f0f0f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
        <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: `${iconColor}12`, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon} size={17} color={iconColor} />
        </View>
        <Text style={{ color: '#111827', fontWeight: '700', fontSize: 14 }}>{title}</Text>
      </View>
      <View style={{ padding: 16 }}>
        {children}
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
      <Text style={{ color: '#9ca3af', fontSize: 13 }}>{label}</Text>
      <Text style={{ color: '#374151', fontSize: 13, fontWeight: '600', flex: 1, textAlign: 'right' }}>
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: '#f3f4f6' }} />;
}
