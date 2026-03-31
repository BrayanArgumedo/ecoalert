CREATE TABLE IF NOT EXISTS servicios_publicos (
  id_servicio CHAR(36) NOT NULL DEFAULT (UUID()),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  id_rol_asignado CHAR(36) NOT NULL,
  PRIMARY KEY (id_servicio),
  FOREIGN KEY (id_rol_asignado) REFERENCES roles(id_rol)
);
