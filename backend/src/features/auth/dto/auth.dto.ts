export interface RegisterDto {
  nombre: string;
  correo: string;
  contrasena: string;
  localidad?: string;
}

export interface LoginDto {
  correo: string;
  contrasena: string;
}

export interface RefreshDto {
  refreshToken: string;
}
