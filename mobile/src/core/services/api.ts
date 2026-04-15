import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { EventEmitter } from 'eventemitter3';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

// Bus de eventos para notificar sesión expirada sin dependencia circular con authStore
export const authEvents = new EventEmitter();

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Adjunta el access token en cada request automáticamente
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el token expiró (401), intenta renovarlo con el refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    const isAuthRoute = original.url?.includes('/auth/');
    if (error.response?.status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const newToken = data.data.accessToken;

        await SecureStore.setItemAsync('access_token', newToken);
        await SecureStore.setItemAsync('refresh_token', data.data.refreshToken);

        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        // Refresh falló — limpiar sesión y notificar a la app
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        await SecureStore.deleteItemAsync('user');
        authEvents.emit('session-expired');
      }
    }

    return Promise.reject(error);
  }
);
