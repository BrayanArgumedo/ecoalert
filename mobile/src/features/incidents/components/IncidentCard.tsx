// src/features/incidents/components/IncidentCard.tsx
// Tarjeta de incidencia con todas las acciones disponibles según el rol.
// Admin: puede cambiar el estado (bottom sheet con flujo unidireccional).
// Responders: pueden aceptar su servicio asignado (con modal de confirmación).
// Todos: pueden ver el detalle. El estado solo avanza, nunca retrocede.

import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { isAdmin, isResponder, ROLES } from '../../../core/utils/roles';
import { useAuthStore } from '../../../core/stores/authStore';
import type { Incidencia } from '../../../core/services/incidentsService';
import { changeIncidentStatus, acceptIncident } from '../../../core/services/incidentsService';

type IoniconsName = keyof typeof Ionicons.glyphMap;

const MENSAJE_ACEPTACION: Record<string, { icon: IoniconsName; title: string; text: string; color: string; bg: string; border: string }> = {
  Bombero:    { icon: 'flame-outline',  title: 'Unidad despachada', text: 'La brigada de bomberos ha sido asignada y se dirige al lugar del incidente.',      color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
  Policia:    { icon: 'shield-outline', title: 'Unidad despachada', text: 'La unidad policial ha sido asignada y se dirige al lugar del incidente.',           color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  Paramedico: { icon: 'medkit-outline', title: 'Unidad despachada', text: 'El equipo de asistencia médica ha sido despachado al lugar del incidente.',         color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
};

const SERVICIO_STYLE: Record<string, { bg: string; border: string; color: string; icon: IoniconsName }> = {
  Bombero:    { bg: '#fef2f2', border: '#fca5a5', color: '#dc2626', icon: 'flame-outline'  },
  Policia:    { bg: '#eff6ff', border: '#bfdbfe', color: '#2563eb', icon: 'shield-outline' },
  Paramedico: { bg: '#fffbeb', border: '#fde68a', color: '#d97706', icon: 'medkit-outline' },
};
const SERVICIO_DEFAULT = { bg: '#f3f4f6', border: 'transparent', color: '#6b7280', icon: 'construct-outline' as IoniconsName };

// Alias cortos guardados en la BD (tipos sembrados originalmente) → Ionicons real
const ICONO_ALIAS: Record<string, IoniconsName> = {
  earthquake: 'pulse-outline',
  flood:      'water-outline',
  landslide:  'trending-down-outline',
  slide:      'trending-down-outline',
  hurricane:  'thunderstorm-outline',
  fire:       'flame-outline',
  storm:      'thunderstorm-outline',
  pollution:  'cloud-outline',
};

export function resolveIcon(icono_tipo: string | null, nombre_tipo: string): IoniconsName {
  if (icono_tipo) {
    if (ICONO_ALIAS[icono_tipo]) return ICONO_ALIAS[icono_tipo];
    return icono_tipo as IoniconsName; // nombre Ionicons directo (selector nuevo)
  }
  return TIPO_ICON[nombre_tipo] ?? 'alert-circle-outline';
}

export const TIPO_ICON: Record<string, IoniconsName> = {
  Terremoto:                 'pulse-outline',
  'Inundación':              'water-outline',
  Derrumbe:                  'alert-circle-outline',
  'Huracán':                 'thunderstorm-outline',
  'Incendio Forestal':       'flame-outline',
  Deslizamiento:             'trending-down-outline',
  'Tormenta Eléctrica':      'flash-outline',
  'Contaminación Ambiental': 'leaf-outline',
};

export const PRIORIDAD_STYLE: Record<string, { color: string; bg: string; border: string; label: string }> = {
  normal:  { color: '#16a34a', bg: '#f0fdf4', border: '#86efac', label: 'Normal'  },
  alta:    { color: '#d97706', bg: '#fffbeb', border: '#fcd34d', label: 'Alta'    },
  critica: { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', label: 'Crítica' },
};

export const ESTADO_STYLE: Record<string, { color: string; bg: string; label: string; icon: IoniconsName }> = {
  pendiente:  { color: '#d97706', bg: '#fffbeb', label: 'Pendiente',  icon: 'time-outline'             },
  en_proceso: { color: '#2563eb', bg: '#eff6ff', label: 'En proceso', icon: 'sync-outline'             },
  resuelta:   { color: '#16a34a', bg: '#f0fdf4', label: 'Resuelta',   icon: 'checkmark-circle-outline' },
};

const ESTADOS_OPCIONES: Array<{
  key: Incidencia['estado']; label: string; desc: string;
  icon: IoniconsName; color: string; bg: string; order: number;
}> = [
  { key: 'pendiente',  label: 'Pendiente',  desc: 'Esperando atención',    icon: 'time-outline',             color: '#d97706', bg: '#fffbeb', order: 0 },
  { key: 'en_proceso', label: 'En proceso', desc: 'Siendo atendida',       icon: 'sync-outline',             color: '#2563eb', bg: '#eff6ff', order: 1 },
  { key: 'resuelta',   label: 'Resuelta',   desc: 'Emergencia controlada', icon: 'checkmark-circle-outline', color: '#16a34a', bg: '#f0fdf4', order: 2 },
];

const ESTADO_ORDER: Record<Incidencia['estado'], number> = {
  pendiente: 0, en_proceso: 1, resuelta: 2,
};

interface IncidentCardProps {
  item:             Incidencia;
  rol:              string;
  onStatusChanged?: () => void;
}

export default function IncidentCard({ item, rol, onStatusChanged }: IncidentCardProps) {
  const router         = useRouter();
  const currentUserId  = useAuthStore((s) => s.user?.id);
  const admin          = isAdmin(rol);
  const responder      = isResponder(rol);
  const esBadgeLocalidad = rol === ROLES.REPRESENTANTE && item.id_usuario !== currentUserId;

  const miServicio   = item.servicios.find((s) => s.nombre_rol === rol);
  const [statusModal,  setStatusModal]  = useState(false);
  const [errorModal,   setErrorModal]   = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [localEstado,  setLocalEstado]  = useState<Incidencia['estado']>(item.estado);
  const [aceptado,        setAceptado]        = useState(!!miServicio?.aceptada);
  const [accepting,       setAccepting]       = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);

  const prioridad = PRIORIDAD_STYLE[item.prioridad] ?? PRIORIDAD_STYLE.normal;
  const estado    = ESTADO_STYLE[localEstado]       ?? ESTADO_STYLE.pendiente;

  const fecha = new Date(item.fecha_reporte).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  const hora = new Date(item.fecha_reporte).toLocaleTimeString('es-CO', {
    hour: '2-digit', minute: '2-digit',
  });

  const handleChangeStatus = async (nuevoEstado: Incidencia['estado']) => {
    // Mismo estado — cerrar sin hacer nada
    if (nuevoEstado === localEstado) { setStatusModal(false); return; }

    // Intento de retroceso — mostrar modal de error personalizado
    if (ESTADO_ORDER[nuevoEstado] < ESTADO_ORDER[localEstado]) {
      setErrorModal(true);
      return;
    }

    setSaving(true);
    try {
      await changeIncidentStatus(item.id_incidencia, nuevoEstado);
      setLocalEstado(nuevoEstado);
      setStatusModal(false);
      onStatusChanged?.();
    } catch {
      setErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await acceptIncident(item.id_incidencia);
      setAceptado(true);
      setShowAcceptModal(true);
      setTimeout(() => setShowAcceptModal(false), 3500);
      onStatusChanged?.();
    } catch {
      // mantener estado
    } finally {
      setAccepting(false);
    }
  };

  return (
    <>
      <View style={{
        backgroundColor: '#ffffff', borderRadius: 16, marginBottom: 12,
        borderWidth: 1, borderColor: '#f0f0f0', overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
      }}>
        {/* Barra de prioridad */}
        <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: prioridad.color }} />

        <View style={{ padding: 16, paddingLeft: 20 }}>

          {/* Fila 1: tipo + badge estado */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={resolveIcon(item.icono_tipo, item.nombre_tipo)} size={18} color="#16a34a" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#111827', fontWeight: '700', fontSize: 14 }} numberOfLines={1}>
                  {item.nombre_tipo}
                </Text>
                <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>
                  {item.nombre_usuario} · {item.localidad_usuario}
                </Text>
                {esBadgeLocalidad && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4, alignSelf: 'flex-start', backgroundColor: '#f3e8ff', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#e9d5ff' }}>
                    <Ionicons name="location-outline" size={10} color="#7c3aed" />
                    <Text style={{ color: '#7c3aed', fontSize: 10, fontWeight: '700' }}>De tu localidad</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: estado.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
              <Ionicons name={estado.icon} size={11} color={estado.color} />
              <Text style={{ color: estado.color, fontSize: 11, fontWeight: '700' }}>{estado.label}</Text>
            </View>
          </View>

          {/* Descripción */}
          <Text style={{ color: '#374151', fontSize: 13, lineHeight: 19, marginBottom: 10 }} numberOfLines={2}>
            {item.descripcion}
          </Text>

          {/* Dirección */}
          {item.direccion && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 }}>
              <Ionicons name="location-outline" size={12} color="#9ca3af" />
              <Text style={{ color: '#9ca3af', fontSize: 12 }} numberOfLines={1}>{item.direccion}</Text>
            </View>
          )}

          {/* Prioridad + heridos + fecha */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <View style={{ paddingHorizontal: 9, paddingVertical: 3, borderRadius: 7, backgroundColor: prioridad.bg, borderWidth: 1, borderColor: prioridad.border }}>
              <Text style={{ color: prioridad.color, fontSize: 11, fontWeight: '700' }}>{prioridad.label}</Text>
            </View>
            {item.hay_heridos === 1 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 7, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fca5a5' }}>
                <Ionicons name="medkit-outline" size={11} color="#dc2626" />
                <Text style={{ color: '#dc2626', fontSize: 11, fontWeight: '700' }}>
                  {item.cantidad_heridos ? `${item.cantidad_heridos} herido${item.cantidad_heridos !== 1 ? 's' : ''}` : 'Heridos'}
                </Text>
              </View>
            )}
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={{ color: '#9ca3af', fontSize: 11 }}>{fecha} {hora}</Text>
            </View>
          </View>

          {/* Servicios */}
          {item.servicios.length > 0 && (
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
              {item.servicios.map((s) => {
                const confirmado = !!s.aceptada || (s.nombre_rol === rol && aceptado);
                const svcBase = SERVICIO_STYLE[s.nombre_rol] ?? SERVICIO_DEFAULT;
                const svc = confirmado
                  ? svcBase
                  : { bg: '#f3f4f6', border: 'transparent', color: '#6b7280', icon: svcBase.icon };
                return (
                  <View key={s.id_servicio} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 7, backgroundColor: svc.bg, borderWidth: 1, borderColor: svc.border }}>
                    <Ionicons name={svc.icon} size={11} color={svc.color} />
                    <Text style={{ color: svc.color, fontSize: 11, fontWeight: '600' }}>{s.nombre}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Botones de acción */}
          <View style={{ height: 1, backgroundColor: '#f3f4f6', marginBottom: 12 }} />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <ActionBtn
              icon="eye-outline"
              label="Ver detalle"
              color="#15803d"
              bg="#f0fdf4"
              onPress={() => router.push(`/incident-detail?id=${item.id_incidencia}`)}
            />
            {admin && (
              <ActionBtn
                icon="swap-horizontal-outline"
                label="Cambiar estado"
                color="#2563eb"
                bg="#eff6ff"
                onPress={() => setStatusModal(true)}
              />
            )}
            {responder && miServicio && localEstado !== 'resuelta' && (
              aceptado ? (
                <ActionBtn
                  icon="checkmark-circle"
                  label="Aceptado"
                  color="#16a34a"
                  bg="#f0fdf4"
                />
              ) : (
                <ActionBtn
                  icon={accepting ? 'sync-outline' : 'radio-button-on-outline'}
                  label={accepting ? 'Aceptando...' : 'Aceptar'}
                  color="#d97706"
                  bg="#fffbeb"
                  onPress={accepting ? undefined : handleAccept}
                />
              )
            )}
          </View>

        </View>
      </View>

      {/* ══ Bottom sheet — cambiar estado ══════════════════════════════ */}
      <Modal visible={statusModal} transparent animationType="slide" onRequestClose={() => !saving && setStatusModal(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} activeOpacity={1} onPress={() => !saving && setStatusModal(false)} />
        <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 36 }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#e5e7eb', alignSelf: 'center', marginBottom: 20 }} />
          <Text style={{ color: '#111827', fontSize: 18, fontWeight: '800', marginBottom: 4 }}>Cambiar estado</Text>
          <Text style={{ color: '#9ca3af', fontSize: 13, marginBottom: 20 }} numberOfLines={1}>
            {item.nombre_tipo} · {item.localidad_usuario}
          </Text>

          {ESTADOS_OPCIONES.map((op) => {
            const isCurrent  = localEstado === op.key;
            const esRetroceso = ESTADO_ORDER[op.key] < ESTADO_ORDER[localEstado];
            return (
              <TouchableOpacity
                key={op.key}
                onPress={() => handleChangeStatus(op.key)}
                disabled={saving}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 14,
                  padding: 14, borderRadius: 14, marginBottom: 8,
                  backgroundColor: isCurrent ? op.bg : '#f9fafb',
                  borderWidth: isCurrent ? 1.5 : 1,
                  borderColor: isCurrent ? `${op.color}60` : '#f3f4f6',
                  opacity: saving ? 0.5 : esRetroceso ? 0.45 : 1,
                }}
              >
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: op.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: `${op.color}30` }}>
                  <Ionicons name={op.icon} size={20} color={op.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#111827', fontSize: 14, fontWeight: '700' }}>{op.label}</Text>
                  <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 1 }}>
                    {esRetroceso ? 'No se puede retroceder' : op.desc}
                  </Text>
                </View>
                {isCurrent
                  ? <Ionicons name="checkmark-circle" size={20} color={op.color} />
                  : esRetroceso
                  ? <Ionicons name="lock-closed-outline" size={16} color="#d1d5db" />
                  : <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
                }
              </TouchableOpacity>
            );
          })}

          {saving && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
              <ActivityIndicator size="small" color="#2563eb" />
              <Text style={{ color: '#9ca3af', fontSize: 13 }}>Actualizando...</Text>
            </View>
          )}
        </View>
      </Modal>

      {/* ══ Modal confirmación de aceptación ══════════════════════════════ */}
      <Modal visible={showAcceptModal} transparent animationType="fade" onRequestClose={() => setShowAcceptModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
          {(() => {
            const msg = MENSAJE_ACEPTACION[rol];
            if (!msg) return null;
            return (
              <View style={{ backgroundColor: '#ffffff', borderRadius: 24, padding: 28, width: '100%', maxWidth: 340, alignItems: 'center' }}>
                <View style={{ position: 'relative', marginBottom: 20 }}>
                  <View style={{ width: 76, height: 76, borderRadius: 22, backgroundColor: msg.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: msg.border }}>
                    <Ionicons name={msg.icon} size={38} color={msg.color} />
                  </View>
                  <View style={{ position: 'absolute', bottom: -5, right: -5, width: 26, height: 26, borderRadius: 13, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#ffffff' }}>
                    <Ionicons name="checkmark" size={14} color="#16a34a" />
                  </View>
                </View>
                <Text style={{ color: '#111827', fontSize: 19, fontWeight: '800', textAlign: 'center', marginBottom: 10 }}>
                  {msg.title}
                </Text>
                <Text style={{ color: '#6b7280', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 26 }}>
                  {msg.text}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowAcceptModal(false)}
                  style={{ backgroundColor: msg.color, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 44 }}
                >
                  <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 14 }}>Entendido</Text>
                </TouchableOpacity>
              </View>
            );
          })()}
        </View>
      </Modal>

      {/* ══ Modal error retroceso ═══════════════════════════════════════ */}
      <Modal visible={errorModal} transparent animationType="fade" onRequestClose={() => setErrorModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
          <View style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 320, alignItems: 'center' }}>
            <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Ionicons name="lock-closed-outline" size={24} color="#dc2626" />
            </View>
            <Text style={{ color: '#111827', fontSize: 16, fontWeight: '800', textAlign: 'center', marginBottom: 8 }}>
              Acción no permitida
            </Text>
            <Text style={{ color: '#6b7280', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
              Los estados solo pueden avanzar.{'\n'}No es posible retroceder una incidencia una vez que ha progresado.
            </Text>
            <TouchableOpacity
              onPress={() => setErrorModal(false)}
              style={{ backgroundColor: '#dc2626', borderRadius: 12, paddingVertical: 11, paddingHorizontal: 32 }}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

export function ActionBtn({
  icon, label, color, bg, onPress,
}: {
  icon: IoniconsName; label: string; color: string; bg: string; onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
        backgroundColor: bg, alignSelf: 'flex-start',
      }}
    >
      <Ionicons name={icon} size={14} color={color} />
      <Text style={{ color, fontSize: 12, fontWeight: '700' }}>{label}</Text>
    </TouchableOpacity>
  );
}
