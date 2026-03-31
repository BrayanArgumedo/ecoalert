CREATE TABLE IF NOT EXISTS tipos_emergencia (
  id_tipo CHAR(36) NOT NULL DEFAULT (UUID()),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  icono VARCHAR(100),
  PRIMARY KEY (id_tipo)
);
