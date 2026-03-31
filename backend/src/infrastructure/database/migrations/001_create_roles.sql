CREATE TABLE IF NOT EXISTS roles (
  id_rol CHAR(36) NOT NULL DEFAULT (UUID()),
  nombre_rol VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  PRIMARY KEY (id_rol)
);
