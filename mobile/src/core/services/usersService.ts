import { api } from './api';

export interface Usuario {
  id_usuario: string;
  nombre: string;
  correo: string;
  id_rol: string;
  nombre_rol: string;
  localidad: string | null;
  fecha_registro: string;
  estado: number;
}

export interface Rol {
  id_rol: string;
  nombre_rol: string;
  descripcion: string | null;
}

export const getUsers = async (): Promise<Usuario[]> => {
  const { data } = await api.get('/users');
  return data.data;
};

export const getRoles = async (): Promise<Rol[]> => {
  const { data } = await api.get('/roles');
  return data.data;
};

export const changeUserRole = async (userId: string, id_rol: string): Promise<Usuario> => {
  const { data } = await api.patch(`/users/${userId}/role`, { id_rol });
  return data.data;
};

export const deactivateUser = async (userId: string): Promise<void> => {
  await api.delete(`/users/${userId}`);
};

export const toggleUserStatus = async (userId: string, estado: boolean): Promise<Usuario> => {
  const { data } = await api.patch(`/users/${userId}/status`, { estado });
  return data.data;
};
