-- ============================================================
-- EcoAlert — inicialización automática de la base de datos
-- Se ejecuta automáticamente cuando el contenedor MySQL
-- arranca por primera vez (volumen vacío).
-- ============================================================

-- 001 Roles
CREATE TABLE IF NOT EXISTS roles (
  id_rol CHAR(36) NOT NULL DEFAULT (UUID()),
  nombre_rol VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  PRIMARY KEY (id_rol)
);

-- 002 Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario CHAR(36) NOT NULL DEFAULT (UUID()),
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(100) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  id_rol CHAR(36) NOT NULL,
  localidad VARCHAR(100) NOT NULL,
  telefono VARCHAR(20) NOT NULL DEFAULT '',
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  estado BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (id_usuario),
  FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

-- 003 Tipos de emergencia
CREATE TABLE IF NOT EXISTS tipos_emergencia (
  id_tipo CHAR(36) NOT NULL DEFAULT (UUID()),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  icono VARCHAR(100),
  PRIMARY KEY (id_tipo)
);

-- 004 Incidencias
CREATE TABLE IF NOT EXISTS incidencias (
  id_incidencia CHAR(36) NOT NULL DEFAULT (UUID()),
  id_usuario CHAR(36) NOT NULL,
  id_tipo_emergencia CHAR(36) NOT NULL,
  descripcion TEXT NOT NULL,
  latitud DECIMAL(10, 8),
  longitud DECIMAL(11, 8),
  direccion VARCHAR(255),
  hay_heridos BOOLEAN NOT NULL DEFAULT FALSE,
  cantidad_heridos INT NULL,
  prioridad ENUM('normal', 'alta', 'critica') DEFAULT 'normal',
  es_comunitario BOOLEAN DEFAULT FALSE,
  estado ENUM('pendiente', 'en_proceso', 'resuelta') DEFAULT 'pendiente',
  fecha_reporte DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_incidencia),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (id_tipo_emergencia) REFERENCES tipos_emergencia(id_tipo)
);

-- 005 Servicios públicos
CREATE TABLE IF NOT EXISTS servicios_publicos (
  id_servicio CHAR(36) NOT NULL DEFAULT (UUID()),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  id_rol_asignado CHAR(36) NOT NULL,
  PRIMARY KEY (id_servicio),
  FOREIGN KEY (id_rol_asignado) REFERENCES roles(id_rol)
);

-- 006 Incidencia ↔ Servicios
CREATE TABLE IF NOT EXISTS incidencia_servicios (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  id_incidencia CHAR(36) NOT NULL,
  id_servicio CHAR(36) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_incidencia_servicio (id_incidencia, id_servicio),
  FOREIGN KEY (id_incidencia) REFERENCES incidencias(id_incidencia),
  FOREIGN KEY (id_servicio) REFERENCES servicios_publicos(id_servicio)
);

-- 007 Historial de estados
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

-- 008 Seed — Roles
INSERT IGNORE INTO roles (id_rol, nombre_rol, descripcion) VALUES
(UUID(), 'Admin',                     'Acceso total al sistema'),
(UUID(), 'Representante de Localidad','Usuario con reporte de prioridad comunitaria'),
(UUID(), 'Ciudadano',                 'Usuario general que reporta emergencias'),
(UUID(), 'Bombero',                   'Responde incidencias que requieren bomberos'),
(UUID(), 'Policia',                   'Responde incidencias que requieren policia'),
(UUID(), 'Paramedico',                'Responde incidencias que requieren asistencia medica');

-- 008 Seed — Tipos de emergencia
INSERT IGNORE INTO tipos_emergencia (id_tipo, nombre, descripcion, icono) VALUES
(UUID(), 'Terremoto',              'Movimiento sísmico de magnitud significativa',         'earthquake'),
(UUID(), 'Inundación',             'Desbordamiento de ríos, lluvias extremas o maremotos', 'flood'),
(UUID(), 'Derrumbe',               'Colapso de estructuras o deslizamiento de tierra',     'landslide'),
(UUID(), 'Huracán',                'Tormenta tropical de alta intensidad',                 'hurricane'),
(UUID(), 'Incendio Forestal',      'Fuego descontrolado en zonas boscosas o rurales',      'fire'),
(UUID(), 'Deslizamiento',          'Movimiento de masa de tierra por pendientes',          'slide'),
(UUID(), 'Tormenta Eléctrica',     'Tormenta con descargas eléctricas y vientos fuertes',  'storm'),
(UUID(), 'Contaminación Ambiental','Contaminación de agua, aire o suelo',                  'pollution');

-- 008 Seed — Servicios públicos
INSERT IGNORE INTO servicios_publicos (id_servicio, nombre, id_rol_asignado) VALUES
(UUID(), 'Bomberos',          (SELECT id_rol FROM roles WHERE nombre_rol = 'Bombero')),
(UUID(), 'Policia',           (SELECT id_rol FROM roles WHERE nombre_rol = 'Policia')),
(UUID(), 'Asistencia Medica', (SELECT id_rol FROM roles WHERE nombre_rol = 'Paramedico'));
