# EcoAlert — Estado Actual del Proyecto y Base para Documentación

> **Documento técnico de referencia** — Descripción completa del sistema implementado,
> lógica de negocio, flujos de usuario, arquitectura y estado de avance.
> Creado para servir como guía base en la elaboración del informe escrito del TCC.

---

## 1. Contexto y Problemática

### 1.1 Descripción del problema

El municipio de **Cereté, Córdoba, Colombia**, como muchos municipios colombianos de tamaño intermedio, carece de un canal digital organizado para reportar emergencias ambientales. Cuando ocurre un evento como una inundación, un incendio forestal, un derrumbe o un derrame de sustancias peligrosas, la ciudadanía recurre a métodos informales: llamadas telefónicas a líneas de emergencia, publicaciones en redes sociales, o el "voz a voz". Esto genera problemas concretos:

- **Duplicidad de reportes**: múltiples personas reportan el mismo evento sin saberlo, saturando los canales de atención.
- **Falta de priorización**: no hay un mecanismo que distinga entre una emergencia menor y una que requiere respuesta inmediata.
- **Descoordinación de servicios**: bomberos, policía y paramédicos no tienen visibilidad unificada de los eventos que los involucran.
- **Sin trazabilidad**: una vez reportada la emergencia, el ciudadano no sabe qué pasó con su reporte, ni si alguien lo atendió.
- **Ausencia de representación comunitaria**: los representantes de localidades no tienen herramientas para elevar y dar seguimiento a problemas que afectan a toda su comunidad.

### 1.2 Solución propuesta

**EcoAlert** es una aplicación móvil multiplataforma que centraliza el reporte, la gestión y el seguimiento de emergencias ambientales. Conecta a tres tipos de actores:

1. **La ciudadanía** — reporta incidencias con descripción, ubicación y tipo de emergencia.
2. **Los servicios públicos de respuesta** — bomberos, policía y paramédicos reciben y atienden los reportes que les corresponden.
3. **Los administradores y representantes** — supervisan el sistema, gestionan usuarios y hacen seguimiento a las incidencias de su territorio.

### 1.3 Alcance geográfico

La aplicación está configurada para el municipio de Cereté, Córdoba. Las localidades disponibles corresponden a los barrios y veredas oficiales según el **Plan Básico de Ordenamiento Territorial (PBOT) de Cereté 2012-2023**, garantizando que la información geográfica sea precisa y verificable.

---

## 2. Objetivos del Sistema

### Objetivo general
Desarrollar una aplicación móvil que permita a los ciudadanos de Cereté reportar emergencias ambientales y conectarlos eficientemente con los servicios públicos de respuesta, mediante un sistema de gestión priorizado con control de acceso por roles.

### Objetivos específicos
1. Implementar un sistema de autenticación seguro con roles diferenciados (RBAC).
2. Permitir el reporte de incidencias con tipo de emergencia, descripción, ubicación y servicios requeridos.
3. Proporcionar a cada servicio público (bomberos, policía, paramédicos) una vista filtrada de las incidencias que les corresponden.
4. Implementar un sistema de priorización automática de incidencias según el rol del reportante.
5. Registrar el historial completo de cambios de estado de cada incidencia.
6. Ofrecer al administrador un panel de estadísticas y gestión del sistema.
7. Permitir la edición del perfil personal de cada usuario.

---

## 3. Arquitectura del Sistema

### 3.1 Tipo de arquitectura

EcoAlert sigue una arquitectura **cliente-servidor** con separación clara entre el frontend móvil y el backend REST:

```
┌─────────────────────────────────────────────────┐
│              DISPOSITIVO MÓVIL                  │
│   App React Native / Expo (cliente)             │
│   - Renderiza la UI por rol                     │
│   - Maneja estado global con Zustand            │
│   - Comunica con API via HTTP/JSON              │
└────────────────────┬────────────────────────────┘
                     │ HTTP REST (Bearer Token JWT)
                     │
┌────────────────────▼────────────────────────────┐
│              BACKEND (servidor)                 │
│   Node.js + Express (API REST)                  │
│   - Valida tokens JWT en cada request           │
│   - Aplica control de roles (RBAC)              │
│   - Ejecuta la lógica de negocio                │
│   - Retorna JSON estandarizado                  │
└────────────────────┬────────────────────────────┘
                     │ mysql2 (pool de conexiones)
                     │
┌────────────────────▼────────────────────────────┐
│         BASE DE DATOS (persistencia)            │
│   MySQL 8.0 en contenedor Docker                │
│   - 7 tablas relacionales                       │
│   - Migraciones versionadas (012 archivos)      │
│   - phpMyAdmin en puerto 8080                   │
└─────────────────────────────────────────────────┘
```

### 3.2 Patrón de organización del backend

El backend sigue un patrón de **arquitectura por features (módulos)**, donde cada funcionalidad del sistema es un módulo independiente con sus propias capas:

```
feature/
├── feature.router.ts       ← Define las rutas HTTP
├── controllers/
│   └── feature.controller.ts  ← Recibe el request, llama al service, responde
├── services/
│   └── feature.service.ts     ← Lógica de negocio y queries a la BD
└── dto/
    └── feature.dto.ts          ← Tipos TypeScript de los datos de entrada
```

**Módulos implementados:**
- `auth/` — Registro, login, refresh de tokens
- `users/` — Gestión de usuarios y perfiles
- `incidents/` — Gestión completa de incidencias
- `emergency-types/` — Tipos de emergencia configurables
- `services/` — Servicios públicos disponibles
- `roles/` — Consulta de roles del sistema

### 3.3 Patrón de organización del mobile

El mobile sigue la estructura de **Expo Router (file-based routing)** combinada con una arquitectura de features para los componentes y hooks:

