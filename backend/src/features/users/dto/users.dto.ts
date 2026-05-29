// src/features/users/dto/users.dto.ts
// Data Transfer Objects del módulo de usuarios.

/**
 * Campos actualizables del perfil de usuario.
 * Todos son opcionales — el servicio construye el SET dinámicamente
 * con solo los campos que lleguen en el body.
 * El cambio de contraseña requiere enviar también contrasena_actual.
 */
export interface UpdateUserDto {
  nombre?: string;
  localidad?: string;
  telefono?: string;
  contrasena?: string;
  contrasena_actual?: string; // Requerida solo cuando se envía contrasena
}

/** ID del rol al que se quiere cambiar al usuario. */
export interface UpdateRoleDto {
  id_rol: string;
}
