// src/core/services/usersService.ts
// Servicio de usuarios: funciones que consumen los endpoints de gestión
// de usuarios y roles del backend.

import { api } from './api';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface Usuario {
  id_usuario: string;
  nombre: string;
  correo: string;
  id_rol: string;
  nombre_rol: string;
  localidad: string | null;
  fecha_registro: string;
  estado: number;          // 1 = activo, 0 = desactivado
  avatar_seed: string | null;
}

export interface Rol {
  id_rol: string;
  nombre_rol: string;
  descripcion: string | null;
}

// ── Llamadas a la API ─────────────────────────────────────────────────────────

// Lista todos los usuarios — solo disponible para Admin
export const getUsers = async (): Promise<Usuario[]> => {
  const { data } = await api.get('/users');
  return data.data;
};

// Lista el catálogo de roles — usado en el selector al cambiar el rol de un usuario
export const getRoles = async (): Promise<Rol[]> => {
  const { data } = await api.get('/roles');
  return data.data;
};

export const changeUserRole = async (userId: string, id_rol: string): Promise<Usuario> => {
  const { data } = await api.patch(`/users/${userId}/role`, { id_rol });
  return data.data;
};

// Desactivación permanente (estado = FALSE) desde la vista de Admin
export const deactivateUser = async (userId: string): Promise<void> => {
  await api.delete(`/users/${userId}`);
};

// Activación o desactivación reversible según el valor de estado
export const toggleUserStatus = async (userId: string, estado: boolean): Promise<Usuario> => {
  const { data } = await api.patch(`/users/${userId}/status`, { estado });
  return data.data;
};

// Actualiza el seed del avatar del usuario autenticado
export const updateAvatar = async (seed: string): Promise<Usuario> => {
  const { data } = await api.patch('/users/me/avatar', { seed });
  return data.data;
};

// Actualiza nombre, teléfono o contraseña del usuario autenticado
export const updateMyProfile = async (
  userId: string,
  dto: { nombre?: string; telefono?: string; contrasena?: string; contrasena_actual?: string }
): Promise<void> => {
  await api.patch(`/users/${userId}`, dto);
};