```
app/                         ← Rutas de navegación (Expo Router)
├── (auth)/                  ← Rutas públicas (sin autenticación)
│   ├── login.tsx
│   └── register.tsx
├── (tabs)/                  ← Rutas protegidas con tab bar
│   ├── home.tsx             ← Dashboard principal
│   ├── incidents.tsx        ← Lista de incidencias
│   ├── create-incident.tsx  ← Crear nueva incidencia
│   ├── profile.tsx          ← Perfil del usuario
│   ├── users.tsx            ← Gestión de usuarios (Admin)
│   ├── emergency-types.tsx  ← Tipos de emergencia (Admin)
│   └── statistics.tsx       ← Estadísticas (Admin)
└── incident-detail.tsx      ← Detalle de una incidencia

src/
├── core/                    ← Funcionalidades globales
│   ├── services/            ← Llamadas al API (Axios)
│   ├── stores/              ← Estado global (Zustand)
│   ├── types/               ← Interfaces TypeScript
│   └── utils/               ← Utilidades: roles, avatar, localidades
└── features/                ← Módulos por funcionalidad
    ├── admin/               ← Hooks y componentes del admin
    └── incidents/           ← Hooks y componentes de incidencias
```

### 3.4 Flujo de una petición HTTP

Cada llamada desde el mobile al backend sigue este flujo:

```
Mobile (Axios)
  → Interceptor de request: agrega "Authorization: Bearer <token>"
  → Backend recibe el request
  → authMiddleware: verifica y decodifica el JWT
  → rolesMiddleware: comprueba que el rol del usuario tiene permiso
  → Controller: extrae datos del request (params, body, user)
  → Service: ejecuta la lógica y queries MySQL
  → Controller: responde con { success, message, data }
  → Interceptor de response (Axios): si 401, intenta refresh automático
  → La pantalla actualiza su estado con los datos recibidos
```

---

## 4. Stack Tecnológico

### 4.1 Frontend móvil

| Tecnología | Versión | Rol en el proyecto |
|---|---|---|
| React Native | 0.76 | Framework UI multiplataforma (iOS y Android desde un solo código) |
| Expo | SDK 54 | Toolchain: manejo de assets, APIs nativas, build y deploy |
| Expo Router | v4 | Sistema de navegación basado en la estructura de archivos |
| TypeScript | 5.x | Tipado estático en todo el proyecto |
| Zustand | 5.x | Manejo de estado global (sesión del usuario, tokens) |
| Axios | latest | Cliente HTTP con interceptores para manejo automático de JWT |
| Expo SecureStore | latest | Almacenamiento cifrado de tokens JWT en el dispositivo |
| Expo Location | latest | Obtención de coordenadas GPS para el reporte de incidencias |
| LinearGradient | latest | Degradados para el diseño visual de la app |
| DiceBear API | (externa) | Generación de avatares personalizados por semilla (seed) |

### 4.2 Backend

| Tecnología | Versión | Rol en el proyecto |
|---|---|---|
| Node.js | 22+ | Runtime de ejecución del servidor |
| Express | 4.x | Framework HTTP para la API REST |
| TypeScript | 5.x | Tipado estático |
| mysql2 | 3.x | Driver MySQL con pool de conexiones |
| jsonwebtoken | 9.x | Generación y verificación de tokens JWT |
| bcryptjs | 2.x | Hash y comparación segura de contraseñas |
| uuid | 9.x | Generación de identificadores únicos para los registros |
| zod | 3.x | Validación de esquemas de datos de entrada |
| dotenv | 16.x | Manejo de variables de entorno |

### 4.3 Infraestructura

| Tecnología | Rol en el proyecto |
|---|---|
| Docker | Contenerización del entorno de base de datos |
| Docker Compose | Orquestación de MySQL + phpMyAdmin con un solo comando |
| MySQL 8.0 | Base de datos relacional principal |
| phpMyAdmin | Interfaz web para administración visual de la BD (desarrollo) |

---

## 5. Sistema de Roles (RBAC)

### 5.1 ¿Qué es RBAC?

RBAC (Role-Based Access Control) es el sistema de control de acceso implementado en EcoAlert. Cada usuario tiene asignado un **rol** y ese rol determina:
- Qué rutas del API puede llamar
- Qué datos puede ver
- Qué acciones puede ejecutar

El rol no es una preferencia ni una configuración del usuario — es una restricción que se valida en el servidor en cada petición, independientemente de lo que el cliente envíe.

### 5.2 Los 6 roles del sistema

#### 🔴 Admin
El administrador tiene control total del sistema. Es el único rol que puede:
- Ver, crear, editar, activar/desactivar y cambiar el rol de **cualquier usuario**
- Crear, editar y eliminar **tipos de emergencia**
- Ver **todas las incidencias** de todos los usuarios y localidades
- Cambiar el estado de **cualquier incidencia**
- Acceder al panel de **estadísticas** globales del sistema
- Exportar el reporte de estadísticas en formato **PDF**

Existe un único usuario admin creado automáticamente al ejecutar las migraciones:
- Correo: `admin@ecoalert.com`
- Contraseña: `Admin123!`

#### 🟠 Representante de Localidad
Figura de liderazgo comunitario. Sus particularidades:
- Ve **todas las incidencias de su localidad** (las propias y las de otros ciudadanos de su barrio)
- Sus incidencias tienen **prioridad "alta" automáticamente** (frente a la "normal" de ciudadanos)
- Puede cambiar el estado de las incidencias que supervisa
- No gestiona usuarios ni tipos de emergencia

#### 🟢 Ciudadano
El usuario estándar de la aplicación:
- Puede **crear reportes** de incidencias
- Solo ve **sus propias incidencias**
- Sus incidencias tienen prioridad **"normal"** por defecto
- No puede cambiar el estado de sus propias incidencias

