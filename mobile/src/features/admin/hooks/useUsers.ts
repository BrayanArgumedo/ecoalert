import { useState, useCallback, useMemo, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { getUsers, getRoles, changeUserRole, toggleUserStatus } from '../../../core/services/usersService';
import { useAuthStore } from '../.././../core/stores/authStore';
import type { Usuario, Rol } from '../../../core/services/usersService';

export function useUsers() {
  const authUser = useAuthStore((s) => s.user);

  const [users,     setUsers]     = useState<Usuario[]>([]);
  const [roles,     setRoles]     = useState<Rol[]>([]);
  const [search,    setSearch]    = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  // Modal cambiar rol
  const [roleModal,    setRoleModal]    = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [savingRole,   setSavingRole]   = useState(false);
  const [roleError,    setRoleError]    = useState<string | null>(null);

  // Modal toggle estado
  const [statusModal,  setStatusModal]  = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  const yaInicio = useRef(false);

  const loadData = useCallback(async (mostrarLoading: boolean) => {
    if (mostrarLoading) setLoading(true);
    setError(null);
    try {
      const [usersData, rolesData] = await Promise.all([getUsers(), getRoles()]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch {
      if (mostrarLoading) setError('No se pudo cargar la lista de usuarios');
    } finally {
      if (mostrarLoading) setLoading(false);
    }
  }, []);

  // Primera carga con spinner; siguientes enfocados: recarga silenciosa
  useFocusEffect(useCallback(() => {
    const esPrimera = !yaInicio.current;
    yaInicio.current = true;
    loadData(esPrimera);
  }, [loadData]));

  // Sincronizar avatar del usuario propio en la lista sin refetch
  const usersConAvatarActualizado = useMemo(() => {
    if (!authUser) return users;
    return users.map((u) =>
      u.id_usuario === authUser.id
        ? { ...u, avatar_seed: authUser.avatar_seed }
        : u
    );
  }, [users, authUser?.avatar_seed]);

  const filtered = useMemo(() => {
    let lista = usersConAvatarActualizado;
    if (filtroRol) lista = lista.filter((u) => u.nombre_rol === filtroRol);
    if (search.trim()) {
      const q = search.toLowerCase();
      lista = lista.filter(
        (u) => u.nombre.toLowerCase().includes(q) || u.correo.toLowerCase().includes(q)
      );
    }
    return lista;
  }, [usersConAvatarActualizado, search, filtroRol]);

  const openRoleModal   = (user: Usuario) => { setSelectedUser(user); setRoleModal(true); };
  const openStatusModal = (user: Usuario) => { setSelectedUser(user); setStatusModal(true); };

  const handleChangeRole = async (rol: Rol) => {
    if (!selectedUser) return;
    setSavingRole(true);
    try {
      const updated = await changeUserRole(selectedUser.id_usuario, rol.id_rol);
      setUsers((prev) => prev.map((u) => u.id_usuario === updated.id_usuario ? updated : u));
      setRoleModal(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'No se pudo cambiar el rol. Intenta de nuevo.';
      setRoleError(msg);
    } finally {
      setSavingRole(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    setSavingStatus(true);
    try {
      const updated = await toggleUserStatus(selectedUser.id_usuario, selectedUser.estado === 0);
      setUsers((prev) => prev.map((u) => u.id_usuario === updated.id_usuario ? updated : u));
      setStatusModal(false);
    } catch {
      // mantener modal abierto
    } finally {
      setSavingStatus(false);
    }
  };

  return {
    users, roles, filtered, search, setSearch, filtroRol, setFiltroRol, loading, error,
    loadData: () => loadData(true),
    roleModal, setRoleModal, selectedUser, savingRole, openRoleModal, handleChangeRole,
    roleError, setRoleError,
    statusModal, setStatusModal, savingStatus, openStatusModal, handleToggleStatus,
  };
}
