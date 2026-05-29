// src/core/types/auth.types.ts
// Tipos del sistema de autenticación y del store global de sesión.

// Datos del usuario que se guardan en SecureStore y en el store de Zustand.
// Es un subconjunto de la respuesta del backend — no incluye contraseña ni estado.
export interface User {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  localidad: string;
  telefono: string;
  avatar_seed: string | null;
}

// Estado completo del store de autenticación (Zustand).
// Combina el estado de sesión con las acciones que lo modifican.
export interface AuthState {
  // ── Estado ──────────────────────────────────────────────────────
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;  // true mientras se carga la sesión guardada al iniciar la app

  // ── Acciones ─────────────────────────────────────────────────────
  login: (correo: string, contrasena: string) => Promise<void>;
  register: (nombre: string, correo: string, contrasena: string, localidad: string, telefono: string) => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
  updateAvatar: (seed: string) => Promise<void>;
  updateProfile: (nombre: string, telefono: string) => Promise<void>;
  changePassword: (actual: string, nueva: string) => Promise<void>;
}