#### 🔵 Bombero / 🔵 Policía / 🟡 Paramédico
Los tres roles de respuesta (denominados "responders") funcionan de la misma manera pero cada uno está asociado a un servicio público diferente. Sus características:
- Solo ven las incidencias que **incluyen a su servicio** como requerido
- Pueden **aceptar** una incidencia (marcar que su unidad está respondiendo)
- Pueden cambiar el **estado** de las incidencias que atienden
- Los incidentes se muestran ordenados por **prioridad descendente** y luego por fecha (más recientes primero)
- Solo puede existir **un usuario activo por rol de responder** en todo el sistema (restricción de unicidad)

### 5.3 Matriz de permisos detallada

| Acción | Admin | Representante | Ciudadano | Responders |
|---|:---:|:---:|:---:|:---:|
| Ver todos los usuarios | ✅ | ❌ | ❌ | ❌ |
| Cambiar rol de usuario | ✅ | ❌ | ❌ | ❌ |
| Activar/desactivar usuario | ✅ | ❌ | ❌ | ❌ |
| Crear tipo de emergencia | ✅ | ❌ | ❌ | ❌ |
| Editar tipo de emergencia | ✅ | ❌ | ❌ | ❌ |
| Eliminar tipo de emergencia | ✅ | ❌ | ❌ | ❌ |
| Ver estadísticas globales | ✅ | ❌ | ❌ | ❌ |
| Crear incidencia | ✅ | ✅ | ✅ | ❌ |
| Ver todas las incidencias | ✅ | ❌ | ❌ | ❌ |
| Ver incidencias de su localidad | — | ✅ | ❌ | ❌ |
| Ver sus propias incidencias | — | ✅ | ✅ | ❌ |
| Ver incidencias de su servicio | — | — | — | ✅ |
| Cambiar estado de incidencia | ✅ | ✅ | ❌ | ✅* |
| Aceptar incidencia | ❌ | ❌ | ❌ | ✅ |
| Editar su propio perfil | ✅ | ✅ | ✅ | ✅ |
| Cambiar su contraseña | ✅ | ✅ | ✅ | ✅ |

> *Los responders solo pueden cambiar el estado de incidencias donde su servicio está asignado.

### 5.4 Implementación técnica del RBAC

El control de acceso se implementa en dos capas del backend:

**Capa 1 — Middleware de autenticación** (`auth.middleware.ts`):
Verifica que el token JWT sea válido y no esté expirado. Si lo es, extrae el payload (`id`, `correo`, `rol`, `localidad`) y lo adjunta al objeto `req.user`. Si no hay token o es inválido, responde con `401 Unauthorized`.

**Capa 2 — Middleware de roles** (`roles.middleware.ts`):
Recibe los roles permitidos para una ruta y verifica que `req.user.rol` esté en esa lista. Si no tiene permiso, responde `403 Forbidden`.

```
router.get('/', requireRoles(ROLES.ADMIN), getAllUsers);
//                ↑ Solo Admin puede listar usuarios
```

Adicionalmente, dentro de los servicios hay **validaciones de negocio** más finas:
- Un responder solo puede cambiar estado si su rol está en los servicios de la incidencia
- Un usuario solo puede editar su propio perfil (o el Admin el de cualquiera)
- Un responder solo puede aceptar la incidencia con su propio servicio

---

## 6. Base de Datos

### 6.1 Esquema relacional

La base de datos consta de **7 tablas** relacionadas entre sí:

#### `roles`
Catálogo fijo de los 6 roles del sistema.

| Campo | Tipo | Descripción |
|---|---|---|
| `id_rol` | UUID (PK) | Identificador único |
| `nombre_rol` | VARCHAR | Nombre del rol: Admin, Ciudadano, Bombero, etc. |
| `descripcion` | TEXT | Descripción del rol |

#### `usuarios`
Todos los usuarios registrados en el sistema.

| Campo | Tipo | Descripción |
|---|---|---|
| `id_usuario` | UUID (PK) | Identificador único |
| `nombre` | VARCHAR | Nombre completo |
| `correo` | VARCHAR (UNIQUE) | Correo electrónico (usado como login) |
| `contrasena` | VARCHAR | Hash bcrypt de la contraseña |
| `id_rol` | UUID (FK → roles) | Rol asignado |
| `localidad` | VARCHAR | Barrio o vereda de Cereté |
| `telefono` | VARCHAR | Número de contacto |
| `avatar_seed` | VARCHAR | Semilla para generar el avatar con DiceBear |
| `estado` | BOOLEAN | `true` = activo, `false` = desactivado |
| `fecha_registro` | DATETIME | Fecha de creación del registro |

#### `tipos_emergencia`
Catálogo configurable de tipos de emergencia ambiental.

| Campo | Tipo | Descripción |
|---|---|---|
| `id_tipo` | UUID (PK) | Identificador único |
| `nombre` | VARCHAR | Nombre del tipo: "Inundación", "Incendio forestal", etc. |
| `icono` | VARCHAR | Nombre del ícono Ionicons asociado |
| `descripcion` | TEXT | Descripción del tipo de emergencia |
| `activo` | BOOLEAN | Si está disponible para seleccionar al reportar |

#### `servicios_publicos`
Los servicios de respuesta del municipio, vinculados a un rol de responder.

| Campo | Tipo | Descripción |
|---|---|---|
| `id_servicio` | UUID (PK) | Identificador único |
| `nombre` | VARCHAR | Nombre: "Bomberos Cereté", "Policía Nacional", etc. |
| `id_rol_asignado` | UUID (FK → roles) | Rol que atiende este servicio |

#### `incidencias`
El núcleo del sistema. Cada reporte de emergencia.

