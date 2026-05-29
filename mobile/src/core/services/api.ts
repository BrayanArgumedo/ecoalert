// src/core/services/api.ts
// Cliente HTTP central de la aplicación.
// Configura la instancia de Axios con la URL base, los interceptores de
// autenticación y el mecanismo de renovación automática de tokens.

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { EventEmitter } from 'eventemitter3';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

// Bus de eventos global para notificar sesión expirada.
// Se usa un EventEmitter en lugar de importar authStore directamente
// para evitar dependencia circular (authStore ya importa api.ts).
export const authEvents = new EventEmitter();

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Interceptor de request ────────────────────────────────────────────────────

// Lee el access token de SecureStore y lo adjunta en cada request automáticamente.
// SecureStore es el almacenamiento cifrado del dispositivo — más seguro que AsyncStorage.
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Interceptor de response ───────────────────────────────────────────────────

// Si el servidor responde 401 (token expirado), intenta renovarlo con el refresh token
// y reintenta el request original de forma transparente para el llamador.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // No intentar renovar el token en rutas de auth (login, register, refresh)
    // para evitar bucles infinitos si las credenciales son inválidas
    const isAuthRoute = original.url?.includes('/auth/');
    if (error.response?.status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true; // Marca para evitar reintentos infinitos

      try {
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        // Llama directamente con axios (no con api) para evitar que el interceptor
        // vuelva a capturar un posible 401 de este mismo endpoint
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const newToken = data.data.accessToken;

        // Persiste el nuevo par de tokens
        await SecureStore.setItemAsync('access_token', newToken);
        await SecureStore.setItemAsync('refresh_token', data.data.refreshToken);

        // Reintenta el request original con el nuevo access token
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        // El refresh también falló: limpiar sesión y emitir evento para
        // que el _layout.tsx redirija al login automáticamente
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        await SecureStore.deleteItemAsync('user');
        authEvents.emit('session-expired');
      }
    }

    return Promise.reject(error);
  }
);
