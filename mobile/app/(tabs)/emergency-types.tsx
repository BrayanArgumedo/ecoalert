import {
  View, Text, TouchableOpacity, FlatList, TextInput,
  StatusBar, Platform, Modal, ActivityIndicator,
  KeyboardAvoidingView, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  getEmergencyTypes, createEmergencyType, updateEmergencyType, deleteEmergencyType,
} from '../../src/core/services/emergencyTypesService';
import type { TipoEmergencia } from '../../src/core/services/emergencyTypesService';

type IoniconsName = keyof typeof Ionicons.glyphMap;

// Mapeo de icono (string del backend) → Ionicons + color
const TYPE_ICON_MAP: Record<string, { icon: IoniconsName; color: string }> = {
  earthquake:  { icon: 'pulse-outline',          color: '#d97706' },
  flood:       { icon: 'water-outline',           color: '#2563eb' },
  landslide:   { icon: 'trending-down-outline',   color: '#92400e' },
  slide:       { icon: 'trending-down-outline',   color: '#92400e' },
  hurricane:   { icon: 'thunderstorm-outline',    color: '#7c3aed' },
  fire:        { icon: 'flame-outline',           color: '#dc2626' },
  storm:       { icon: 'thunderstorm-outline',    color: '#4f46e5' },
  pollution:   { icon: 'cloud-outline',           color: '#15803d' },
};

const FALLBACK_COLORS = [
  '#dc2626', '#d97706', '#2563eb', '#7c3aed', '#15803d',
  '#db2777', '#0891b2', '#9333ea', '#16a34a', '#ea580c',
];

const getTypeStyle = (tipo: TipoEmergencia, index: number): { icon: IoniconsName; color: string } => {
  if (tipo.icono && TYPE_ICON_MAP[tipo.icono]) {
    return TYPE_ICON_MAP[tipo.icono];
  }
  return {
    icon: 'warning-outline',
    color: FALLBACK_COLORS[index % FALLBACK_COLORS.length],
  };
};