| Campo | Tipo | Descripción |
|---|---|---|
| `id_incidencia` | UUID (PK) | Identificador único |
| `id_usuario` | UUID (FK → usuarios) | Quién reportó |
| `id_tipo_emergencia` | UUID (FK → tipos_emergencia) | Tipo de emergencia |
| `descripcion` | TEXT | Descripción detallada del evento |
| `latitud` | DECIMAL | Coordenada GPS (opcional) |
| `longitud` | DECIMAL | Coordenada GPS (opcional) |
| `direccion` | VARCHAR | Dirección textual (opcional) |
| `hay_heridos` | BOOLEAN | Indica si hay personas heridas |
| `cantidad_heridos` | INT | Número de heridos (si `hay_heridos` es true) |
| `prioridad` | ENUM | `normal` \| `alta` \| `critica` |
| `es_comunitario` | BOOLEAN | Si afecta a toda la comunidad |
| `estado` | ENUM | `pendiente` \| `en_proceso` \| `resuelta` |
| `fecha_reporte` | DATETIME | Fecha y hora automática del reporte |

#### `incidencia_servicios`
Relación muchos a muchos entre incidencias y servicios requeridos. Además registra si el servicio aceptó.

| Campo | Tipo | Descripción |
|---|---|---|
| `id_incidencia` | UUID (FK) | Incidencia |
| `id_servicio` | UUID (FK) | Servicio requerido |
| `aceptada` | BOOLEAN | Si el servicio aceptó responder |
| `aceptada_en` | DATETIME | Cuándo aceptó (timestamp automático) |

#### `historial_estados`
Registro inmutable de cada cambio de estado de una incidencia.

| Campo | Tipo | Descripción |
|---|---|---|
| `id_historial` | UUID (PK) | Identificador único |
| `id_incidencia` | UUID (FK) | Incidencia modificada |
| `estado_anterior` | VARCHAR | Estado antes del cambio |
| `estado_nuevo` | VARCHAR | Estado después del cambio |
| `id_usuario` | UUID (FK) | Quién realizó el cambio |
| `fecha_cambio` | DATETIME | Cuándo ocurrió el cambio |

### 6.2 Sistema de migraciones

La base de datos se construye mediante **12 archivos SQL versionados** que se ejecutan en orden con el comando `npm run migrate`. Las migraciones son idempotentes (si ya están aplicadas, las omite sin error). Este sistema garantiza que cualquier persona pueda replicar el entorno exacto desde cero en minutos.

```
001_create_roles.sql
002_create_usuarios.sql
003_create_tipos_emergencia.sql
004_create_incidencias.sql
005_create_servicios_publicos.sql
006_create_incidencia_servicios.sql
007_create_historial_estados.sql
008_seed_data.sql              ← Roles, servicios y tipos de emergencia iniciales
009_add_telefono_usuarios.sql
010_add_heridos_incidencias.sql
011_add_avatar_seed_usuarios.sql
012_add_aceptada_incidencia_servicios.sql
```

---

## 7. Módulos Implementados

### 7.1 Módulo de Autenticación

**Registro** (`POST /auth/register`):
- El usuario proporciona: nombre, correo, contraseña, localidad y teléfono
- La localidad se valida contra el listado oficial de barrios de Cereté
- El correo se verifica que no exista previamente en la BD
- La contraseña se hashea con **bcrypt (12 rondas de salt)**
- El rol asignado por defecto es siempre **Ciudadano**
- Se genera un `avatar_seed` aleatorio (UUID) para el avatar inicial
- Tras el registro, se hace login automático y se retornan los tokens

**Login** (`POST /auth/login`):
- Recibe correo y contraseña
- Busca el usuario por correo, verifica que esté activo
- Compara la contraseña con el hash almacenado usando `bcrypt.compare()`
- Genera dos tokens JWT:
  - **Access Token**: expira en 24 horas, contiene `{ id, correo, rol, localidad }`
  - **Refresh Token**: expira en 7 días, se usa para renovar el access token sin re-login
- Retorna los tokens y los datos del usuario (sin contraseña)

**Refresh Token** (`POST /auth/refresh`):
- Recibe el refresh token
- Lo verifica y extrae el payload
- Genera un nuevo access token
- Implementado de forma transparente en el interceptor de Axios del mobile: cuando una petición falla con 401, la app intenta el refresh automáticamente y reintenta la petición original

**Almacenamiento de tokens en el mobile**:
- Los tokens se guardan en **Expo SecureStore**, que usa el almacenamiento cifrado del sistema operativo (Keychain en iOS, Keystore en Android)
- No se guardan en AsyncStorage ni memoria volátil
- Al abrir la app, `loadSession()` recupera los tokens del SecureStore y restaura la sesión

### 7.2 Módulo de Usuarios

**Gestión de usuarios (Admin)**:
- Listar todos los usuarios con su rol, localidad, estado y fecha de registro
- Ver el detalle de un usuario específico
- Cambiar el rol de un usuario con validaciones de negocio:
  - Solo puede haber **un Bombero, un Policía y un Paramédico activos** globalmente
  - Solo puede haber **un Representante activo por localidad**
  - Si ya existe un usuario activo con ese rol, el sistema lanza error descriptivo
- Activar o desactivar usuarios (soft delete)
- Un usuario desactivado no puede iniciar sesión

**Edición de perfil (cualquier usuario)**:
- Cualquier usuario puede editar su propio nombre y teléfono
- Solo el propio usuario o un Admin pueden modificar los datos de un perfil
- La localidad y el rol no son editables por el propio usuario

**Cambio de contraseña**:
- Requiere proporcionar la contraseña actual para verificación
- Si la contraseña actual no coincide con el hash en BD, se rechaza con error descriptivo
- La nueva contraseña se hashea con bcrypt antes de guardarse
- El token JWT activo sigue siendo válido tras el cambio (no hay logout forzoso)

**Avatares**:
- Cada usuario tiene un `avatar_seed` (cadena de texto arbitraria)
- El avatar se genera dinámicamente usando la API de DiceBear:
  `https://api.dicebear.com/9.x/adventurer/png?seed=<avatar_seed>&size=<tamaño>`
- El usuario puede elegir entre una galería de 16 seeds predefinidos desde su perfil
- El avatar cambia visualmente en toda la app en tiempo real al guardarse

