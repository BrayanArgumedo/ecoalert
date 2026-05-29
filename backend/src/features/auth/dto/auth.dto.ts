// src/features/auth/dto/auth.dto.ts
// Data Transfer Objects del módulo de autenticación.
// Definen la forma exacta del body esperado en cada endpoint,
// y sirven como contrato entre el controlador y el servicio.

/**
 * Campos requeridos para crear una nueva cuenta.
 * La localidad debe pertenecer a la lista oficial de Cereté (LOCALIDADES_CERETE).
 */
export interface RegisterDto {
  nombre: string;
  correo: string;
  contrasena: string;
  localidad: string;
  telefono: string;
}

/** Credenciales para autenticar a un usuario existente. */
export interface LoginDto {
  correo: string;
  contrasena: string;
}

/** Token necesario para solicitar un nuevo par de tokens. */
export interface RefreshDto {
  refreshToken: string;
}
