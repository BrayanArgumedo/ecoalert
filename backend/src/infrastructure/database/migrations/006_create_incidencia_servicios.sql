CREATE TABLE IF NOT EXISTS incidencia_servicios (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  id_incidencia CHAR(36) NOT NULL,
  id_servicio CHAR(36) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_incidencia_servicio (id_incidencia, id_servicio),
  FOREIGN KEY (id_incidencia) REFERENCES incidencias(id_incidencia),
  FOREIGN KEY (id_servicio) REFERENCES servicios_publicos(id_servicio)
);
