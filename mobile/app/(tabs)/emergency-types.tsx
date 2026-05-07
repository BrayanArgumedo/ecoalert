import {
  View, Text, TouchableOpacity, FlatList, TextInput,
  StatusBar, Platform, Modal, ActivityIndicator,
  KeyboardAvoidingView, ScrollView, Dimensions,
} from 'react-native';

// paddingHorizontal 20 en modal + paddingHorizontal 20 en ScrollView = 40 total
// 3 gaps de 8px entre 4 columnas = 24px
const ICON_SIZE = Math.floor((Dimensions.get('window').width - 40 - 24) / 4);
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useEmergencyTypes } from '../../src/features/admin/hooks/useEmergencyTypes';
import EmergencyTypeCard, { EMERGENCY_ICONS } from '../../src/features/admin/components/EmergencyTypeCard';

type IoniconsName = keyof typeof Ionicons.glyphMap;

export default function EmergencyTypesScreen() {
  const {
    types, loading, error, loadTypes,
    formModal, setFormModal, editing, formNombre, setFormNombre,
    formDesc, setFormDesc, formIcono, setFormIcono, formError, setFormError, saving,
    openCreate, openEdit, handleSave,
    deleteModal, setDeleteModal, deleting, targetDelete, openDelete, handleDelete,
  } = useEmergencyTypes();

  const selectedIcon = EMERGENCY_ICONS.find((ic) => ic.key === formIcono);

  return (
    <View style={{ flex: 1, backgroundColor: '#f8faf9' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#dcfce7" />

      {/* ══ Header ══════════════════════════════════════════════════ */}
      <LinearGradient
        colors={['#dcfce7', '#f0fdf4', '#ffffff']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ paddingTop: Platform.OS === 'ios' ? 56 : 48, paddingHorizontal: 20, paddingBottom: 20, overflow: 'hidden' }}
      >
        <View style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(34,197,94,0.12)' }} />
        <View style={{ position: 'absolute', top: 40, left: -15, width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(134,239,172,0.2)' }} />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: '#15803d', fontSize: 13, fontWeight: '600', marginBottom: 2 }}>Administración</Text>
            <Text style={{ color: '#111827', fontSize: 24, fontWeight: '800' }}>Tipos de Emergencia</Text>
          </View>
          <TouchableOpacity onPress={openCreate} style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center', shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}>
            <Ionicons name="add" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* ══ Contenido ════════════════════════════════════════════════ */}
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
          <TouchableOpacity onPress={loadTypes} style={{ marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#16a34a', borderRadius: 12 }}>
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
              <Text style={{ color: '#6b7280', fontSize: 15, fontWeight: '600', marginBottom: 4 }}>Sin tipos registrados</Text>
              <TouchableOpacity onPress={openCreate}>
                <Text style={{ color: '#16a34a', fontSize: 13, fontWeight: '700' }}>+ Crear el primero</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item, index }) => (
            <EmergencyTypeCard item={item} index={index} onEdit={openEdit} onDelete={openDelete} />
          )}
        />
      )}

      {/* ══ Modal — Crear / Editar ══════════════════════════════════ */}
      <Modal visible={formModal} transparent animationType="slide" onRequestClose={() => !saving && setFormModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} activeOpacity={1} onPress={() => !saving && setFormModal(false)} />
          <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 20, paddingBottom: 36, maxHeight: '88%' }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#e5e7eb', alignSelf: 'center', marginBottom: 20 }} />
            <Text style={{ color: '#111827', fontSize: 18, fontWeight: '800', marginBottom: 20, paddingHorizontal: 20 }}>
              {editing ? 'Editar tipo' : 'Nuevo tipo de emergencia'}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8 }}>

              {/* Nombre */}
              <Text style={{ color: '#374151', fontSize: 13, fontWeight: '600', marginBottom: 6 }}>Nombre <Text style={{ color: '#dc2626' }}>*</Text></Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: formError && !formNombre.trim() ? '#fca5a5' : '#e5e7eb', paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14 }}>
                <Ionicons name="warning-outline" size={18} color="#9ca3af" />
                <TextInput value={formNombre} onChangeText={(v) => { setFormNombre(v); setFormError(null); }} placeholder="Ej. Incendio Forestal" placeholderTextColor="#9ca3af" style={{ flex: 1, marginLeft: 10, fontSize: 14, color: '#111827' }} />
              </View>

              {/* Descripción */}
              <Text style={{ color: '#374151', fontSize: 13, fontWeight: '600', marginBottom: 6 }}>Descripción <Text style={{ color: '#9ca3af' }}>(opcional)</Text></Text>
              <View style={{ backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 14, paddingTop: 12, paddingBottom: 12, marginBottom: 20 }}>
                <TextInput value={formDesc} onChangeText={setFormDesc} placeholder="Breve descripción del tipo de emergencia..." placeholderTextColor="#9ca3af" multiline numberOfLines={3} style={{ fontSize: 14, color: '#111827', textAlignVertical: 'top', minHeight: 64 }} />
              </View>

              {/* Selector de ícono */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Text style={{ color: '#374151', fontSize: 13, fontWeight: '600' }}>Ícono</Text>
                <Text style={{ color: '#9ca3af', fontSize: 13 }}>(opcional)</Text>
                {selectedIcon && (
                  <View style={{ marginLeft: 'auto' as any, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: `${selectedIcon.color}18`, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8 }}>
                    <Ionicons name={selectedIcon.key} size={13} color={selectedIcon.color} />
                    <Text style={{ color: selectedIcon.color, fontSize: 11, fontWeight: '700' }}>{selectedIcon.label}</Text>
                  </View>
                )}
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {/* Opción: sin ícono */}
                <TouchableOpacity
                  onPress={() => setFormIcono('')}
                  style={{
                    width: ICON_SIZE, height: ICON_SIZE, borderRadius: 14,
                    backgroundColor: !formIcono ? '#f0fdf4' : '#f9fafb',
                    borderWidth: !formIcono ? 2 : 1,
                    borderColor: !formIcono ? '#16a34a' : '#e5e7eb',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Ionicons name="ban-outline" size={20} color={!formIcono ? '#16a34a' : '#d1d5db'} />
                  <Text style={{ fontSize: 9, color: !formIcono ? '#16a34a' : '#9ca3af', marginTop: 4, textAlign: 'center' }}>Ninguno</Text>
                </TouchableOpacity>

                {EMERGENCY_ICONS.map((ic) => {
                  const sel = formIcono === ic.key;
                  return (
                    <TouchableOpacity
                      key={ic.key}
                      onPress={() => setFormIcono(ic.key)}
                      style={{
                        width: ICON_SIZE, height: ICON_SIZE, borderRadius: 14,
                        backgroundColor: sel ? `${ic.color}18` : '#f9fafb',
                        borderWidth: sel ? 2 : 1,
                        borderColor: sel ? ic.color : '#e5e7eb',
                        alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Ionicons name={ic.key} size={22} color={sel ? ic.color : '#9ca3af'} />
                      <Text style={{ fontSize: 9, color: sel ? ic.color : '#9ca3af', marginTop: 4, textAlign: 'center' }}>{ic.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

            </ScrollView>

            {/* Error + botones (fuera del scroll, siempre visibles) */}
            <View style={{ paddingHorizontal: 20 }}>
              {formError && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fef2f2', borderRadius: 10, borderWidth: 1, borderColor: '#fecaca', padding: 12, marginBottom: 16 }}>
                  <Ionicons name="alert-circle-outline" size={16} color="#dc2626" />
                  <Text style={{ color: '#dc2626', fontSize: 13, flex: 1 }}>{formError}</Text>
                </View>
              )}

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity onPress={() => setFormModal(false)} disabled={saving} style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center' }}>
                  <Text style={{ color: '#374151', fontWeight: '700' }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} disabled={saving} style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#16a34a', alignItems: 'center', shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}>
                  {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>{editing ? 'Guardar' : 'Crear'}</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ══ Modal — Confirmar eliminación ════════════════════════════ */}
      <Modal visible={deleteModal} transparent animationType="fade" onRequestClose={() => !deleting && setDeleteModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 360 }}>
            <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center', marginBottom: 16, alignSelf: 'center' }}>
              <Ionicons name="trash-outline" size={26} color="#dc2626" />
            </View>
            <Text style={{ color: '#111827', fontSize: 17, fontWeight: '800', textAlign: 'center', marginBottom: 8 }}>Eliminar tipo</Text>
            <Text style={{ color: '#6b7280', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
              ¿Eliminar <Text style={{ fontWeight: '700', color: '#111827' }}>{targetDelete?.nombre}</Text>? Esta acción no se puede deshacer.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => setDeleteModal(false)} disabled={deleting} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center' }}>
                <Text style={{ color: '#374151', fontWeight: '700' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} disabled={deleting} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#dc2626', alignItems: 'center' }}>
                {deleting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>Eliminar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