### 7.3 Módulo de Tipos de Emergencia

Configurable exclusivamente por el Admin. Define las categorías de emergencias que los ciudadanos pueden seleccionar al crear un reporte.

**Tipos de emergencia predefinidos en el seed inicial:**
- 🌊 Inundación
- 🔥 Incendio forestal
- 🏔️ Derrumbe o deslizamiento
- ⚡ Tormenta eléctrica severa
- ☣️ Derrame de sustancias peligrosas
- 💧 Contaminación de fuentes de agua
- 🌪️ Vendaval o tornado
- 🌫️ Contaminación del aire

Cada tipo tiene nombre, descripción e ícono (nombre del ícono de la librería **Ionicons**). El Admin puede crear nuevos tipos, editarlos o eliminarlos. La app mobile resuelve el ícono a mostrar usando una función `resolveIcon(icono, nombre)` que actúa como fuente única de verdad para la iconografía, tanto en el listado de incidencias como en el selector al crear un reporte.

### 7.4 Módulo de Incidencias

El módulo central del sistema.

#### Crear incidencia (`POST /incidents`)
Los datos que el usuario envía:
- `id_tipo_emergencia`: UUID del tipo seleccionado
- `descripcion`: texto libre describiendo la emergencia
- `direccion`: dirección textual (opcional si hay coordenadas)
- `latitud` / `longitud`: coordenadas GPS (opcionales)
- `hay_heridos`: booleano
- `cantidad_heridos`: número (si `hay_heridos` es true)
- `id_servicios`: array de UUIDs de los servicios públicos requeridos
- `es_comunitario`: booleano (si el evento afecta a toda la comunidad)

**Lógica de prioridad automática:**
- Si el reportante es **Representante de Localidad** → prioridad `"alta"`
- Si el reportante es **Ciudadano** → prioridad `"normal"`
- La prioridad `"critica"` está reservada para asignación futura o escalamiento manual

#### Listar incidencias (`GET /incidents`)
El filtrado se aplica en el servidor según el rol del token:

| Rol | Incidencias que ve |
|---|---|
| Admin | Todas sin excepción |
| Representante | Las suyas + todas las de usuarios de su localidad |
| Ciudadano | Solo las que él mismo creó |
| Bombero/Policía/Paramédico | Solo las que incluyen a su servicio como requerido |

Para los responders, el ordenamiento es: **prioridad descendente** (alta primero) y luego **fecha descendente** (más recientes primero).

Soporta filtros opcionales vía query params: `?prioridad=alta`, `?estado=pendiente`.

#### Ver detalle (`GET /incidents/:id`)
Retorna la incidencia completa incluyendo:
- Todos los datos del reporte
- Los servicios requeridos con su estado de aceptación (`aceptada: true/false`, `aceptada_en`)
- El nombre del rol responsable de cada servicio
- Los datos del usuario que reportó

#### Cambiar estado (`PATCH /incidents/:id/status`)
Estados posibles: `pendiente` → `en_proceso` → `resuelta`

Validaciones:
- Los responders solo pueden cambiar el estado si su servicio está asignado en esa incidencia
- El Admin y el Representante pueden cambiar el estado de cualquier incidencia de su alcance
- Cada cambio de estado genera un registro en `historial_estados` con el usuario responsable y el timestamp

#### Aceptar incidencia (`PATCH /incidents/:id/accept`)
Solo disponible para Bombero, Policía y Paramédico.
- Verifica que el rol del responder tenga un servicio asignado en esa incidencia
- Actualiza `aceptada = TRUE` y `aceptada_en = NOW()` en `incidencia_servicios`
- En el mobile, al aceptar aparece un **modal de confirmación** con:
  - Icono y colores de la marca del servicio (rojo para bomberos, azul para policía, ámbar para paramédicos)
  - Mensaje profesional de despacho de unidad
- Los chips de servicios en las tarjetas de incidencia reflejan el estado de aceptación con colores de marca

#### Historial de estados (`GET /incidents/:id/history`)
Retorna el registro cronológico completo de todos los cambios de estado de una incidencia, con el nombre del usuario que realizó cada cambio y el timestamp exacto.

### 7.5 Módulo de Estadísticas (Admin)

Panel exclusivo del Admin con métricas globales del sistema:

**Métricas calculadas:**
- Total de incidencias registradas
- Incidencias por estado: pendientes, en proceso, resueltas
- Incidencias por prioridad: normal, alta, crítica
- Incidencias por tipo de emergencia (ranking de más a menos frecuente)
- Total de usuarios activos en el sistema

**Exportación a PDF:**
El Admin puede exportar el reporte de estadísticas en formato PDF directamente desde la app, usando la librería `expo-print` y `expo-sharing`. El PDF incluye el resumen de métricas y se puede compartir por cualquier canal del dispositivo.

### 7.6 Módulo de Perfil

Cada usuario tiene acceso a su perfil personal con tres secciones:

1. **Avatar** — Selector visual de 16 avatares predefinidos (DiceBear). Toca el avatar → abre modal con galería, vista previa y botón guardar.

2. **Mis datos** (editable):
   - Nombre completo
   - Teléfono
   - Se edita desde un bottom sheet con validación y feedback de error

3. **Mi cuenta** (solo lectura):
   - Correo electrónico
   - Localidad
   - Rol asignado

4. **Seguridad**:
   - Cambiar contraseña: requiere contraseña actual, nueva contraseña (mínimo 6 caracteres) y confirmación
   - Si la contraseña actual es incorrecta, el backend responde con error descriptivo
   - Al cambiar exitosamente, aparece un modal de confirmación con diseño personalizado

---

## 8. Flujos de Usuario por Rol

### 8.1 Flujo del Ciudadano

