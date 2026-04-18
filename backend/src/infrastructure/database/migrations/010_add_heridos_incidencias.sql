ALTER TABLE incidencias
  ADD COLUMN hay_heridos BOOLEAN NOT NULL DEFAULT FALSE AFTER direccion,
  ADD COLUMN cantidad_heridos INT NULL AFTER hay_heridos;
