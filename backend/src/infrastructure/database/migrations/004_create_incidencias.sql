CREATE TABLE IF NOT EXISTS incidencias (
  id_incidencia CHAR(36) NOT NULL DEFAULT (UUID()),
  id_usuario CHAR(36) NOT NULL,
  id_tipo_emergencia CHAR(36) NOT NULL,
  descripcion TEXT NOT NULL,
  latitud DECIMAL(10, 8),
  longitud DECIMAL(11, 8),
  direccion VARCHAR(255),
  prioridad ENUM('normal', 'alta', 'critica') DEFAULT 'normal',
  es_comunitario BOOLEAN DEFAULT FALSE,
  estado ENUM('pendiente', 'en_proceso', 'resuelta') DEFAULT 'pendiente',
  fecha_reporte DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_incidencia),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (id_tipo_emergencia) REFERENCES tipos_emergencia(id_tipo)
);
