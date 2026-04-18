import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '../services/api';
import type { AuthState, User } from '../types/auth.types';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  // Carga la sesión guardada al iniciar la app
  loadSession: async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      const refresh = await SecureStore.getItemAsync('refresh_token');
      const userRaw = await SecureStore.getItemAsync('user');

      if (token && userRaw) {
        const user: User = JSON.parse(userRaw);
        set({ user, accessToken: token, refreshToken: refresh, isAuthenticated: true });
      }
    } catch {
      // Sesión inválida o corrupta — limpiar
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
      await SecureStore.deleteItemAsync('user');
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (correo, contrasena) => {
    const { data } = await api.post('/auth/login', { correo: correo.trim().toLowerCase(), contrasena: contrasena.trim() });
    const { accessToken, refreshToken, usuario } = data.data;

    await SecureStore.setItemAsync('access_token', accessToken);
    await SecureStore.setItemAsync('refresh_token', refreshToken);
    await SecureStore.setItemAsync('user', JSON.stringify(usuario));

    set({
      user: usuario,
      accessToken,
      refreshToken,
      isAuthenticated: true,
    });
  },

  register: async (nombre, correo, contrasena, localidad, telefono) => {
    const contTrim = contrasena.trim();
    await api.post('/auth/register', { nombre, correo, contrasena: contTrim, localidad, telefono });
    // Tras registrarse hacemos login automáticamente
    const { data } = await api.post('/auth/login', { correo, contrasena: contTrim });
    const { accessToken, refreshToken, usuario } = data.data;

    await SecureStore.setItemAsync('access_token', accessToken);
    await SecureStore.setItemAsync('refresh_token', refreshToken);
    await SecureStore.setItemAsync('user', JSON.stringify(usuario));

    set({
      user: usuario,
      accessToken,
      refreshToken,
      isAuthenticated: true,
    });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    await SecureStore.deleteItemAsync('user');
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },
}));