```
Abre la app
  → Pantalla de carga (loadSession)
  → Si tiene sesión guardada → Dashboard
  → Si no → Pantalla de Login

Login / Registro
  → Ingresa credenciales o se registra (localidad obligatoria)
  → Al autenticarse → Dashboard con tab bar

Dashboard (Home)
  → Ve sus incidencias con estado actual
  → Puede filtrar por estado
  → Toca una incidencia → Detalle completo con historial

Crear incidencia (botón + en tab bar)
  → Selecciona tipo de emergencia (con ícono)
  → Escribe descripción
  → Activa GPS o escribe dirección
  → Marca si hay heridos y cuántos
  → Selecciona servicios requeridos (checkboxes)
  → Marca si es comunitario
  → Envía → Confirmación → Regresa al listado

Perfil
  → Edita nombre y teléfono
  → Cambia avatar
  → Cambia contraseña
  → Cierra sesión
```

### 8.2 Flujo del Responder (Bombero / Policía / Paramédico)

```
Login → Dashboard
  → Ve SOLO las incidencias que requieren su servicio
  → Ordenadas por prioridad (alta primero) y fecha (nuevas primero)
  → Indicadores visuales de prioridad en cada tarjeta

Ver una incidencia
  → Toca "Aceptar" → Modal de confirmación de despacho
  → El chip de su servicio cambia a color de marca (confirmado)
  → Puede cambiar el estado: pendiente → en proceso → resuelta
  → En incidencias resueltas, los botones de acción se ocultan

Detalle de incidencia
  → Ve ubicación, descripción, tipo, heridos, prioridad
  → Ve chips de todos los servicios requeridos con su estado
  → Ve el historial cronológico de cambios de estado
```

### 8.3 Flujo del Representante de Localidad

```
Login → Dashboard
  → Ve sus propias incidencias + todas las de su localidad
  → Sus reportes tienen prioridad "alta" automáticamente
  → Puede supervisar el estado de todas las incidencias de su barrio

Gestión de incidencias
  → Puede cambiar el estado de las incidencias de su localidad
  → Ve los servicios que han aceptado y los que no
  → Revisa el historial de cambios
```

### 8.4 Flujo del Admin

```
Login → Dashboard
  → Ve TODAS las incidencias del sistema
  → Puede filtrar por estado y prioridad

Gestión de usuarios (pestaña dedicada)
  → Lista todos los usuarios
  → Cambia roles (con validación de unicidad)
  → Activa o desactiva cuentas

Tipos de emergencia (pestaña dedicada)
  → Crea nuevos tipos con nombre, ícono y descripción
  → Edita los existentes
  → Elimina los que no se usan

Estadísticas (pestaña dedicada)
  → Ve métricas globales del sistema
  → Exporta el reporte en PDF

Incidencias
  → Puede cambiar el estado de cualquier incidencia
  → Ve los servicios asignados y su estado de aceptación
  → Consulta el historial completo
```

---

## 9. Diseño y Experiencia de Usuario

### 9.1 Sistema de diseño

EcoAlert tiene un diseño coherente basado en los siguientes principios:

**Paleta de colores:**
- Verde primario: `#15803d` / `#16a34a` (acciones principales, confirmaciones)
- Fondo de header: degradado `#dcfce7 → #f0fdf4 → #ffffff` (mint suave)
- Fondo de pantalla: `#f8faf9` (gris muy claro)
- Tarjetas: `#ffffff` con `borderColor: #f0f0f0` y sombra sutil
- Error/peligro: `#dc2626` (rojo)
- Seguridad/contraseña: `#7c3aed` (violeta)

**Colores de marca por servicio público:**
- Bombero: `#dc2626` (rojo) — chips con fondo `#fef2f2`
- Policía: `#2563eb` (azul) — chips con fondo `#eff6ff`
- Paramédico: `#d97706` (ámbar) — chips con fondo `#fffbeb`

**Colores por rol (badge en perfil y home):**
Cada rol tiene un color asociado que aparece en el badge de rol del header.

**Componentes visuales clave:**
- **Cards**: tarjetas blancas con `borderRadius: 16`, borde sutil y sombra `elevation: 2`
- **Bottom sheets**: modales que aparecen desde abajo con `borderTopRadius: 28` y manija visual
- **Gradientes**: botones primarios con `LinearGradient` verde; botón de contraseña con violeta
- **Blobs decorativos**: círculos semitransparentes en los headers para dar profundidad
- **Tab bar**: línea degradada verde en la parte superior de la barra de navegación

### 9.2 Navegación

La app usa **Expo Router** con dos grupos de rutas:
- `(auth)/`: rutas públicas accesibles sin autenticación (login, registro)
- `(tabs)/`: rutas protegidas que solo muestran las pestañas correspondientes al rol del usuario activo

El tab bar no muestra las mismas pestañas para todos:
- **Ciudadano**: Inicio, Crear, Perfil
- **Responders**: Inicio, Perfil
- **Representante**: Inicio, Crear, Perfil
- **Admin**: Inicio, Usuarios, Tipos, Estadísticas, Perfil

### 9.3 Manejo de errores en la UI

- Los errores del API se muestran en banners rojos dentro del modal o pantalla correspondiente, nunca como `Alert` del sistema (excepto para confirmaciones simples que usan el modal personalizado).
- El mensaje de error viene del backend (`err.response.data.message`) para que sea descriptivo y contextual.
- Los estados de carga se muestran con `ActivityIndicator` dentro del botón que los desencadena, sin bloquear el resto de la pantalla.

---

## 10. Seguridad

### 10.1 Autenticación con JWT

- Se usan dos tokens: **Access Token** (corta duración: 24h) y **Refresh Token** (larga duración: 7 días)
- El Access Token contiene el `id`, `correo`, `rol` y `localidad` del usuario
- Cada petición autenticada envía el token en el header `Authorization: Bearer <token>`
- El backend verifica la firma y la expiración del token en cada request
- Si el access token expira, el interceptor de Axios intenta el refresh automáticamente sin interrumpir al usuario
- Si el refresh token también expira, se emite un evento `session-expired` que cierra la sesión y redirige al login

