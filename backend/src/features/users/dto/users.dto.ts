export interface UpdateUserDto {
  nombre?: string;
  localidad?: string;
  telefono?: string;
  contrasena?: string;
  contrasena_actual?: string;
}

export interface UpdateRoleDto {
  id_rol: string;
}
