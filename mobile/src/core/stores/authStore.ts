// src/core/stores/authStore.ts
// Store global de autenticación construido con Zustand.
// Centraliza el estado de sesión y todas las acciones que lo modifican,
// sincronizando siempre el estado en memoria con SecureStore (cifrado).

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '../services/api';
import { updateAvatar as updateAvatarApi, updateMyProfile as updateMyProfileApi } from '../services/usersService';
import type { AuthState, User } from '../types/auth.types';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,  // Empieza en true para bloquear la navegación hasta que loadSession termine

  // ── Cargar sesión persistida ──────────────────────────────────────────────

  // Se llama al iniciar la app desde el _layout.tsx raíz.
  // Restaura la sesión si el usuario ya había iniciado sesión anteriormente.
  loadSession: async () => {
    try {
      const token    = await SecureStore.getItemAsync('access_token');
      const refresh  = await SecureStore.getItemAsync('refresh_token');
      const userRaw  = await SecureStore.getItemAsync('user');

      if (token && userRaw) {
        const user: User = JSON.parse(userRaw);
        set({ user, accessToken: token, refreshToken: refresh, isAuthenticated: true });
      }
    } catch {
      // Sesión inválida o datos corruptos en SecureStore — limpiar todo
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
      await SecureStore.deleteItemAsync('user');
    } finally {
      // isLoading pasa a false en cualquier caso para desbloquear la navegación
      set({ isLoading: false });
    }
  },

  // ── Login ─────────────────────────────────────────────────────────────────

  login: async (correo, contrasena) => {
    const { data } = await api.post('/auth/login', {
      correo: correo.trim().toLowerCase(),
      contrasena: contrasena.trim(),
    });
    const { accessToken, refreshToken, usuario } = data.data;

    // Persiste los tokens y los datos del usuario en almacenamiento cifrado
    await SecureStore.setItemAsync('access_token', accessToken);
    await SecureStore.setItemAsync('refresh_token', refreshToken);
    await SecureStore.setItemAsync('user', JSON.stringify(usuario));

    set({ user: usuario, accessToken, refreshToken, isAuthenticated: true });
  },

  // ── Registro ──────────────────────────────────────────────────────────────

  // Registra al usuario y luego hace login automáticamente para no obligarlo
  // a introducir sus credenciales dos veces.
  register: async (nombre, correo, contrasena, localidad, telefono) => {
    const contTrim = contrasena.trim();
    await api.post('/auth/register', { nombre, correo, contrasena: contTrim, localidad, telefono });

    const { data } = await api.post('/auth/login', { correo, contrasena: contTrim });
    const { accessToken, refreshToken, usuario } = data.data;

    await SecureStore.setItemAsync('access_token', accessToken);
    await SecureStore.setItemAsync('refresh_token', refreshToken);
    await SecureStore.setItemAsync('user', JSON.stringify(usuario));

    set({ user: usuario, accessToken, refreshToken, isAuthenticated: true });
  },

  // ── Logout ────────────────────────────────────────────────────────────────

  logout: async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    await SecureStore.deleteItemAsync('user');
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  // ── Actualizar avatar ─────────────────────────────────────────────────────

  // Persiste el nuevo seed en la BD y actualiza SecureStore + estado en memoria
  updateAvatar: async (seed: string) => {
    await updateAvatarApi(seed);
    const userRaw = await SecureStore.getItemAsync('user');
    if (userRaw) {
      const user: User = { ...JSON.parse(userRaw), avatar_seed: seed };
      await SecureStore.setItemAsync('user', JSON.stringify(user));
      set({ user });
    }
  },

  // ── Actualizar perfil ─────────────────────────────────────────────────────

  updateProfile: async (nombre, telefono) => {
    const userId = get().user?.id;
    if (!userId) return;
    await updateMyProfileApi(userId, { nombre, telefono });

    // Actualiza el usuario localmente sin necesidad de volver a llamar al backend
    const user = get().user;
    if (user) {
      const updated: User = { ...user, nombre, telefono };
      await SecureStore.setItemAsync('user', JSON.stringify(updated));
      set({ user: updated });
    }
  },

  // ── Cambiar contraseña ────────────────────────────────────────────────────

  // Solo llama al backend — no hay estado local que actualizar
  changePassword: async (actual, nueva) => {
    const userId = get().user?.id;
    if (!userId) return;
    await updateMyProfileApi(userId, { contrasena: nueva, contrasena_actual: actual });
  },
}));
