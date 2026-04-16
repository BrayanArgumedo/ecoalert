import {
  View, Text, TouchableOpacity, FlatList, TextInput,
  StatusBar, Platform, Modal, ActivityIndicator,
  KeyboardAvoidingView, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useMemo } from 'react';
import { getUsers, getRoles, changeUserRole, toggleUserStatus } from '../../src/core/services/usersService';
import type { Usuario, Rol } from '../../src/core/services/usersService';
import { getRolColor } from '../../src/core/utils/roles';
import { useAuthStore } from '../../src/core/stores/authStore';

export default function UsersScreen() {
  const currentUser = useAuthStore((s) => s.user);

  const [users,    setUsers]    = useState<Usuario[]>([]);
  const [roles,    setRoles]    = useState<Rol[]>([]);
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  // Modal cambiar rol
  const [roleModal,    setRoleModal]    = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [savingRole,   setSavingRole]   = useState(false);

  // Modal confirmar toggle estado
  const [statusModal,  setStatusModal]  = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersData, rolesData] = await Promise.all([getUsers(), getRoles()]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch {
      setError('No se pudo cargar la lista de usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) => u.nombre.toLowerCase().includes(q) || u.correo.toLowerCase().includes(q)
    );
  }, [users, search]);

  const openRoleModal = (user: Usuario) => {
    setSelectedUser(user);
    setRoleModal(true);
  };

  const openStatusModal = (user: Usuario) => {
    setSelectedUser(user);
    setStatusModal(true);
  };

  const handleChangeRole = async (rol: Rol) => {
    if (!selectedUser) return;
    setSavingRole(true);
    try {
      const updated = await changeUserRole(selectedUser.id_usuario, rol.id_rol);
      setUsers((prev) => prev.map((u) => u.id_usuario === updated.id_usuario ? updated : u));
      setRoleModal(false);
    } catch {
      // silently fail — keep modal open
    } finally {
      setSavingRole(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    setSavingStatus(true);
    try {
      const newStatus = selectedUser.estado === 0;
      const updated = await toggleUserStatus(selectedUser.id_usuario, newStatus);
      setUsers((prev) => prev.map((u) => u.id_usuario === updated.id_usuario ? updated : u));
      setStatusModal(false);
    } catch {
      // silently fail
    } finally {
      setSavingStatus(false);
    }
  };

  const initials = (nombre: string) =>
    nombre.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();

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
              Usuarios
            </Text>
          </View>
          <View style={{
            width: 44, height: 44, borderRadius: 14,
            backgroundColor: 'rgba(21,128,61,0.1)',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Ionicons name="people" size={22} color="#15803d" />
          </View>
        </View>

        {/* Buscador */}
        <View style={{
          marginTop: 16, flexDirection: 'row', alignItems: 'center',
          backgroundColor: '#ffffff', borderRadius: 14,
          borderWidth: 1, borderColor: '#e5e7eb',
          paddingHorizontal: 14, paddingVertical: 10,
          shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
        }}>
          <Ionicons name="search-outline" size={18} color="#9ca3af" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por nombre o correo..."
            placeholderTextColor="#9ca3af"
            style={{ flex: 1, marginLeft: 10, fontSize: 14, color: '#111827' }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* ══ Contenido ════════════════════════════════════════════════════ */}
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
          <TouchableOpacity
            onPress={loadData}
            style={{ marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#16a34a', borderRadius: 12 }}
          >
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
                {search ? 'Sin resultados' : 'No hay usuarios'}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const rolColor = getRolColor(item.nombre_rol);
            const isActive = item.estado === 1;
            const isSelf   = item.id_usuario === currentUser?.id;

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
                {/* Borde izquierdo con color de rol */}
                <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: rolColor }} />

                <View style={{ padding: 14, paddingLeft: 18 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    {/* Avatar */}
                    <View style={{
                      width: 46, height: 46, borderRadius: 14,
                      backgroundColor: `${rolColor}15`,
                      borderWidth: 1.5, borderColor: `${rolColor}30`,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ color: rolColor, fontSize: 15, fontWeight: '800' }}>
                        {initials(item.nombre)}
                      </Text>
                    </View>

                    {/* Info */}
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ color: '#111827', fontSize: 15, fontWeight: '700' }} numberOfLines={1}>
                          {item.nombre}
                        </Text>
                        {isSelf && (
                          <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, backgroundColor: '#f0fdf4' }}>
                            <Text style={{ color: '#16a34a', fontSize: 10, fontWeight: '700' }}>Tú</Text>
                          </View>
                        )}
                      </View>
                      <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 1 }} numberOfLines={1}>
                        {item.correo}
                      </Text>

                      {/* Badges */}
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                        <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: `${rolColor}12` }}>
                          <Text style={{ color: rolColor, fontSize: 11, fontWeight: '700' }}>{item.nombre_rol}</Text>
                        </View>
                        <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: isActive ? '#f0fdf4' : '#fef2f2' }}>
                          <Text style={{ color: isActive ? '#16a34a' : '#dc2626', fontSize: 11, fontWeight: '700' }}>
                            {isActive ? 'Activo' : 'Inactivo'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Acciones — no se muestran sobre uno mismo */}
                  {!isSelf && (
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                      <TouchableOpacity
                        onPress={() => openRoleModal(item)}
                        style={{
                          flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                          gap: 6, paddingVertical: 8, borderRadius: 10,
                          backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#dbeafe',
                        }}
                      >
                        <Ionicons name="shield-outline" size={14} color="#2563eb" />
                        <Text style={{ color: '#2563eb', fontSize: 12, fontWeight: '700' }}>Cambiar rol</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => openStatusModal(item)}
                        style={{
                          flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                          gap: 6, paddingVertical: 8, borderRadius: 10,
                          backgroundColor: isActive ? '#fef2f2' : '#f0fdf4',
                          borderWidth: 1, borderColor: isActive ? '#fecaca' : '#bbf7d0',
                        }}
                      >
                        <Ionicons
                          name={isActive ? 'lock-closed-outline' : 'lock-open-outline'}
                          size={14}
                          color={isActive ? '#dc2626' : '#16a34a'}
                        />
                        <Text style={{ color: isActive ? '#dc2626' : '#16a34a', fontSize: 12, fontWeight: '700' }}>
                          {isActive ? 'Desactivar' : 'Activar'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}

      {/* ══ Modal — Cambiar rol ══════════════════════════════════════════ */}
      <Modal visible={roleModal} transparent animationType="slide" onRequestClose={() => setRoleModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
            activeOpacity={1}
            onPress={() => !savingRole && setRoleModal(false)}
          />
          <View style={{
            backgroundColor: '#ffffff',
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            paddingHorizontal: 20, paddingTop: 20, paddingBottom: 36,
          }}>
            {/* Handle */}
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#e5e7eb', alignSelf: 'center', marginBottom: 20 }} />

            <Text style={{ color: '#111827', fontSize: 18, fontWeight: '800', marginBottom: 4 }}>
              Cambiar rol
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: 13, marginBottom: 20 }}>
              {selectedUser?.nombre}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {roles.map((rol) => {
                const rolColor   = getRolColor(rol.nombre_rol);
                const isCurrent  = selectedUser?.id_rol === rol.id_rol;
                return (
                  <TouchableOpacity
                    key={rol.id_rol}
                    onPress={() => !savingRole && handleChangeRole(rol)}
                    disabled={isCurrent || savingRole}
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 14,
                      padding: 14, borderRadius: 14, marginBottom: 8,
                      backgroundColor: isCurrent ? `${rolColor}10` : '#f9fafb',
                      borderWidth: isCurrent ? 1.5 : 1,
                      borderColor: isCurrent ? `${rolColor}40` : '#f3f4f6',
                      opacity: savingRole ? 0.5 : 1,
                    }}
                  >
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${rolColor}15`, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="shield-half-outline" size={20} color={rolColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#111827', fontSize: 14, fontWeight: '700' }}>{rol.nombre_rol}</Text>
                      {rol.descripcion && (
                        <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 1 }}>{rol.descripcion}</Text>
                      )}
                    </View>
                    {isCurrent ? (
                      <Ionicons name="checkmark-circle" size={20} color={rolColor} />
                    ) : (
                      <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {savingRole && (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                <ActivityIndicator size="small" color="#16a34a" />
                <Text style={{ color: '#9ca3af', fontSize: 13 }}>Guardando...</Text>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ══ Modal — Confirmar toggle estado ══════════════════════════════ */}
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
                    {isActive
                      ? `¿Desactivar a ${selectedUser?.nombre}? No podrá iniciar sesión.`
                      : `¿Activar a ${selectedUser?.nombre}? Recuperará acceso al sistema.`}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                      onPress={() => setStatusModal(false)}
                      disabled={savingStatus}
                      style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center' }}
                    >
                      <Text style={{ color: '#374151', fontWeight: '700' }}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleToggleStatus}
                      disabled={savingStatus}
                      style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: accentCol, alignItems: 'center' }}
                    >
                      {savingStatus
                        ? <ActivityIndicator size="small" color="#fff" />
                        : <Text style={{ color: '#fff', fontWeight: '700' }}>{isActive ? 'Desactivar' : 'Activar'}</Text>
                      }
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
