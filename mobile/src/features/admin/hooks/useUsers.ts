import { useState, useEffect, useMemo } from 'react';
import { getUsers, getRoles, changeUserRole, toggleUserStatus } from '../../../core/services/usersService';
import type { Usuario, Rol } from '../../../core/services/usersService';

export function useUsers() {
  const [users,   setUsers]   = useState<Usuario[]>([]);
  const [roles,   setRoles]   = useState<Rol[]>([]);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // Modal cambiar rol
  const [roleModal,    setRoleModal]    = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [savingRole,   setSavingRole]   = useState(false);
  const [roleError,    setRoleError]    = useState<string | null>(null);

  // Modal toggle estado
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

  const openRoleModal = (user: Usuario) => { setSelectedUser(user); setRoleModal(true); };
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
    users, roles, filtered, search, setSearch, loading, error, loadData,
    roleModal, setRoleModal, selectedUser, savingRole, openRoleModal, handleChangeRole,
    roleError, setRoleError,
    statusModal, setStatusModal, savingStatus, openStatusModal, handleToggleStatus,
  };
}
