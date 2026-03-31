-- Roles del sistema
INSERT IGNORE INTO roles (id_rol, nombre_rol, descripcion) VALUES
(UUID(), 'Admin',                     'Acceso total al sistema'),
(UUID(), 'Representante de Localidad','Usuario con reporte de prioridad comunitaria'),
(UUID(), 'Ciudadano',                 'Usuario general que reporta emergencias'),
(UUID(), 'Bombero',                   'Responde incidencias que requieren bomberos'),
(UUID(), 'Policia',                   'Responde incidencias que requieren policia'),
(UUID(), 'Paramedico',                'Responde incidencias que requieren asistencia medica');

-- Tipos de emergencia ambiental
INSERT IGNORE INTO tipos_emergencia (id_tipo, nombre, descripcion, icono) VALUES
(UUID(), 'Terremoto',              'Movimiento sísmico de magnitud significativa',         'earthquake'),
(UUID(), 'Inundación',             'Desbordamiento de ríos, lluvias extremas o maremotos', 'flood'),
(UUID(), 'Derrumbe',               'Colapso de estructuras o deslizamiento de tierra',     'landslide'),
(UUID(), 'Huracán',                'Tormenta tropical de alta intensidad',                 'hurricane'),
(UUID(), 'Incendio Forestal',      'Fuego descontrolado en zonas boscosas o rurales',     'fire'),
(UUID(), 'Deslizamiento',          'Movimiento de masa de tierra por pendientes',          'slide'),
(UUID(), 'Tormenta Eléctrica',    'Tormenta con descargas eléctricas y vientos fuertes', 'storm'),
(UUID(), 'Contaminación Ambiental','Contaminación de agua, aire o suelo',                 'pollution');

-- Servicios públicos vinculados a sus roles (usando subquery para no depender de IDs hardcodeados)
INSERT IGNORE INTO servicios_publicos (id_servicio, nombre, id_rol_asignado) VALUES
(UUID(), 'Bomberos',          (SELECT id_rol FROM roles WHERE nombre_rol = 'Bombero')),
(UUID(), 'Policia',           (SELECT id_rol FROM roles WHERE nombre_rol = 'Policia')),
(UUID(), 'Asistencia Medica', (SELECT id_rol FROM roles WHERE nombre_rol = 'Paramedico'));