### 10.2 Protección de contraseñas

- Las contraseñas **nunca se almacenan en texto plano**
- Se usa **bcryptjs con 12 rondas de salt**, lo que hace que cada hash sea único aunque dos usuarios tengan la misma contraseña
- Al cambiar contraseña, se verifica la actual antes de guardar la nueva

### 10.3 Autorización en el servidor

- El control de acceso se verifica **siempre en el servidor**, nunca solo en el cliente
- Ocultar un botón en la UI no es seguridad — el backend rechaza cualquier petición no autorizada aunque el cliente intente hacerla directamente
- El rol del usuario viene del token JWT (firmado por el servidor), no del cuerpo de la petición

### 10.4 Almacenamiento seguro en el dispositivo

- Los tokens se guardan en **Expo SecureStore**, que usa la enclave segura del sistema operativo
- No se guarda información sensible en AsyncStorage (texto plano en el dispositivo)

---

## 11. API REST — Especificación Completa

### Base URL: `/api/v1`

### Formato de respuesta estándar
Todas las respuestas siguen el mismo formato:
```json
{
  "success": true | false,
  "message": "Descripción del resultado",
  "data": { ... } | null
}
```

### Auth
| Método | Ruta | Body | Respuesta | Auth |
|---|---|---|---|---|
| POST | `/auth/register` | `{ nombre, correo, contrasena, localidad, telefono }` | `{ accessToken, refreshToken, usuario }` | No |
| POST | `/auth/login` | `{ correo, contrasena }` | `{ accessToken, refreshToken, usuario }` | No |
| POST | `/auth/refresh` | `{ refreshToken }` | `{ accessToken, refreshToken }` | No |

### Usuarios
| Método | Ruta | Body | Descripción | Rol requerido |
|---|---|---|---|---|
| GET | `/users` | — | Listar todos los usuarios | Admin |
| GET | `/users/:id` | — | Ver usuario por ID | Admin / Propio |
| PATCH | `/users/:id` | `{ nombre?, telefono?, contrasena?, contrasena_actual? }` | Editar perfil | Admin / Propio |
| PATCH | `/users/:id/role` | `{ id_rol }` | Cambiar rol | Admin |
| PATCH | `/users/:id/status` | `{ estado: boolean }` | Activar/desactivar | Admin |
| PATCH | `/users/me/avatar` | `{ seed }` | Cambiar avatar | Propio |

### Incidencias
| Método | Ruta | Body | Descripción | Rol requerido |
|---|---|---|---|---|
| GET | `/incidents` | — | Listar incidencias (filtrado por rol) | Todos |
| GET | `/incidents/:id` | — | Detalle de incidencia | Todos |
| POST | `/incidents` | `{ id_tipo_emergencia, descripcion, direccion?, latitud?, longitud?, hay_heridos, cantidad_heridos?, id_servicios[], es_comunitario }` | Crear incidencia | Admin, Representante, Ciudadano |
| PATCH | `/incidents/:id/status` | `{ estado }` | Cambiar estado | Admin, Representante, Responders* |
| PATCH | `/incidents/:id/accept` | — | Aceptar como responder | Responders |
| GET | `/incidents/:id/history` | — | Historial de estados | Todos |

### Tipos de Emergencia
| Método | Ruta | Body | Descripción | Rol requerido |
|---|---|---|---|---|
| GET | `/emergency-types` | — | Listar tipos activos | Todos |
| POST | `/emergency-types` | `{ nombre, icono, descripcion }` | Crear tipo | Admin |
| PATCH | `/emergency-types/:id` | `{ nombre?, icono?, descripcion?, activo? }` | Editar tipo | Admin |
| DELETE | `/emergency-types/:id` | — | Eliminar tipo | Admin |

### Servicios y Roles
| Método | Ruta | Descripción | Rol requerido |
|---|---|---|---|
| GET | `/services` | Listar servicios públicos disponibles | Todos |
| GET | `/roles` | Listar roles del sistema | Admin |

---

## 12. Colección de Testing (Bruno)

El proyecto incluye una colección completa de testing de API en **Bruno** (alternativa open source a Postman), ubicada en `bruno-collection/`.

**Organización de la colección:**
```
bruno-collection/
├── environments/
│   └── local.bru          ← Variables: base_url, access_token, refresh_token, user_id, incident_id
├── health.bru             ← GET /health
├── auth/
│   ├── register.bru
│   ├── login.bru          ← Guarda automáticamente los tokens en variables
│   ├── refresh.bru
│   └── me.bru
├── incidents/
│   ├── get-all-incidents.bru
│   ├── get-incident-by-id.bru
│   ├── create-incident.bru  ← Guarda incident_id automáticamente
│   ├── change-status.bru
│   ├── accept-incident.bru
│   └── get-history.bru
├── emergency-types/
│   ├── get-all-types.bru
│   ├── create-type.bru
│   ├── update-type.bru
│   └── delete-type.bru
├── users/
│   ├── get-all-users.bru
│   ├── get-user-by-id.bru
│   ├── update-user.bru
│   ├── update-profile.bru
│   ├── change-password.bru
│   ├── update-avatar.bru
│   ├── update-user-role.bru
│   ├── toggle-user-status.bru
│   ├── get-all-roles.bru
│   └── deactivate-user.bru
└── services/
    └── get-all-services.bru
```

**Funcionalidad de scripting en Bruno:**
El archivo `login.bru` tiene un script post-respuesta que guarda automáticamente el `access_token`, `refresh_token` y `user_id` en las variables de entorno, de manera que todos los demás requests los usan sin necesidad de copiarlos manualmente.

---

## 13. Estado Actual del Proyecto

### ✅ Completado (100% funcional)

