// app/(tabs)/users.tsx
// Pantalla de gestión de usuarios (solo Admin). Permite buscar, filtrar
// por rol, cambiar el rol de un usuario y activar/desactivar cuentas.
// Toda la lógica vive en useUsers.

import { useState } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, TextInput,
  StatusBar, Platform, Modal, ActivityIndicator,
  KeyboardAvoidingView, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getRolColor } from '../../src/core/utils/roles';
import { useAuthStore } from '../../src/core/stores/authStore';
import { useUsers } from '../../src/features/admin/hooks/useUsers';
import UserCard from '../../src/features/admin/components/UserCard';

export default function UsersScreen() {
  const currentUser = useAuthStore((s) => s.user);
  const [rolModal, setRolModal] = useState(false);
  const {
    filtered, roles, search, setSearch, filtroRol, setFiltroRol, loading, error, loadData,
    roleModal, setRoleModal, selectedUser, savingRole, openRoleModal, handleChangeRole,
    roleError, setRoleError,
    statusModal, setStatusModal, savingStatus, openStatusModal, handleToggleStatus,
  } = useUsers();

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
            <Text style={{ color: '#111827', fontSize: 24, fontWeight: '800' }}>Usuarios</Text>
          </View>
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(21,128,61,0.1)', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="people" size={22} color="#15803d" />
          </View>
        </View>

        <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 14, paddingVertical: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}>
          <Ionicons name="search-outline" size={18} color="#9ca3af" />
          <TextInput value={search} onChangeText={setSearch} placeholder="Buscar por nombre o correo..." placeholderTextColor="#9ca3af" style={{ flex: 1, marginLeft: 10, fontSize: 14, color: '#111827' }} />
          {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color="#9ca3af" /></TouchableOpacity>}
        </View>
      </LinearGradient>

      {/* ══ Botón filtro por rol ════════════════════════════════════ */}
      {!loading && !error && (
        <View style={{ paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
          <TouchableOpacity
            onPress={() => setRolModal(true)}
            activeOpacity={0.75}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, backgroundColor: filtroRol ? `${getRolColor(filtroRol)}12` : '#f9fafb', borderColor: filtroRol ? `${getRolColor(filtroRol)}50` : '#e5e7eb' }}
          >
            <Ionicons name="shield-half-outline" size={15} color={filtroRol ? getRolColor(filtroRol) : '#6b7280'} />
            <Text style={{ color: filtroRol ? getRolColor(filtroRol) : '#6b7280', fontWeight: '700', fontSize: 13 }}>
              {filtroRol || 'Todos los roles'}
            </Text>
            <Ionicons name="chevron-down" size={14} color={filtroRol ? getRolColor(filtroRol) : '#9ca3af'} />
          </TouchableOpacity>
        </View>
      )}

      {/* ══ Contenido ════════════════════════════════════════════════ */}
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={{ color: '#9ca3af', marginTop: 12, fontSize: 14 }}>Cargando usuarios...</Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Ionicons name="alert-circle-outline" size={28} color="#dc2626" />
          </View>
          <Text style={{ color: '#111827', fontSize: 16, fontWeight: '700', textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity onPress={loadData} style={{ marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#16a34a', borderRadius: 12 }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id_usuario}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={{ color: '#9ca3af', fontSize: 12, fontWeight: '600', marginBottom: 4 }}>
              {filtered.length} {filtered.length === 1 ? 'usuario' : 'usuarios'}
            </Text>
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
              <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Ionicons name="people-outline" size={30} color="#86efac" />
              </View>
              <Text style={{ color: '#6b7280', fontSize: 15, fontWeight: '600' }}>
                {search || filtroRol ? 'Sin resultados para ese filtro' : 'No hay usuarios'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <UserCard
              item={item}
              currentUserId={currentUser?.id ?? ''}
              onChangeRole={openRoleModal}
              onToggleStatus={openStatusModal}
            />
          )}
        />
      )}

      {/* ══ Modal — Cambiar rol ══════════════════════════════════════ */}
      <Modal visible={roleModal} transparent animationType="slide" onRequestClose={() => setRoleModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} activeOpacity={1} onPress={() => !savingRole && setRoleModal(false)} />
          <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 36 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#e5e7eb', alignSelf: 'center', marginBottom: 20 }} />
            <Text style={{ color: '#111827', fontSize: 18, fontWeight: '800', marginBottom: 4 }}>Cambiar rol</Text>
            <Text style={{ color: '#9ca3af', fontSize: 13, marginBottom: 20 }}>{selectedUser?.nombre}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {roles.map((rol) => {
                const rolColor  = getRolColor(rol.nombre_rol);
                const isCurrent = selectedUser?.id_rol === rol.id_rol;
                return (
                  <TouchableOpacity key={rol.id_rol} onPress={() => !savingRole && handleChangeRole(rol)} disabled={isCurrent || savingRole}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 14, marginBottom: 8, backgroundColor: isCurrent ? `${rolColor}10` : '#f9fafb', borderWidth: isCurrent ? 1.5 : 1, borderColor: isCurrent ? `${rolColor}40` : '#f3f4f6', opacity: savingRole ? 0.5 : 1 }}
                  >
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${rolColor}15`, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="shield-half-outline" size={20} color={rolColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#111827', fontSize: 14, fontWeight: '700' }}>{rol.nombre_rol}</Text>
                      {rol.descripcion && <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 1 }}>{rol.descripcion}</Text>}
                    </View>
                    {isCurrent ? <Ionicons name="checkmark-circle" size={20} color={rolColor} /> : <Ionicons name="chevron-forward" size={16} color="#d1d5db" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {savingRole && <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}><ActivityIndicator size="small" color="#16a34a" /><Text style={{ color: '#9ca3af', fontSize: 13 }}>Guardando...</Text></View>}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ══ Modal — Error cambio de rol ══════════════════════════════ */}
      <Modal visible={!!roleError} transparent animationType="fade" onRequestClose={() => setRoleError(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
          <View style={{ backgroundColor: '#ffffff', borderRadius: 24, padding: 28, width: '100%', maxWidth: 340, alignItems: 'center' }}>
            {/* Icono */}
            <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Ionicons name="warning-outline" size={30} color="#d97706" />
            </View>

            <Text style={{ color: '#111827', fontSize: 17, fontWeight: '800', textAlign: 'center', marginBottom: 8 }}>
              Cambio no permitido
            </Text>

            <Text style={{ color: '#6b7280', fontSize: 14, textAlign: 'center', lineHeight: 21, marginBottom: 24 }}>
              {roleError}
            </Text>

            {/* Separador */}
            <View style={{ width: '100%', height: 1, backgroundColor: '#f3f4f6', marginBottom: 16 }} />

            <TouchableOpacity
              onPress={() => setRoleError(null)}
              activeOpacity={0.85}
              style={{ width: '100%', paddingVertical: 13, borderRadius: 14, backgroundColor: '#d97706', alignItems: 'center' }}
            >
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 15 }}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ══ Modal — Filtro por rol ══════════════════════════════════ */}
      <Modal visible={rolModal} transparent animationType="fade" onRequestClose={() => setRolModal(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 }} activeOpacity={1} onPress={() => setRolModal(false)}>
          <TouchableOpacity activeOpacity={1} style={{ backgroundColor: '#ffffff', borderRadius: 24, padding: 24, width: '100%', maxWidth: 360 }}>
            <Text style={{ color: '#111827', fontSize: 17, fontWeight: '800', marginBottom: 4 }}>Filtrar por rol</Text>
            <Text style={{ color: '#9ca3af', fontSize: 13, marginBottom: 16 }}>Selecciona un rol</Text>

            {[{ nombre_rol: '', label: 'Todos los roles' }, ...roles.map((r) => ({ nombre_rol: r.nombre_rol, label: r.nombre_rol }))].map((op) => {
              const activo = filtroRol === op.nombre_rol;
              const color  = op.nombre_rol ? getRolColor(op.nombre_rol) : '#6b7280';
              return (
                <TouchableOpacity
                  key={op.nombre_rol || 'todos'}
                  onPress={() => { setFiltroRol(op.nombre_rol); setRolModal(false); }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 14, marginBottom: 8, backgroundColor: activo ? `${color}10` : '#f9fafb', borderWidth: activo ? 1.5 : 1, borderColor: activo ? `${color}40` : '#f3f4f6' }}
                >
                  <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${color}15`, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="shield-half-outline" size={20} color={color} />
                  </View>
                  <Text style={{ color: '#111827', fontSize: 14, fontWeight: '700', flex: 1 }}>{op.label}</Text>
                  {activo && <Ionicons name="checkmark-circle" size={20} color={color} />}
                </TouchableOpacity>
              );
            })}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ══ Modal — Confirmar toggle estado ══════════════════════════ */}
      <Modal visible={statusModal} transparent animationType="fade" onRequestClose={() => setStatusModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 360 }}>
            {(() => {
              const isActive  = selectedUser?.estado === 1;
              const accentCol = isActive ? '#dc2626' : '#16a34a';
              const bgCol     = isActive ? '#fee2e2' : '#dcfce7';
              return (
                <>
                  <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: bgCol, alignItems: 'center', justifyContent: 'center', marginBottom: 16, alignSelf: 'center' }}>
                    <Ionicons name={isActive ? 'lock-closed-outline' : 'lock-open-outline'} size={26} color={accentCol} />
                  </View>
                  <Text style={{ color: '#111827', fontSize: 17, fontWeight: '800', textAlign: 'center', marginBottom: 8 }}>
                    {isActive ? 'Desactivar usuario' : 'Activar usuario'}
                  </Text>
                  <Text style={{ color: '#6b7280', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
                    {isActive ? `¿Desactivar a ${selectedUser?.nombre}? No podrá iniciar sesión.` : `¿Activar a ${selectedUser?.nombre}? Recuperará acceso al sistema.`}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity onPress={() => setStatusModal(false)} disabled={savingStatus} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center' }}>
                      <Text style={{ color: '#374151', fontWeight: '700' }}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleToggleStatus} disabled={savingStatus} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: accentCol, alignItems: 'center' }}>
                      {savingStatus ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>{isActive ? 'Desactivar' : 'Activar'}</Text>}
                    </TouchableOpacity>
                  </View>
                </>
              );
            })()}
          </View>
        </View>
      </Modal>
    </View>
  );
}
