CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario CHAR(36) NOT NULL DEFAULT (UUID()),
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(100) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  id_rol CHAR(36) NOT NULL,
  localidad VARCHAR(100),
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  estado BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (id_usuario),
  FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);
