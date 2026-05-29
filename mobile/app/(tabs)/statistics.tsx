// app/(tabs)/statistics.tsx
// Pantalla de estadísticas (solo Admin). Muestra métricas calculadas
// localmente a partir de todas las incidencias: resumen, distribución por
// tipo, estado, prioridad, localidad y servicios. Permite exportar el
// informe completo como PDF usando expo-print. Lógica en useStatistics.

import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StatusBar, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useStatistics, type StatItem } from '../../src/features/admin/hooks/useStatistics';
import { generatePdfUri } from '../../src/features/admin/utils/generateStatsPdf';

// ── Colores ──────────────────────────────────────────────────────
const ESTADO_COLORS  = ['#d97706', '#2563eb', '#16a34a'];
const TIPO_COLORS    = ['#16a34a', '#2563eb', '#7c3aed', '#d97706', '#dc2626', '#0891b2', '#65a30d', '#c026d3'];
const PRIO_COLOR     = (label: string) =>
  label === 'Alta' ? '#d97706' : label === 'Crítica' ? '#dc2626' : '#16a34a';

// ── Donut SVG con interactividad ─────────────────────────────────
function DonutChart({ data, colors, size = 160, selectedIdx }: {
  data: StatItem[]; colors: string[]; size?: number; selectedIdx: number | null;
}) {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) return null;

  const r = 54; const cx = size / 2; const cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  const segments = data.map((item, i) => {
    const ratio  = item.count / total;
    const dash   = ratio * circ;
    const gap    = circ - dash;
    const rotate = (offset / total) * 360 - 90;
    offset += item.count;
    return { dash, gap, rotate, color: colors[i % colors.length], label: item.label, count: item.count };
  });

  const selected    = selectedIdx !== null ? data[selectedIdx] : null;
  const centerValue = selected ? selected.count : total;
  const centerColor = selected ? colors[selectedIdx! % colors.length] : '#111827';
  const centerSub   = selected ? selected.label : 'Total';
  const shortSub    = centerSub.length > 10 ? centerSub.slice(0, 9) + '…' : centerSub;

  return (
    <Svg width={size} height={size}>
      <G>
        {segments.map((seg, i) => (
          <Circle
            key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={seg.color}
            strokeWidth={selectedIdx === null || selectedIdx === i ? 22 : 17}
            strokeDasharray={`${seg.dash} ${seg.gap}`}
            transform={`rotate(${seg.rotate}, ${cx}, ${cy})`}
            opacity={selectedIdx === null || selectedIdx === i ? 1 : 0.18}
          />
        ))}
      </G>
      <SvgText x={cx} y={cy - 4} textAnchor="middle" fontSize={22} fontWeight="800" fill={centerColor}>
        {centerValue}
      </SvgText>
      <SvgText x={cx} y={cy + 14} textAnchor="middle" fontSize={9} fontWeight="600" fill="#9ca3af">
        {shortSub}
      </SvgText>
    </Svg>
  );
}