export default function EmergencyTypesScreen() {
  const [types,   setTypes]   = useState<TipoEmergencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // Modal crear/editar
  const [formModal,   setFormModal]   = useState(false);
  const [editing,     setEditing]     = useState<TipoEmergencia | null>(null);
  const [formNombre,  setFormNombre]  = useState('');
  const [formDesc,    setFormDesc]    = useState('');
  const [formError,   setFormError]   = useState<string | null>(null);
  const [saving,      setSaving]      = useState(false);

  // Modal eliminar
  const [deleteModal,  setDeleteModal]  = useState(false);
  const [deleting,     setDeleting]     = useState(false);
  const [targetDelete, setTargetDelete] = useState<TipoEmergencia | null>(null);

  const loadTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEmergencyTypes();
      setTypes(data);
    } catch {
      setError('No se pudo cargar los tipos de emergencia');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTypes(); }, []);

  const openCreate = () => {
    setEditing(null);
    setFormNombre('');
    setFormDesc('');
    setFormError(null);
    setFormModal(true);
  };

  const openEdit = (tipo: TipoEmergencia) => {
    setEditing(tipo);
    setFormNombre(tipo.nombre);
    setFormDesc(tipo.descripcion ?? '');
    setFormError(null);
    setFormModal(true);
  };

  const handleSave = async () => {
    if (!formNombre.trim()) {
      setFormError('El nombre es obligatorio');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        const updated = await updateEmergencyType(editing.id_tipo, {
          nombre: formNombre.trim(),
          descripcion: formDesc.trim() || undefined,
        });
        setTypes((prev) => prev.map((t) => t.id_tipo === updated.id_tipo ? updated : t));
      } else {
        const created = await createEmergencyType({
          nombre: formNombre.trim(),
          descripcion: formDesc.trim() || undefined,
        });
        setTypes((prev) => [...prev, created]);
      }
      setFormModal(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Error al guardar';
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const openDelete = (tipo: TipoEmergencia) => {
    setTargetDelete(tipo);
    setDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!targetDelete) return;
    setDeleting(true);
    try {
      await deleteEmergencyType(targetDelete.id_tipo);
      setTypes((prev) => prev.filter((t) => t.id_tipo !== targetDelete.id_tipo));
      setDeleteModal(false);
    } catch {
      // silently fail
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8faf9' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#dcfce7" />

      {/* ══ Header ══════════════════════════════════════════════════════ */}
      <LinearGradient
        colors={['#dcfce7', '#f0fdf4', '#ffffff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: Platform.OS === 'ios' ? 56 : 48,
          paddingHorizontal: 20,
          paddingBottom: 20,
          overflow: 'hidden',
        }}
      >
        <View style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(34,197,94,0.12)' }} />
        <View style={{ position: 'absolute', top: 40, left: -15, width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(134,239,172,0.2)' }} />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: '#15803d', fontSize: 13, fontWeight: '600', marginBottom: 2 }}>
              Administración
            </Text>
            <Text style={{ color: '#111827', fontSize: 24, fontWeight: '800' }}>
              Tipos de Emergencia
            </Text>
          </View>
          <TouchableOpacity
            onPress={openCreate}
            style={{
              width: 44, height: 44, borderRadius: 14,
              backgroundColor: '#16a34a',
              alignItems: 'center', justifyContent: 'center',
              shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
            }}
          >
            <Ionicons name="add" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* ══ Contenido ════════════════════════════════════════════════════ */}
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={{ color: '#9ca3af', marginTop: 12, fontSize: 14 }}>Cargando tipos...</Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Ionicons name="alert-circle-outline" size={28} color="#dc2626" />
          </View>
          <Text style={{ color: '#111827', fontSize: 16, fontWeight: '700', textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity
            onPress={loadTypes}
            style={{ marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#16a34a', borderRadius: 12 }}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={types}
          keyExtractor={(item) => item.id_tipo}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={{ color: '#9ca3af', fontSize: 12, fontWeight: '600', marginBottom: 4 }}>
              {types.length} {types.length === 1 ? 'tipo registrado' : 'tipos registrados'}
            </Text>
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 56 }}>
              <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Ionicons name="list-outline" size={30} color="#86efac" />
              </View>
              <Text style={{ color: '#6b7280', fontSize: 15, fontWeight: '600', marginBottom: 4 }}>
                Sin tipos registrados
              </Text>
              <TouchableOpacity onPress={openCreate}>
                <Text style={{ color: '#16a34a', fontSize: 13, fontWeight: '700' }}>+ Crear el primero</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item, index }) => {
            const { icon, color } = getTypeStyle(item, index);
            return (
              <View style={{
                backgroundColor: '#ffffff',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#f0f0f0',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
                overflow: 'hidden',
              }}>
                {/* Borde izquierdo */}
                <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: color }} />

                <View style={{ padding: 14, paddingLeft: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  {/* Ícono */}
                  <View style={{
                    width: 48, height: 48, borderRadius: 14,
                    backgroundColor: `${color}15`,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Ionicons name={icon} size={22} color={color} />
                  </View>

                  {/* Info */}
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#111827', fontSize: 15, fontWeight: '700' }}>{item.nombre}</Text>
                    {item.descripcion ? (
                      <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 2, lineHeight: 16 }} numberOfLines={2}>
                        {item.descripcion}
                      </Text>
                    ) : (
                      <Text style={{ color: '#d1d5db', fontSize: 12, marginTop: 2, fontStyle: 'italic' }}>
                        Sin descripción
                      </Text>
                    )}
                  </View>

                  {/* Botones */}
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity
                      onPress={() => openEdit(item)}
                      style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Ionicons name="pencil-outline" size={16} color="#2563eb" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => openDelete(item)}
                      style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Ionicons name="trash-outline" size={16} color="#dc2626" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* ══ Modal — Crear / Editar ══════════════════════════════════════ */}
      <Modal visible={formModal} transparent animationType="slide" onRequestClose={() => !saving && setFormModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
            activeOpacity={1}
            onPress={() => !saving && setFormModal(false)}
          />
          <View style={{
            backgroundColor: '#ffffff',
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            paddingHorizontal: 20, paddingTop: 20, paddingBottom: 36,
          }}>
            {/* Handle */}
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#e5e7eb', alignSelf: 'center', marginBottom: 20 }} />

            <Text style={{ color: '#111827', fontSize: 18, fontWeight: '800', marginBottom: 20 }}>
              {editing ? 'Editar tipo' : 'Nuevo tipo de emergencia'}
            </Text>

            {/* Campo nombre */}
            <Text style={{ color: '#374151', fontSize: 13, fontWeight: '600', marginBottom: 6 }}>
              Nombre <Text style={{ color: '#dc2626' }}>*</Text>
            </Text>
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: '#f9fafb', borderRadius: 12,
              borderWidth: 1, borderColor: formError && !formNombre.trim() ? '#fca5a5' : '#e5e7eb',
              paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14,
            }}>
              <Ionicons name="warning-outline" size={18} color="#9ca3af" />
              <TextInput
                value={formNombre}
                onChangeText={(v) => { setFormNombre(v); setFormError(null); }}
                placeholder="Ej. Incendio Forestal"
                placeholderTextColor="#9ca3af"
                style={{ flex: 1, marginLeft: 10, fontSize: 14, color: '#111827' }}
              />
            </View>

            {/* Campo descripción */}
            <Text style={{ color: '#374151', fontSize: 13, fontWeight: '600', marginBottom: 6 }}>
              Descripción <Text style={{ color: '#9ca3af' }}>(opcional)</Text>
            </Text>
            <View style={{
              backgroundColor: '#f9fafb', borderRadius: 12,
              borderWidth: 1, borderColor: '#e5e7eb',
              paddingHorizontal: 14, paddingTop: 12, paddingBottom: 12, marginBottom: 20,
            }}>
              <TextInput
                value={formDesc}
                onChangeText={setFormDesc}
                placeholder="Breve descripción del tipo de emergencia..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                style={{ fontSize: 14, color: '#111827', textAlignVertical: 'top', minHeight: 64 }}
              />
            </View>

            {/* Error */}
            {formError && (
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 8,
                backgroundColor: '#fef2f2', borderRadius: 10,
                borderWidth: 1, borderColor: '#fecaca',
                padding: 12, marginBottom: 16,
              }}>
                <Ionicons name="alert-circle-outline" size={16} color="#dc2626" />
                <Text style={{ color: '#dc2626', fontSize: 13, flex: 1 }}>{formError}</Text>
              </View>
            )}

            {/* Botones */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => setFormModal(false)}
                disabled={saving}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center' }}
              >
                <Text style={{ color: '#374151', fontWeight: '700' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                style={{
                  flex: 1, paddingVertical: 14, borderRadius: 12,
                  backgroundColor: '#16a34a', alignItems: 'center',
                  shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
                }}
              >
                {saving
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={{ color: '#fff', fontWeight: '700' }}>{editing ? 'Guardar' : 'Crear'}</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ══ Modal — Confirmar eliminación ═══════════════════════════════ */}
      <Modal visible={deleteModal} transparent animationType="fade" onRequestClose={() => !deleting && setDeleteModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 360 }}>
            <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center', marginBottom: 16, alignSelf: 'center' }}>
              <Ionicons name="trash-outline" size={26} color="#dc2626" />
            </View>
            <Text style={{ color: '#111827', fontSize: 17, fontWeight: '800', textAlign: 'center', marginBottom: 8 }}>
              Eliminar tipo
            </Text>
            <Text style={{ color: '#6b7280', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
              ¿Eliminar <Text style={{ fontWeight: '700', color: '#111827' }}>{targetDelete?.nombre}</Text>? Esta acción no se puede deshacer.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => setDeleteModal(false)}
                disabled={deleting}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center' }}
              >
                <Text style={{ color: '#374151', fontWeight: '700' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                disabled={deleting}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#dc2626', alignItems: 'center' }}
              >
                {deleting
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={{ color: '#fff', fontWeight: '700' }}>Eliminar</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