| Módulo / Funcionalidad | Estado |
|---|---|
| Sistema de autenticación (registro, login, refresh, logout) | ✅ Completo |
| Control de acceso por roles (RBAC — 6 roles) | ✅ Completo |
| Dashboard diferenciado por rol | ✅ Completo |
| Crear incidencia con tipo, descripción, ubicación y servicios | ✅ Completo |
| Listado de incidencias filtrado por rol | ✅ Completo |
| Priorización automática (Representante = alta, Ciudadano = normal) | ✅ Completo |
| Detalle de incidencia con historial de estados | ✅ Completo |
| Cambio de estado con registro en historial | ✅ Completo |
| Botón "Aceptar" para responders con modal de confirmación | ✅ Completo |
| Chips de servicios con colores de marca por estado de aceptación | ✅ Completo |
| Gestión de usuarios — Admin (listar, cambiar rol, activar/desactivar) | ✅ Completo |
| Tipos de emergencia — Admin (CRUD completo) | ✅ Completo |
| Estadísticas — Admin (métricas globales + exportar PDF) | ✅ Completo |
| Avatares personalizables (16 opciones con DiceBear) | ✅ Completo |
| Editar perfil (nombre y teléfono) | ✅ Completo |
| Cambiar contraseña (con verificación de actual) | ✅ Completo |
| Íconos de tipos de emergencia consistentes en toda la app | ✅ Completo |
| Validación de unicidad de roles de responder | ✅ Completo |
| Ordenamiento por prioridad para responders | ✅ Completo |
| useFocusEffect para datos frescos al navegar | ✅ Completo |
| README con diagramas Mermaid y badges | ✅ Completo |
| Colección Bruno completa (todos los endpoints) | ✅ Completo |

### ⏳ Pendiente para entrega final

| Tarea | Descripción | Estimado |
|---|---|---|
| **Deploy backend** | Subir backend + MySQL a Railway (o Render) para que el APK funcione desde cualquier red | ~20-30 min |
| **Build APK** | Configurar EAS y generar el `.apk` instalable con la URL de producción | ~20-30 min |
| **Documentación universitaria** | Redacción formal del informe escrito del TCC (este documento sirve como guía) | Variable |

### ❌ Fuera del alcance (decisión del equipo)

| Funcionalidad | Razón |
|---|---|
| Notificaciones push | Requiere Firebase Cloud Messaging, se pospone para versión futura |
| Mapa interactivo con incidencias | Post-MVP (v1.1) |
| Fotos adjuntas al reporte | Post-MVP (v1.1) |
| Chat ciudadano-responder | Post-MVP (v1.1) |

---

## 14. Lógica de Negocio — Reglas Clave

Este apartado consolida las reglas de negocio más importantes para la documentación universitaria:

1. **Un ciudadano solo ve sus propios reportes.** No puede ver los reportes de otros ciudadanos, incluso si son del mismo barrio. Esto protege la privacidad y evita información cruzada innecesaria.

2. **Un representante ve todo su territorio.** Tiene visibilidad total de las incidencias de su localidad porque representa a la comunidad y necesita hacer seguimiento colectivo.

3. **La prioridad es automática e inmutable por el usuario.** Un ciudadano no puede marcar su incidencia como "alta prioridad". Esa distinción la otorga el rol: ser Representante implica que sus reportes son prioritarios por definición de su cargo.

4. **Un responder solo atiende lo que le corresponde.** Un bombero no debe ver incidencias que solo requieren policía. Esto reduce la carga cognitiva y permite enfocarse en lo relevante.

5. **Aceptar es diferente a atender.** "Aceptar" significa que el servicio confirmó que enviará una unidad. Es el primer paso. Cambiar el estado a "en proceso" es la confirmación de que ya está actuando. Son dos acciones distintas.

6. **El historial es inmutable.** Una vez registrado un cambio de estado, no se puede borrar ni modificar. Esto garantiza trazabilidad y auditoría del proceso de respuesta.

7. **Solo un responder por servicio.** El sistema garantiza que no haya dos bomberos activos simultáneamente, porque el módulo de respuesta está diseñado para una unidad de servicio por rol. Si se necesita escalar, el administrador desactiva uno y activa otro.

8. **La contraseña actual siempre se verifica antes de cambiarla.** Incluso si el usuario está autenticado, debe demostrar que conoce su contraseña actual para cambiarla. Esto evita que alguien que tomó prestado el celular desbloqueado pueda cambiar credenciales.

9. **Las migraciones son idempotentes.** Si una migración ya fue aplicada, el sistema la omite sin error. Esto permite ejecutar `npm run migrate` en cualquier momento sin riesgo.

10. **Los tokens nunca viajan en el body del request.** Solo van en el header `Authorization: Bearer`, nunca en parámetros de URL ni en el cuerpo. Esto es una práctica estándar de seguridad en APIs REST.

---

## 15. Configuración del Entorno de Desarrollo

### Variables de entorno — Backend (`.env`)
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=ecoalert_db

JWT_SECRET=dev_secret_key
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=dev_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=7d

BCRYPT_SALT_ROUNDS=12
```

### Variables de entorno — Mobile (`.env`)
```env
EXPO_PUBLIC_API_URL=http://192.168.X.X:3000/api/v1
LOCAL_IP=192.168.X.X
```

> La IP local cambia según la red. Se obtiene con `ip addr show` (Linux) o `ipconfig` (Windows).

### Comandos de desarrollo

**Backend:**
```bash
cd backend
npm install
npm run migrate    # Crea las tablas y el usuario admin
npm run dev        # Servidor en modo desarrollo (hot reload)
```

**Mobile:**
```bash
cd mobile
npm install
npm start          # Inicia Expo (escanear QR con Expo Go)
```

**Infraestructura:**
```bash
cd infrastructure/docker
docker compose up -d    # Levanta MySQL + phpMyAdmin
```

---

*Documento generado durante el desarrollo del TCC — Ingeniería de Software, 5.º semestre.*
*Universidad de Cartagena · Cereté, Córdoba, Colombia · 2025*