// ── Barra horizontal interactiva ─────────────────────────────────
function HBar({ label, count, pct, color, rank, selected, onPress }: StatItem & {
  color: string; rank?: number; selected?: boolean; onPress?: () => void;
}) {
  const dimmed = selected === false;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      disabled={!onPress}
      style={{ marginBottom: 10, opacity: dimmed ? 0.35 : 1 }}
    >
      <View style={{
        backgroundColor: selected ? `${color}0E` : 'transparent',
        borderRadius: 8,
        padding: selected ? 6 : 0,
        borderWidth: selected ? 1 : 0,
        borderColor: `${color}30`,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
            {rank !== undefined && (
              <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: `${color}20`, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color, fontSize: 9, fontWeight: '800' }}>{rank}</Text>
              </View>
            )}
            <Text style={{ color: selected ? color : '#374151', fontSize: 12, fontWeight: selected ? '700' : '600', flex: 1 }} numberOfLines={1}>{label}</Text>
          </View>
          <Text style={{ color, fontSize: 12, fontWeight: '800', marginLeft: 8 }}>{count}</Text>
        </View>
        <View style={{ height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
          <View style={{ width: `${Math.max(pct, 2)}%`, height: 8, backgroundColor: color, borderRadius: 4 }} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Barras verticales interactivas ───────────────────────────────
function VBarChart({ data, colors, selectedLabel, onSelect }: {
  data: StatItem[]; colors: string[];
  selectedLabel?: string | null; onSelect?: (label: string) => void;
}) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const BAR_MAX_H = 110;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingBottom: 4, minHeight: BAR_MAX_H + 54 }}>
        {data.map((item, i) => {
          const barH    = Math.max(Math.round((item.count / maxCount) * BAR_MAX_H), 6);
          const color   = colors[i % colors.length];
          const isSelected = selectedLabel === item.label;
          const isDimmed   = selectedLabel != null && !isSelected;
          return (
            <TouchableOpacity
              key={item.label}
              activeOpacity={0.75}
              onPress={() => onSelect?.(item.label)}
              style={{ alignItems: 'center', width: 58, opacity: isDimmed ? 0.3 : 1 }}
            >
              <Text style={{ color: isSelected ? color : '#374151', fontSize: 12, fontWeight: isSelected ? '800' : '600', marginBottom: 4 }}>
                {item.count}
              </Text>
              <View style={{
                width: isSelected ? 46 : 42,
                height: barH,
                backgroundColor: color,
                borderRadius: 6,
                borderBottomLeftRadius: 2,
                borderBottomRightRadius: 2,
                shadowColor: color,
                shadowOffset: { width: 0, height: isSelected ? 3 : 0 },
                shadowOpacity: isSelected ? 0.45 : 0,
                shadowRadius: 5,
                elevation: isSelected ? 5 : 0,
              }} />
              <View style={{ width: isSelected ? 46 : 42, height: 2, backgroundColor: '#e5e7eb' }} />
              <Text style={{ color: isSelected ? color : '#374151', fontSize: 9, fontWeight: isSelected ? '700' : '600', textAlign: 'center', marginTop: 5, lineHeight: 12 }} numberOfLines={3}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ── Tarjeta de sección ───────────────────────────────────────────
function SectionCard({ title, icon, iconColor, children }: {
  title: string; icon: keyof typeof Ionicons.glyphMap;
  iconColor: string; children: React.ReactNode;
}) {
  return (
    <View style={{ backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#f0f0f0', marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
        <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: `${iconColor}12`, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon} size={17} color={iconColor} />
        </View>
        <Text style={{ color: '#111827', fontWeight: '700', fontSize: 14 }}>{title}</Text>
      </View>
      <View style={{ padding: 16 }}>{children}</View>
    </View>
  );
}

// ── Pantalla principal ───────────────────────────────────────────
export default function StatisticsScreen() {
  const { stats, loading, error, rawData, recargar } = useStatistics();
  const [exporting,     setExporting]     = useState(false);
  const [selectedDonut, setSelectedDonut] = useState<number | null>(null);

  // Pre-calienta el WebView interno de expo-print al montar la pantalla,
  // así la primera generación real de PDF es instantánea.
  useEffect(() => {
    Print.printToFileAsync({ html: '<html><body></body></html>' }).catch(() => {});
  }, []);
  const [selectedTipo,  setSelectedTipo]  = useState<string | null>(null);
  const [selectedPrio,  setSelectedPrio]  = useState<string | null>(null);
  const [selectedLoc,   setSelectedLoc]   = useState<string | null>(null);
  const [selectedSvc,   setSelectedSvc]   = useState<string | null>(null);

  const toggleBar = (
    current: string | null,
    set: (v: string | null) => void,
    label: string,
  ) => set(current === label ? null : label);

  // Intenta generar PDF con un reintento silencioso si el primer intento agota el tiempo
  const handleExport = async (esReintento = false) => {
    if (!stats || rawData.length === 0) return;
    if (!esReintento) setExporting(true);

    try {
      const uri = await Promise.race([
        generatePdfUri(stats, rawData),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 25000)
        ),
      ]);
      setExporting(false);
      if (await Sharing.isAvailableAsync()) {
        // fire-and-forget: si el sistema rechaza (ej. ya hay un share activo), lo ignoramos silenciosamente
        Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Exportar reporte EcoAlert',
          UTI: 'com.adobe.pdf',
        }).catch(() => {});
      }
    } catch (err: any) {
      if (err?.message === 'timeout' && !esReintento) {
        handleExport(true); // reintento silencioso automático
      } else {
        setExporting(false);
        Alert.alert('Error al generar PDF', 'No se pudo generar el PDF. Intenta de nuevo.');
      }
    }
  };

  const toggleDonut = (i: number) =>
    setSelectedDonut((prev) => (prev === i ? null : i));

  return (
    <View style={{ flex: 1, backgroundColor: '#f8faf9' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ══ Header ════════════════════════════════════════════════ */}
        <LinearGradient
          colors={['#dcfce7', '#f0fdf4', '#ffffff']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ paddingTop: Platform.OS === 'ios' ? 56 : 48, paddingHorizontal: 20, paddingBottom: 24, overflow: 'hidden' }}
        >
          <View style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(34,197,94,0.1)' }} />
          <View style={{ position: 'absolute', bottom: 0, left: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(134,239,172,0.12)' }} />

          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(21,128,61,0.12)', borderWidth: 1.5, borderColor: 'rgba(21,128,61,0.25)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="bar-chart-outline" size={22} color="#15803d" />
              </View>
              <View>
                <Text style={{ color: '#111827', fontSize: 22, fontWeight: '800' }}>Estadísticas</Text>
                <Text style={{ color: '#9ca3af', fontSize: 13, marginTop: 1 }}>Panel de análisis · Admin</Text>
              </View>
            </View>

            <TouchableOpacity onPress={recargar} style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e5e7eb' }}>
              <Ionicons name="refresh-outline" size={18} color="#374151" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ══ Loading / Error ═══════════════════════════════════════ */}
        {loading && (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <ActivityIndicator size="large" color="#16a34a" />
            <Text style={{ color: '#9ca3af', marginTop: 14, fontSize: 14 }}>Calculando estadísticas...</Text>
          </View>
        )}

        {!loading && error !== '' && (
          <View style={{ margin: 20, padding: 16, backgroundColor: '#fef2f2', borderRadius: 12, borderWidth: 1, borderColor: '#fca5a5', alignItems: 'center', gap: 8 }}>
            <Ionicons name="alert-circle-outline" size={28} color="#dc2626" />
            <Text style={{ color: '#dc2626', fontSize: 14, textAlign: 'center' }}>{error}</Text>
            <TouchableOpacity onPress={recargar} style={{ backgroundColor: '#dc2626', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 8 }}>
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && stats && (
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>

            {/* ══ 1. Tarjetas resumen ══════════════════════════════ */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
              {[
                { label: 'Total',      value: stats.total,      color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', icon: 'layers-outline'          },
                { label: 'Pendientes', value: stats.pendientes,  color: '#d97706', bg: '#fffbeb', border: '#fcd34d', icon: 'time-outline'            },
                { label: 'En proceso', value: stats.enProceso,   color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: 'sync-outline'            },
                { label: 'Resueltas',  value: stats.resueltas,   color: '#16a34a', bg: '#f0fdf4', border: '#86efac', icon: 'checkmark-circle-outline' },
              ].map((c) => (
                <View key={c.label} style={{ flex: 1, backgroundColor: c.bg, borderRadius: 14, borderWidth: 1.5, borderColor: c.border, padding: 12, alignItems: 'center', gap: 4 }}>
                  <Ionicons name={c.icon as any} size={18} color={c.color} />
                  <Text style={{ color: c.color, fontSize: 22, fontWeight: '800' }}>{c.value}</Text>
                  <Text style={{ color: c.color, fontSize: 9, fontWeight: '700', opacity: 0.75, textAlign: 'center' }}>{c.label.toUpperCase()}</Text>
                </View>
              ))}
            </View>

            {/* Tasa de resolución */}
            <View style={{ backgroundColor: '#ffffff', borderRadius: 14, borderWidth: 1, borderColor: '#f0f0f0', padding: 16, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#9ca3af', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 }}>Tasa de resolución</Text>
                <View style={{ height: 10, backgroundColor: '#f3f4f6', borderRadius: 5, overflow: 'hidden' }}>
                  <View style={{ width: `${stats.tasaRes}%`, height: 10, backgroundColor: '#16a34a', borderRadius: 5 }} />
                </View>
              </View>
              <Text style={{ color: '#15803d', fontSize: 26, fontWeight: '800' }}>{stats.tasaRes}%</Text>
            </View>

            {/* Heridos — mismo estilo que las tarjetas de resumen */}
            {stats.incConHeridos > 0 && (
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                {[
                  { label: 'INCIDENCIAS\nCON HERIDOS', value: stats.incConHeridos, icon: 'medkit-outline'  },
                  { label: 'TOTAL DE\nHERIDOS',        value: stats.totalHeridos,  icon: 'people-outline' },
                ].map((c) => (
                  <View key={c.label} style={{ flex: 1, backgroundColor: '#fef2f2', borderRadius: 14, borderWidth: 1.5, borderColor: '#fca5a5', padding: 12, alignItems: 'center', gap: 4 }}>
                    <Ionicons name={c.icon as any} size={18} color="#dc2626" />
                    <Text style={{ color: '#dc2626', fontSize: 22, fontWeight: '800' }}>{c.value}</Text>
                    <Text style={{ color: '#dc2626', fontSize: 9, fontWeight: '700', opacity: 0.75, textAlign: 'center' }}>{c.label}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* ══ 2. Distribución por estado (Donut interactivo) ══ */}
            <SectionCard title="Distribución por estado" icon="pie-chart-outline" iconColor="#7c3aed">
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <DonutChart data={stats.porEstado} colors={ESTADO_COLORS} size={150} selectedIdx={selectedDonut} />
                <View style={{ flex: 1, gap: 8 }}>
                  {stats.porEstado.map((s, i) => {
                    const active = selectedDonut === i;
                    return (
                      <TouchableOpacity
                        key={s.label}
                        activeOpacity={0.7}
                        onPress={() => toggleDonut(i)}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: active ? `${ESTADO_COLORS[i]}12` : 'transparent', borderRadius: 8, paddingVertical: 5, paddingHorizontal: 6, borderWidth: active ? 1 : 0, borderColor: `${ESTADO_COLORS[i]}40` }}
                      >
                        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: ESTADO_COLORS[i] }} />
                        <Text style={{ color: '#374151', fontSize: 12, flex: 1 }}>{s.label}</Text>
                        <Text style={{ color: ESTADO_COLORS[i], fontSize: 12, fontWeight: '800' }}>{s.count}</Text>
                        <Text style={{ color: '#9ca3af', fontSize: 11 }}>({s.pct}%)</Text>
                      </TouchableOpacity>
                    );
                  })}
                  {selectedDonut !== null && (
                    <TouchableOpacity onPress={() => setSelectedDonut(null)}>
                      <Text style={{ color: '#9ca3af', fontSize: 10, textAlign: 'center', marginTop: 2 }}>Toca para deseleccionar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </SectionCard>

            {/* ══ 3. Por tipo — barras verticales interactivas ════ */}
            <SectionCard title="Por tipo de emergencia" icon="alert-circle-outline" iconColor="#16a34a">
              <VBarChart
                data={stats.porTipo}
                colors={TIPO_COLORS}
                selectedLabel={selectedTipo}
                onSelect={(label) => toggleBar(selectedTipo, setSelectedTipo, label)}
              />
            </SectionCard>

            {/* ══ 4. Por prioridad — barras horizontales interactivas */}
            <SectionCard title="Por prioridad" icon="flag-outline" iconColor="#d97706">
              {stats.porPrioridad.map((s) => (
                <HBar
                  key={s.label} {...s}
                  color={PRIO_COLOR(s.label)}
                  selected={selectedPrio === null ? undefined : selectedPrio === s.label}
                  onPress={() => toggleBar(selectedPrio, setSelectedPrio, s.label)}
                />
              ))}
            </SectionCard>

            {/* ══ 5. Top localidades — barras horizontales interactivas */}
            <SectionCard title="Top localidades" icon="location-outline" iconColor="#7c3aed">
              {stats.porLocalidad.slice(0, 8).map((s, i) => (
                <HBar
                  key={s.label} {...s}
                  color="#7c3aed"
                  rank={i + 1}
                  selected={selectedLoc === null ? undefined : selectedLoc === s.label}
                  onPress={() => toggleBar(selectedLoc, setSelectedLoc, s.label)}
                />
              ))}
            </SectionCard>

            {/* ══ 6. Servicios más requeridos — barras interactivas */}
            {stats.porServicio.length > 0 && (
              <SectionCard title="Servicios más requeridos" icon="call-outline" iconColor="#2563eb">
                {stats.porServicio.map((s) => (
                  <HBar
                    key={s.label} {...s}
                    color="#2563eb"
                    selected={selectedSvc === null ? undefined : selectedSvc === s.label}
                    onPress={() => toggleBar(selectedSvc, setSelectedSvc, s.label)}
                  />
                ))}
              </SectionCard>
            )}

            {/* ══ Botón Exportar PDF ════════════════════════════════ */}
            <TouchableOpacity onPress={() => handleExport()} disabled={exporting} activeOpacity={0.85} style={{ marginTop: 4, marginBottom: 8 }}>
              <LinearGradient
                colors={['#15803d', '#16a34a']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10, shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6, opacity: exporting ? 0.7 : 1 }}
              >
                {exporting
                  ? <><ActivityIndicator color="white" size="small" /><Text style={{ color: 'white', fontWeight: '800', fontSize: 15 }}>Generando PDF...</Text></>
                  : <><Ionicons name="document-text-outline" size={20} color="white" /><Text style={{ color: 'white', fontWeight: '800', fontSize: 15 }}>Exportar reporte PDF</Text></>
                }
              </LinearGradient>
            </TouchableOpacity>

          </View>
        )}
      </ScrollView>
    </View>
  );
}
