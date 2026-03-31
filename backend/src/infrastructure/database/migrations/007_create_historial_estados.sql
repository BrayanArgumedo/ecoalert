CREATE TABLE IF NOT EXISTS historial_estados (
  id_historial CHAR(36) NOT NULL DEFAULT (UUID()),
  id_incidencia CHAR(36) NOT NULL,
  estado_anterior ENUM('pendiente', 'en_proceso', 'resuelta'),
  estado_nuevo ENUM('pendiente', 'en_proceso', 'resuelta') NOT NULL,
  id_usuario CHAR(36) NOT NULL,
  fecha_cambio DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_historial),
  FOREIGN KEY (id_incidencia) REFERENCES incidencias(id_incidencia),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);
