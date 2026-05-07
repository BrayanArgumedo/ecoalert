ALTER TABLE usuarios
  ADD COLUMN avatar_seed VARCHAR(36) NULL DEFAULT NULL AFTER telefono;

UPDATE usuarios SET avatar_seed = (SELECT UUID()) WHERE avatar_seed IS NULL;
