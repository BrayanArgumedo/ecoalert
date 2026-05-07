export interface User {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  localidad: string;
  telefono: string;
  avatar_seed: string | null;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (correo: string, contrasena: string) => Promise<void>;
  register: (nombre: string, correo: string, contrasena: string, localidad: string, telefono: string) => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
  updateAvatar: (seed: string) => Promise<void>;
}
