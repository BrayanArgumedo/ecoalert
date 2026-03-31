# EcoAlert - Plan de Desarrollo Completo

## 🎯 Visión del Proyecto

Desarrollar una aplicación móvil multiplataforma orientada a la gestión de emergencias ambientales, cuyo propósito es conectar a ciudadanos afectados por eventos catastróficos con los servicios públicos de respuesta adecuados (bomberos, policía y asistencia médica), de manera ágil, priorizada e inteligente.

La problemática que aborda es la falta de un canal directo, organizado y eficiente entre la comunidad y los organismos de respuesta ante emergencias como terremotos, huracanes, inundaciones, derrumbes, entre otros. Actualmente estos reportes se hacen por llamadas telefónicas o medios informales, lo que genera desorganización, duplicidad de reportes y tiempos de respuesta elevados.

---

## 📋 Requisitos Funcionales

### Core Features (MVP)

1. **Sistema de Autenticación y Roles**
   - Registro e inicio de sesión con credenciales
   - Control de acceso por roles (RBAC)
   - 5 roles: Admin, Representante de Localidad, Ciudadano, Bombero, Policía, Paramédico
   - Tokens JWT con expiración controlada
   - Contraseñas encriptadas con Bcrypt

2. **Módulo de Incidencias**
   - Crear reporte de emergencia ambiental
   - Selección de tipo de falla ambiental (select con categorías predefinidas)
   - Soporte para múltiples tipos de falla simultáneos
   - Selección de servicios requeridos (checklist: bomberos, policía, paramédicos)
   - Adjuntar descripción detallada
   - Asignar ubicación (latitud/longitud o dirección)
   - Registro automático de fecha y hora
   - Sistema de prioridad (reporte de Representante tiene prioridad automática)
   - Estados: Pendiente → En proceso → Resuelta

3. **Módulo de Servicios Públicos (Responders)**
   - Los responders (Bombero, Policía, Paramédico) solo ven las incidencias que los requieren
   - Vista detallada de la incidencia: tipo, ubicación, descripción, prioridad
   - Capacidad de aceptar, rechazar o escalar una incidencia
   - Cambio de estado de la incidencia desde su panel

4. **Panel de Administración**
   - Gestión completa de usuarios (CRUD)
   - Gestión de categorías de emergencias ambientales
   - Vista de todas las incidencias activas
   - Cambio de estado de cualquier incidencia
   - Generación de reportes estadísticos
   - Acceso completo al sistema

5. **Módulo de Visualización**
   - Lista de incidencias con filtros por estado y categoría
   - Historial personal de reportes para el ciudadano
   - Panel de control diferenciado por rol
   - Estadísticas básicas (número de incidencias por categoría, tiempos de respuesta)

6. **Notificaciones**
   - Notificación al ciudadano cuando cambia el estado de su reporte
   - Notificación al responder cuando llega una nueva incidencia que lo requiere
   - Notificación de prioridad para reportes comunitarios

### Features Post-MVP

- Mapa interactivo con ubicación de incidencias activas
- Foto adjunta en el reporte de emergencia
- Chat entre ciudadano y responder asignado
- Panel de estadísticas avanzadas con gráficos
- Exportación de reportes en PDF
- Publicación en Google Play

---

## 🎨 Requisitos No Funcionales

### Seguridad
- Encriptación de contraseñas con Bcrypt (salt rounds: 12)
- JWT con expiración de 24h (access token) y 7 días (refresh token)
- Control de acceso basado en roles en cada endpoint del backend
- Input sanitization y validación en frontend y backend
- CORS configurado solo para el origen del cliente móvil

### Usabilidad
- Interfaz optimizada para situaciones de emergencia (botones grandes, flujo mínimo de pasos)
- Material Design adaptado a React Native via NativeWind
- Tiempo máximo de reporte: < 3 minutos desde que abre la app hasta que envía
- Feedback visual inmediato en cada acción del usuario
- Soporte offline básico: mostrar últimas incidencias en caché cuando no hay red

### Confiabilidad
- Backend corriendo en Docker Compose para entorno local reproducible
- Migraciones de base de datos versionadas con scripts SQL
- Manejo de errores global en backend (middleware de error handling)
- Validación de datos con Zod en backend y frontend

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile Client                             │
│              (React Native + Expo SDK 54)                   │
│  ┌─────────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Auth Screens   │  │  Incidents   │  │  Admin Panel  │  │
│  │  Login/Register │  │  Report/List │  │  Dashboard    │  │
│  └─────────────────┘  └──────────────┘  └───────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP/REST (Axios)
                            │ JWT en Authorization header
┌───────────────────────────▼─────────────────────────────────┐
│                    Node.js Backend                           │
│                 (Express + TypeScript)                       │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │               API Gateway Layer                     │    │
│  │  - Express Router                                   │    │
│  │  - Auth Middleware (JWT validation)                 │    │
│  │  - Role Guard Middleware (RBAC)                     │    │
│  │  - Error Handler Middleware                         │    │
│  │  - Request Validation (Zod)                         │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │  auth/   │ │incidents/│ │  users/  │ │notifications/│   │
│  │ handlers │ │ handlers │ │ handlers │ │   handlers   │   │
│  │ services │ │ services │ │ services │ │   services   │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Infrastructure Layer                   │    │
│  │  - MySQL Connection Pool (mysql2)                   │    │
│  │  - Query Builder                                    │    │
│  │  - Migrations runner                                │    │
│  └─────────────────────────────────────────────────────┘    │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                     Data Layer                               │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  MySQL (Docker Container)                           │    │
│  │  - roles                                            │    │
│  │  - usuarios                                         │    │
│  │  - tipos_emergencia                                 │    │
│  │  - incidencias                                      │    │
│  │  - incidencia_servicios                             │    │
│  │  - servicios_publicos                               │    │
│  │  - historial_estados                                │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológico Detallado

### Backend (Node.js)

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "@types/express": "^4.17.21",
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2",
    "ts-node-dev": "^2.0.0",

    "mysql2": "^3.6.5",

    "jsonwebtoken": "^9.0.2",
    "@types/jsonwebtoken": "^9.0.5",
    "bcryptjs": "^2.4.3",
    "@types/bcryptjs": "^2.4.6",

    "zod": "^3.22.4",

    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "@types/cors": "^2.8.17",

    "uuid": "^9.0.0",
    "@types/uuid": "^9.0.7"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "@types/jest": "^29.5.11",
    "ts-jest": "^29.1.1",
    "supertest": "^6.3.4",
    "@types/supertest": "^6.0.2"
  }
}
```

**Justificación de dependencias clave:**
- `express` — framework HTTP minimalista, ampliamente conocido y con ecosistema maduro
- `mysql2` — driver MySQL con soporte a Promises y mejor rendimiento que el driver original
- `jsonwebtoken` — implementación estándar de JWT para autenticación stateless
- `bcryptjs` — encriptación de contraseñas con salt automático, versión JS pura (sin dependencias nativas)
- `zod` — validación de schemas con TypeScript-first, runtime + compilación
- `ts-node-dev` — hot-reload para desarrollo en TypeScript sin compilación manual

### Mobile (React Native + Expo)

**Versiones correctas para Expo SDK 54 — estas versiones son OBLIGATORIAS y no deben modificarse:**

```json
{
  "dependencies": {
    "expo": "~54.0.0",
    "react": "19.1.0",
    "react-native": "0.81.5",

    "expo-router": "~6.0.23",
    "expo-linking": "~8.0.11",
    "expo-constants": "~18.0.13",
    "expo-splash-screen": "latest",
    "expo-status-bar": "~2.2.3",

    "react-native-screens": "~4.16.0",
    "react-native-reanimated": "~4.1.1",
    "react-native-worklets": "0.5.1",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-gesture-handler": "~2.28.0",

    "nativewind": "^4.0.0",
    "tailwindcss": "^3.4.0",

    "zustand": "^4.4.0",
    "axios": "^1.6.0",
    "react-native-mmkv": "^2.11.0",

    "expo-secure-store": "~14.0.1",
    "expo-notifications": "~0.29.0",

    "expo-linear-gradient": "~15.0.8",
    "expo-blur": "~15.0.8"
  }
}
```

**Justificación de dependencias clave:**
- `expo-router ~6.0.23` — navegación basada en archivos (file-based routing), misma convención que Next.js, elimina boilerplate de navigation stacks manuales
- `react-native-screens ~4.16.0` — OBLIGATORIO usar la versión 4.x, la 3.x no soporta la Nueva Arquitectura (Fabric) que usa React Native 0.81
- `react-native-reanimated ~4.1.1` + `react-native-worklets: 0.5.1` — en Reanimated v4 el motor de worklets fue extraído a un paquete separado; ambos deben instalarse juntos
- `nativewind` + `tailwindcss` — Tailwind CSS para React Native; requiere configuración en `metro.config.js` y `tailwind.config.js` desde el primer momento — sin eso la app no compila
- `zustand` — manejo de estado global simple, sin boilerplate de Redux, excelente soporte TypeScript
- `react-native-mmkv` — almacenamiento local ultrarrápido (C++), reemplaza AsyncStorage para datos frecuentes como tokens y preferencias. **Requiere config plugin en `app.json`** (ver sección de configuración de `app.json` más abajo)
- `expo-secure-store` — almacenamiento cifrado para tokens JWT en el dispositivo
- `expo-notifications` — notificaciones push; en Expo Go funciona sin configuración adicional para desarrollo, pero para producción y APK requiere FCM (Firebase Cloud Messaging) — ver nota en sección de Notificaciones
- `expo-linear-gradient ~15.0.8` — gradientes lineales para componentes visuales; necesario para cards, headers y elementos de UI con degradado
- `expo-blur ~15.0.8` — efecto de desenfoque (glassmorphism) para modales y overlays

### Configuración obligatoria de app.json (mobile/)

El `app.json` debe incluir los siguientes plugins desde el inicio, antes de correr la app por primera vez. Sin esto algunos paquetes crashean en build:

```json
{
  "expo": {
    "name": "EcoAlert",
    "slug": "ecoalert",
    "version": "1.0.0",
    "scheme": "ecoalert",
    "platforms": ["ios", "android"],
    "icon": "./assets/images/icon.png",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1a6b3a"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#1a6b3a"
      },
      "package": "com.ecoalert.app"
    },
    "plugins": [
      "expo-router",
      "expo-notifications",
      "react-native-mmkv"
    ]
  }
}
```

> `react-native-mmkv` **requiere el plugin** en `app.json` para compilar correctamente. Sin él crashea en build aunque `npm install` haya funcionado sin errores.

### Configuración obligatoria de NativeWind (mobile/)

NativeWind requiere que Metro esté configurado desde el inicio. Deben crearse los tres archivos siguientes **antes de la primera ejecución** de `npx expo start`. Sin ellos la app no compila.

**metro.config.js** (raíz de `mobile/`):
```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
```

**global.css** (raíz de `mobile/`):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**tailwind.config.js** (raíz de `mobile/`):
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1a6b3a",
        danger: "#dc2626",
        warning: "#f59e0b",
        info: "#2563eb"
      }
    }
  },
  plugins: []
};
```

### Nota sobre Notificaciones Push en producción

`expo-notifications` funciona en Expo Go durante desarrollo sin configuración adicional. Para el APK final (producción) se requiere:

1. Crear un proyecto en Firebase Console y obtener `google-services.json`
2. Colocar `google-services.json` en la raíz de `mobile/`
3. Agregar en `app.json` bajo `android`: `"googleServicesFile": "./google-services.json"`
4. El backend debe enviar notificaciones a través de FCM usando el token de dispositivo registrado por `expo-notifications`

Para el MVP y las entregas del TCC, las notificaciones funcionan correctamente en Expo Go sin necesidad de FCM. FCM solo es necesario para el APK firmado.

### Soporte offline — implementación técnica

El requisito de "mostrar últimas incidencias en caché" se implementa directamente en `useIncidents.ts`, sin módulo separado:

- Al hacer fetch exitoso, guardar en MMKV: `storage.set('incidents_cache', JSON.stringify(data))`
- Al iniciar la pantalla, cargar desde caché mientras se hace el fetch en paralelo: `const cached = storage.getString('incidents_cache')`
- Si el fetch falla por falta de red, mostrar datos del caché con un banner: "Sin conexión — mostrando datos guardados"
- Este patrón es stale-while-revalidate: muestra datos viejos inmediatamente y los actualiza cuando llega la red


### Base de Datos

- MySQL 8.0 (via Docker)
- Diseño normalizado con integridad referencial
- Migraciones versionadas en scripts SQL

### Testing de API

- **Bruno** — cliente de API Git-friendly y offline-first, alternativa a Postman
  - Las colecciones se guardan directamente en el filesystem como archivos `.bru` (texto plano)
  - Se versionan junto al código en Git
  - Soporta environments (local, staging), variables, scripts pre/post request y assertions
  - CLI disponible: `npm install -g @usebruno/cli` → `bru run --env local`
  - Carpeta de colección: `bruno-collection/` en la raíz del proyecto

### Entorno de Desarrollo

- Docker + Docker Compose para MySQL y entorno reproducible
- `ts-node-dev` con hot-reload para el backend
- Expo Go SDK 54 en dispositivo físico para el frontend
- Bruno desktop para testing de la API durante desarrollo

---

## 📁 Estructura del Proyecto

```
ecoalert/
│
├── backend/                                  # 🟢 Node.js + Express API
│   ├── src/
│   │   ├── main.ts                           # Entry point — inicializa Express, middlewares, rutas
│   │   ├── config.ts                         # Configuración centralizada (env vars, constantes)
│   │   │
│   │   ├── core/                             # Funcionalidad central compartida
│   │   │   ├── middleware/
│   │   │   │   ├── auth.middleware.ts        # Valida JWT en cada request protegido
│   │   │   │   ├── role.middleware.ts        # Guard de roles (RBAC) por endpoint
│   │   │   │   ├── error.middleware.ts       # Handler global de errores Express
│   │   │   │   ├── validate.middleware.ts    # Validación de body/params con Zod
│   │   │   │   └── cors.middleware.ts        # Configuración de CORS
│   │   │   ├── guards/
│   │   │   │   └── roles.guard.ts            # Lógica de verificación de rol por recurso
│   │   │   └── types/
│   │   │       ├── index.ts                  # Tipos globales compartidos
│   │   │       └── express.d.ts              # Extensión del tipo Request de Express (user payload)
│   │   │
│   │   ├── features/                         # Módulos por dominio de negocio
│   │   │   │
│   │   │   ├── auth/                         # Autenticación y sesión
│   │   │   │   ├── handlers/
│   │   │   │   │   ├── login.handler.ts      # POST /auth/login
│   │   │   │   │   ├── register.handler.ts   # POST /auth/register
│   │   │   │   │   └── refresh.handler.ts    # POST /auth/refresh
│   │   │   │   ├── services/
│   │   │   │   │   └── auth.service.ts       # Lógica de negocio: validar credenciales, emitir tokens
│   │   │   │   ├── schemas/
│   │   │   │   │   └── auth.schema.ts        # Schemas Zod para validar body de login y register
│   │   │   │   └── auth.routes.ts            # Definición de rutas del módulo auth
│   │   │   │
│   │   │   ├── incidents/                    # Incidencias — core del sistema
│   │   │   │   ├── handlers/
│   │   │   │   │   ├── create.handler.ts     # POST /incidents
│   │   │   │   │   ├── list.handler.ts       # GET /incidents (filtros por rol automáticos)
│   │   │   │   │   ├── detail.handler.ts     # GET /incidents/:id
│   │   │   │   │   ├── update-status.handler.ts  # PATCH /incidents/:id/status
│   │   │   │   │   └── my-incidents.handler.ts   # GET /incidents/mine (ciudadano)
│   │   │   │   ├── services/
│   │   │   │   │   ├── incident.service.ts   # Lógica de creación, priorización, filtrado por rol
│   │   │   │   │   └── status.service.ts     # Gestión de cambios de estado + historial
│   │   │   │   ├── schemas/
│   │   │   │   │   └── incident.schema.ts    # Validación Zod del body de incidencia
│   │   │   │   └── incidents.routes.ts
│   │   │   │
│   │   │   ├── users/                        # Gestión de usuarios (Admin)
│   │   │   │   ├── handlers/
│   │   │   │   │   ├── list.handler.ts       # GET /users
│   │   │   │   │   ├── detail.handler.ts     # GET /users/:id
│   │   │   │   │   ├── create.handler.ts     # POST /users
│   │   │   │   │   ├── update.handler.ts     # PUT /users/:id
│   │   │   │   │   └── delete.handler.ts     # DELETE /users/:id
│   │   │   │   ├── services/
│   │   │   │   │   └── user.service.ts
│   │   │   │   ├── schemas/
│   │   │   │   │   └── user.schema.ts
│   │   │   │   └── users.routes.ts
│   │   │   │
│   │   │   ├── emergency-types/              # Categorías de emergencias (Admin)
│   │   │   │   ├── handlers/
│   │   │   │   │   ├── list.handler.ts       # GET /emergency-types
│   │   │   │   │   ├── create.handler.ts     # POST /emergency-types
│   │   │   │   │   ├── update.handler.ts     # PUT /emergency-types/:id
│   │   │   │   │   └── delete.handler.ts     # DELETE /emergency-types/:id
│   │   │   │   ├── services/
│   │   │   │   │   └── emergency-type.service.ts
│   │   │   │   └── emergency-types.routes.ts
│   │   │   │
│   │   │   ├── notifications/                # Notificaciones de cambio de estado
│   │   │   │   ├── handlers/
│   │   │   │   │   └── list.handler.ts       # GET /notifications (del usuario autenticado)
│   │   │   │   ├── services/
│   │   │   │   │   └── notification.service.ts  # Crear y listar notificaciones
│   │   │   │   └── notifications.routes.ts
│   │   │   │
│   │   │   └── reports/                      # Reportes estadísticos (Admin)
│   │   │       ├── handlers/
│   │   │       │   └── stats.handler.ts      # GET /reports/stats
│   │   │       ├── services/
│   │   │       │   └── report.service.ts     # Queries de agregación sobre incidencias
│   │   │       └── reports.routes.ts
│   │   │
│   │   ├── infrastructure/                   # Capa de infraestructura
│   │   │   └── database/
│   │   │       ├── connection.ts             # Pool de conexiones MySQL2
│   │   │       ├── query.ts                  # Helper para ejecutar queries con tipado
│   │   │       └── migrations/
│   │   │           ├── 001_create_roles.sql
│   │   │           ├── 002_create_usuarios.sql
│   │   │           ├── 003_create_tipos_emergencia.sql
│   │   │           ├── 004_create_incidencias.sql
│   │   │           ├── 005_create_servicios_publicos.sql
│   │   │           ├── 006_create_incidencia_servicios.sql
│   │   │           ├── 007_create_historial_estados.sql
│   │   │           └── 008_seed_data.sql     # Datos iniciales: roles, tipos de emergencia, admin
│   │   │
│   │   └── shared/                           # Utilidades compartidas
│   │       ├── utils/
│   │       │   ├── jwt.ts                    # Helpers para firmar y verificar tokens
│   │       │   ├── bcrypt.ts                 # Helpers para hashear y comparar contraseñas
│   │       │   └── response.ts               # Helpers para respuestas HTTP estandarizadas
│   │       └── constants.ts                  # Constantes globales (roles, estados, etc.)
│   │
│   ├── tests/
│   │   ├── integration/
│   │   │   ├── auth.test.ts
│   │   │   └── incidents.test.ts
│   │   └── unit/
│   │       ├── auth.service.test.ts
│   │       └── incident.service.test.ts
│   │
│   ├── .env                                  # Variables de entorno (NO commitear)
│   ├── .env.example                          # Template de variables de entorno
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── mobile/                                   # 📱 React Native + Expo SDK 54
│   ├── app/                                  # Expo Router — file-based routing
│   │   ├── (auth)/                           # Grupo de rutas sin tab bar
│   │   │   ├── _layout.tsx                   # Stack navigator para auth
│   │   │   ├── login.tsx                     # Pantalla de inicio de sesión
│   │   │   └── register.tsx                  # Pantalla de registro
│   │   │
│   │   ├── (tabs)/                           # Grupo de rutas con tab bar (post-login)
│   │   │   ├── _layout.tsx                   # Tab navigator con tabs según rol
│   │   │   ├── home.tsx                      # Dashboard principal (diferenciado por rol)
│   │   │   ├── incidents.tsx                 # Lista de incidencias (filtrada por rol)
│   │   │   ├── report.tsx                    # Formulario de reporte (solo Ciudadano/Representante)
│   │   │   └── profile.tsx                   # Perfil del usuario
│   │   │
│   │   ├── incidents/
│   │   │   └── [id].tsx                      # Detalle de una incidencia
│   │   │
│   │   ├── admin/                            # Rutas solo accesibles por Admin
│   │   │   ├── _layout.tsx
│   │   │   ├── users.tsx                     # Gestión de usuarios
│   │   │   ├── emergency-types.tsx           # Gestión de categorías
│   │   │   └── stats.tsx                     # Estadísticas del sistema
│   │   │
│   │   ├── _layout.tsx                       # Root layout: auth guard, fuentes, splash
│   │   └── index.tsx                         # Redirect inicial basado en estado de autenticación
│   │
│   ├── src/
│   │   ├── core/                             # Funcionalidad central del cliente
│   │   │   ├── services/
│   │   │   │   ├── api.ts                    # Instancia de Axios con baseURL e interceptors JWT
│   │   │   │   ├── auth.service.ts           # Llamadas a endpoints de auth
│   │   │   │   └── storage.ts                # Wrapper de MMKV para persistencia local
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts                # Hook para estado de autenticación y acciones
│   │   │   │   └── useRole.ts                # Hook para verificar el rol del usuario actual
│   │   │   ├── stores/                       # Zustand stores
│   │   │   │   ├── authStore.ts              # Estado global: usuario, token, isAuthenticated
│   │   │   │   ├── incidentStore.ts          # Estado global: lista de incidencias, filtros
│   │   │   │   └── notificationStore.ts      # Estado global: notificaciones no leídas
│   │   │   └── types/
│   │   │       └── index.ts                  # Tipos TypeScript compartidos (User, Incident, Role, etc.)
│   │   │
│   │   ├── features/                         # Módulos por funcionalidad
│   │   │   │
│   │   │   ├── incidents/                    # Módulo de incidencias
│   │   │   │   ├── components/
│   │   │   │   │   ├── IncidentCard.tsx      # Tarjeta resumen de una incidencia
│   │   │   │   │   ├── IncidentList.tsx      # Lista de incidencias con pull-to-refresh
│   │   │   │   │   ├── IncidentDetail.tsx    # Vista detalle de una incidencia
│   │   │   │   │   ├── IncidentForm.tsx      # Formulario de reporte de emergencia
│   │   │   │   │   ├── EmergencyTypeSelect.tsx  # Selector de tipo de emergencia (multi-select)
│   │   │   │   │   ├── ServiceCheckbox.tsx   # Checklist de servicios requeridos
│   │   │   │   │   └── StatusBadge.tsx       # Badge visual del estado (Pendiente/En proceso/Resuelta)
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useIncidents.ts       # Fetch y mutaciones de incidencias
│   │   │   │   │   └── useCreateIncident.ts  # Lógica de creación de reporte
│   │   │   │   └── types.ts                  # Tipos específicos del módulo
│   │   │   │
│   │   │   ├── responders/                   # Módulo para Bombero, Policía, Paramédico
│   │   │   │   ├── components/
│   │   │   │   │   ├── ResponderDashboard.tsx   # Dashboard con incidencias asignadas
│   │   │   │   │   ├── ResponderIncidentCard.tsx # Card con acciones de respuesta
│   │   │   │   │   └── StatusUpdateModal.tsx    # Modal para cambiar estado de incidencia
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useResponderIncidents.ts # Fetch de incidencias filtradas por rol
│   │   │   │   └── types.ts
│   │   │   │
│   │   │   ├── admin/                        # Módulo de administración
│   │   │   │   ├── components/
│   │   │   │   │   ├── UserManagement.tsx    # CRUD de usuarios
│   │   │   │   │   ├── UserForm.tsx          # Formulario de crear/editar usuario
│   │   │   │   │   ├── EmergencyTypeForm.tsx # Formulario de categorías
│   │   │   │   │   └── StatsPanel.tsx        # Panel de estadísticas
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useUsers.ts
│   │   │   │   │   └── useStats.ts
│   │   │   │   └── types.ts
│   │   │   │
│   │   │   └── notifications/               # Módulo de notificaciones
│   │   │       ├── components/
│   │   │       │   ├── NotificationBell.tsx  # Icono con contador de no leídas
│   │   │       │   └── NotificationList.tsx  # Lista de notificaciones
│   │   │       └── hooks/
│   │   │           └── useNotifications.ts
│   │   │
│   │   └── shared/                           # Componentes y utilidades reutilizables
│   │       ├── components/
│   │       │   ├── Button.tsx                # Botón genérico con variantes
│   │       │   ├── Input.tsx                 # Input genérico con label y error
│   │       │   ├── Modal.tsx                 # Modal reutilizable
│   │       │   ├── LoadingSpinner.tsx        # Indicador de carga
│   │       │   ├── EmptyState.tsx            # Vista de estado vacío
│   │       │   └── ErrorBoundary.tsx         # Captura errores no manejados
│   │       ├── theme/
│   │       │   ├── colors.ts                 # Paleta de colores de EcoAlert
│   │       │   └── typography.ts             # Estilos de texto reutilizables
│   │       └── utils/
│   │           ├── format.ts                 # Formateo de fechas, texto
│   │           └── validation.ts             # Validaciones de formularios
│   │
│   ├── assets/
│   │   ├── images/
│   │   │   ├── icon.png                      # Ícono de la app (1024x1024)
│   │   │   ├── splash.png                    # Splash screen
│   │   │   └── adaptive-icon.png             # Ícono adaptativo Android
│   │   └── fonts/                            # Fuentes personalizadas (si aplica)
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── app.json                              # Configuración de Expo (nombre, slug, scheme)
│   ├── tailwind.config.js                    # Configuración de NativeWind/Tailwind
│   └── metro.config.js                       # Configuración de Metro Bundler (NativeWind)
│
├── infrastructure/                           # 🐳 Docker y base de datos
│   ├── docker/
│   │   ├── docker-compose.yml                # Servicios: mysql, backend, (opcional: phpmyadmin)
│   │   ├── docker-compose.dev.yml            # Override para desarrollo con hot-reload
│   │   └── .env.example                      # Variables requeridas por Docker Compose
│   └── mysql/
│       ├── init.sql                          # Script de inicialización de la BD
│       └── migrations/                       # Copias de las migrations del backend
│
├── bruno-collection/                         # 🔶 Bruno API Testing
│   ├── environments/
│   │   ├── local.bru                         # Variables: base_url=http://localhost:3000
│   │   └── staging.bru                       # Variables para staging (futuro)
│   ├── auth/
│   │   ├── login.bru
│   │   └── register.bru
│   ├── incidents/
│   │   ├── create-incident.bru
│   │   ├── list-incidents.bru
│   │   ├── get-incident.bru
│   │   └── update-status.bru
│   ├── users/
│   │   ├── list-users.bru
│   │   ├── create-user.bru
│   │   └── delete-user.bru
│   ├── emergency-types/
│   │   ├── list-types.bru
│   │   └── create-type.bru
│   └── bruno.json                            # Metadata de la colección Bruno
│
├── docs/                                     # 📚 Documentación
│   ├── architecture/
│   │   ├── system-design.md
│   │   └── api-specs.md
│   ├── guides/
│   │   ├── setup.md                          # Cómo levantar el proyecto desde cero
│   │   ├── development.md                    # Guía de desarrollo y convenciones
│   │   └── bruno-api-testing.md              # Cómo usar la colección Bruno
│   └── database/
│       └── er-diagram.md                     # Descripción del modelo ER
│
├── .gitignore
├── README.md
└── LICENSE
```

---

## 🗄️ Modelo de Base de Datos

```sql
-- Tablas en orden de dependencias

roles (id_rol PK, nombre_rol, descripcion)

usuarios (id_usuario PK, nombre, correo UNIQUE, contrasena,
          id_rol FK→roles, localidad, fecha_registro, estado BOOLEAN)

tipos_emergencia (id_tipo PK, nombre, descripcion, icono)

servicios_publicos (id_servicio PK, nombre, id_rol_asignado FK→roles)

incidencias (id_incidencia PK, id_usuario FK→usuarios,
             id_tipo_emergencia FK→tipos_emergencia,
             descripcion TEXT, latitud DECIMAL, longitud DECIMAL,
             direccion VARCHAR, prioridad ENUM('normal','alta','critica'),
             es_comunitario BOOLEAN, estado ENUM('pendiente','en_proceso','resuelta'),
             fecha_reporte DATETIME)

incidencia_servicios (id PK, id_incidencia FK→incidencias,
                      id_servicio FK→servicios_publicos)

historial_estados (id_historial PK, id_incidencia FK→incidencias,
                   estado_anterior ENUM, estado_nuevo ENUM,
                   id_usuario FK→usuarios, fecha_cambio DATETIME)
```

**Datos semilla obligatorios (008_seed_data.sql):**
- Roles: Admin, Representante de Localidad, Ciudadano, Bombero, Policía, Paramédico
- Servicios públicos: Bomberos (id_rol Bombero), Policía (id_rol Policía), Asistencia Médica (id_rol Paramédico)
- Tipos de emergencia: Terremoto, Inundación, Derrumbe, Huracán, Incendio Forestal, Deslizamiento, Tormenta Eléctrica, Contaminación Ambiental
- Usuario admin inicial: admin@ecoalert.com / Admin123!

---

## 🔌 API REST — Endpoints

### Auth
```
POST   /api/v1/auth/register        → Registro de usuario (público)
POST   /api/v1/auth/login           → Login, retorna access + refresh token
POST   /api/v1/auth/refresh         → Renovar access token
```

### Incidents
```
POST   /api/v1/incidents            → Crear incidencia [Ciudadano, Representante]
GET    /api/v1/incidents            → Listar (filtrado automático por rol)
GET    /api/v1/incidents/mine       → Mis incidencias [Ciudadano, Representante]
GET    /api/v1/incidents/:id        → Detalle de incidencia [Todos]
PATCH  /api/v1/incidents/:id/status → Cambiar estado [Admin, Responders]
```

### Users (Admin only)
```
GET    /api/v1/users                → Listar usuarios
GET    /api/v1/users/:id            → Detalle de usuario
POST   /api/v1/users                → Crear usuario
PUT    /api/v1/users/:id            → Actualizar usuario
DELETE /api/v1/users/:id            → Desactivar usuario
```

### Emergency Types
```
GET    /api/v1/emergency-types      → Listar tipos [Todos autenticados]
POST   /api/v1/emergency-types      → Crear tipo [Admin]
PUT    /api/v1/emergency-types/:id  → Actualizar [Admin]
DELETE /api/v1/emergency-types/:id  → Eliminar [Admin]
```

### Reports (Admin only)
```
GET    /api/v1/reports/stats        → Estadísticas: total por estado, por tipo, por servicio
```

### Notifications
```
GET    /api/v1/notifications        → Notificaciones del usuario autenticado
PATCH  /api/v1/notifications/:id/read → Marcar como leída
```

---

## 🔶 Bruno — Testing de la API

Bruno es el cliente de API que usamos en lugar de Postman. Es Git-friendly, offline-first y almacena las colecciones como archivos de texto plano (`.bru`) versionados junto al código.

### Setup inicial
1. Descargar Bruno desktop: https://www.usebruno.com/downloads
2. Abrir Bruno → Open Collection → seleccionar la carpeta `bruno-collection/` del proyecto
3. Seleccionar el environment `local` (top right)

### Estructura de la colección
- Cada endpoint tiene su archivo `.bru` con método, URL, headers, body y assertions
- El environment `local` tiene la variable `{{base_url}}` = `http://localhost:3000/api/v1`
- El token JWT se guarda como variable de environment después del login vía post-script:

```javascript
// Post-script del request login.bru
const token = res.getBody().data.accessToken;
bru.setEnvVar("access_token", token);
```

- Los requests protegidos usan `{{access_token}}` en el header Authorization

### Correr la colección por CLI
```bash
npm install -g @usebruno/cli
cd ecoalert/
bru run bruno-collection/ --env local
```

---

## ⚠️ Problemas Conocidos y Cómo Evitarlos

Estos problemas fueron encontrados en un proyecto anterior con el mismo stack. Son errores críticos que ya tienen solución documentada.

### 1. Archivos vacíos en app/
- **Problema:** La carpeta `app/` se crea con estructura pero archivos de 0 bytes
- **Causa:** El proyecto fue generado solo con estructura, sin contenido real
- **Solución:** Verificar con `find app/ -name "*.tsx" -empty` antes de correr. Todo archivo debe tener al menos el componente mínimo exportado por defecto.

### 2. SDK incompatible con Expo Go del dispositivo
- **Problema:** `package.json` tiene `expo: ~50.0.0` pero Expo Go del celular es SDK 54
- **Causa:** El proyecto nunca se actualizó desde su creación inicial
- **Solución:** Verificar la versión de Expo Go instalada en el celular antes de crear el proyecto. Usamos siempre SDK 54. Referencia oficial de versiones: https://github.com/expo/expo/blob/sdk-54/templates/expo-template-default/package.json

### 3. Versiones incompatibles de dependencias peer
- **Problema:** `expo-router`, `expo-linking`, `react-native-screens`, `react-native-reanimated` tienen versiones incompatibles entre sí
- **Causa:** Se actualizaron manualmente sin consultar el template oficial
- **Solución:** Usar SIEMPRE las versiones exactas listadas en la sección de Stack Tecnológico de este documento. No actualizar ninguna dependencia de forma individual.

### 4. react-native-worklets faltante
- **Problema:** `react-native-reanimated ~4.x` falla en runtime con error de worklets
- **Causa:** En Reanimated v4 el motor fue extraído al paquete `react-native-worklets` (separado)
- **Solución:** Siempre instalar ambos juntos: `react-native-reanimated: ~4.1.1` + `react-native-worklets: 0.5.1`

### 5. react-native-screens 3.x en lugar de 4.x
- **Problema:** Crash en runtime con la Nueva Arquitectura (Fabric) de React Native 0.81
- **Causa:** La versión 3.x no soporta Fabric
- **Solución:** Usar siempre `react-native-screens: ~4.16.0` con Expo SDK 54+

### 6. Docker con network_mode: host no expone puertos al host
- **Problema:** Metro Bundler corre dentro del container pero no es accesible desde el celular
- **Causa:** `network_mode: host` tiene comportamientos inconsistentes
- **Solución:** Usar port mapping explícito en `docker-compose.yml`:
```yaml
ports:
  - "3000:3000"   # backend
  - "3306:3306"   # mysql
```
Y definir la IP local en `.env` del mobile: `EXPO_PUBLIC_API_URL=http://192.168.x.x:3000`

### 7. Assets faltantes (icon.png, splash.png)
- **Problema:** `app.json` referencia imágenes que no existen en `assets/images/`
- **Solución:** Al crear el proyecto, ejecutar `npx expo install expo-splash-screen` que genera los assets automáticamente, o copiar placeholders antes de correr por primera vez.

---

## 🚀 Flujo de Desarrollo

```
Fase 1 (Setup + Auth) → Fase 2 (Incidencias + Roles) → Fase 3 (Notificaciones + Stats) → Fase 4 (APK + Docs)
```

### Fase 1 — Setup + Auth (Tutoría 5 · 18 Abril)

**Backend:**
1. Inicializar proyecto Node.js con TypeScript
2. Configurar `docker-compose.yml` con MySQL
3. Crear estructura de carpetas según este documento
4. Implementar migraciones SQL (tablas + seed data)
5. Implementar `connection.ts` (pool MySQL2)
6. Implementar módulo `auth/`: register, login, refresh token
7. Implementar `auth.middleware.ts` y `role.middleware.ts`
8. Documentar endpoints en Bruno: `auth/login.bru`, `auth/register.bru`

**Mobile:**
1. Crear proyecto Expo SDK 54 con template en blanco
2. Verificar que todos los archivos en `app/` tienen contenido antes de correr
3. Instalar todas las dependencias con las versiones exactas de este documento
4. Configurar NativeWind + tailwind.config.js + metro.config.js
5. Implementar `authStore.ts` con Zustand
6. Implementar `api.ts` (instancia Axios con interceptors JWT)
7. Implementar pantallas: `login.tsx`, `register.tsx`
8. Implementar `_layout.tsx` root con auth guard (redirect según estado de sesión)

**Entregable:** Login y registro funcionando end-to-end. Usuario puede autenticarse y el token se persiste en MMKV.

---

### Fase 2 — Incidencias + Roles (Tutoría 7 · 16 Mayo)

**Backend:**
1. Implementar módulo `incidents/`: CRUD completo con filtrado por rol
2. Implementar lógica de prioridad para Representante de Localidad
3. Implementar módulo `users/` (Admin): CRUD completo
4. Implementar módulo `emergency-types/`: CRUD completo
5. Documentar todos los endpoints nuevos en Bruno

**Mobile:**
1. Implementar `incidentStore.ts` con Zustand
2. Implementar `IncidentForm.tsx` con `EmergencyTypeSelect` y `ServiceCheckbox`
3. Implementar `IncidentList.tsx` con pull-to-refresh y filtros por estado
4. Implementar `IncidentDetail.tsx` con vista de detalle y estado
5. Implementar `ResponderDashboard.tsx` para Bombero, Policía, Paramédico
6. Implementar `StatusUpdateModal.tsx` para cambiar estado desde el responder
7. Implementar panel de Admin: gestión de usuarios y categorías

**Entregable:** Flujo completo de reporte funcional. Un ciudadano reporta una emergencia, el responder la ve en su panel y puede cambiar su estado.

---

### Fase 3 — Notificaciones + Estadísticas (Tutoría 7 · 16 Mayo)

**Backend:**
1. Implementar módulo `notifications/`: crear notificación al cambiar estado, listar por usuario
2. Implementar módulo `reports/`: endpoint de estadísticas con queries de agregación

**Mobile:**
1. Implementar `notificationStore.ts`
2. Implementar `NotificationBell.tsx` con contador en el tab bar
3. Implementar `NotificationList.tsx`
4. Implementar `StatsPanel.tsx` en el panel de Admin
5. Pruebas de usabilidad end-to-end en dispositivo físico

**Entregable:** Sistema de notificaciones funcional. Admin puede ver estadísticas básicas del sistema.

---

### Fase 4 — APK + Documentación + QA (Tutoría 8 · 30 Mayo)

1. Corrección de bugs encontrados en pruebas
2. Mejoras de UI/UX identificadas en la fase 3
3. Completar documentación: `setup.md`, `api-specs.md`, `bruno-api-testing.md`
4. Completar colección Bruno con todos los endpoints
5. Generar APK con `eas build --platform android --profile preview`
6. Preparar presentación técnica: arquitectura, BD, demo funcional

**Entregable:** APK firmado listo para instalación + repositorio documentado.

---

## 🧪 Estrategia de Testing

### Testing de API (Bruno)
- Cada endpoint tiene su archivo `.bru` con al menos una assertion de status code
- El flujo completo (register → login → crear incidencia → cambiar estado) se puede correr con el Collection Runner de Bruno
- Las variables de environment (`access_token`, `incident_id`) se propagan entre requests vía post-scripts

### Tests de integración (Jest + Supertest)
- `auth.test.ts`: register exitoso, login exitoso, token inválido retorna 401
- `incidents.test.ts`: crear incidencia, filtrado por rol, cambio de estado

### Testing manual en dispositivo
- Flujo ciudadano: registro → login → reporte → ver estado
- Flujo responder: login → ver incidencias asignadas → cambiar estado
- Flujo admin: login → gestionar usuarios → ver estadísticas

---

## 🏢 Entorno de Desarrollo

### Local

```yaml
# docker-compose.yml
services:
  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: ecoalert_db
    volumes:
      - mysql_data:/var/lib/mysql
      - ./infrastructure/mysql/init.sql:/docker-entrypoint-initdb.d/init.sql

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    env_file: ./backend/.env
    depends_on:
      - mysql
    volumes:
      - ./backend:/app
      - /app/node_modules
```

### Variables de entorno requeridas (.env del backend)

```env
NODE_ENV=development
PORT=3000
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=ecoalert_db
JWT_SECRET=your_jwt_secret_here_min_32_chars
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
```

### Variables de entorno del mobile (.env en raíz de mobile/)

```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000/api/v1
```

> Reemplazar `192.168.x.x` con la IP local del equipo donde corre Docker.
> Esta IP debe actualizarse si el equipo cambia de red.

---

## 📈 Métricas de Éxito

### Funcionales
- ✅ Los 5 roles pueden autenticarse y ver solo lo que les corresponde
- ✅ Un ciudadano puede reportar una emergencia en menos de 3 minutos
- ✅ Un responder ve solo las incidencias que le corresponden según su rol
- ✅ El Admin puede gestionar usuarios, categorías y ver estadísticas
- ✅ El historial de estados se registra correctamente en cada cambio

### Técnicos
- ✅ Todos los endpoints documentados en Bruno con assertions de status code
- ✅ Migraciones SQL versionadas y reproducibles desde cero con Docker
- ✅ APK generado e instalable en Android
- ✅ Sin errores de TypeScript en build de producción

---

## 🎯 Alcance del MVP

### Incluido en MVP
✅ Autenticación con JWT (register, login, refresh)
✅ 5 roles con RBAC completo
✅ Reporte de emergencia con tipo, descripción, ubicación y servicios requeridos
✅ Priorización automática de reportes de Representante de Localidad
✅ Panel de responders filtrado por rol (Bombero, Policía, Paramédico)
✅ Cambio de estado de incidencias con historial
✅ Panel de administración: usuarios, categorías, estadísticas básicas
✅ Notificaciones de cambio de estado
✅ APK listo para instalación en Android

### Post-MVP (v1.1+)
- Mapa interactivo con ubicación de incidencias
- Foto adjunta en el reporte
- Chat entre ciudadano y responder
- Estadísticas avanzadas con gráficos
- Exportación de reportes en PDF
- Publicación en Google Play

---

## 📚 Referencias

- [Expo SDK 54 Changelog](https://expo.dev/changelog/sdk-54)
- [Expo Router v6 Docs](https://docs.expo.dev/router/introduction/)
- [Template oficial Expo SDK 54](https://github.com/expo/expo/blob/sdk-54/templates/expo-template-default/package.json)
- [NativeWind v4 Docs](https://www.nativewind.dev/v4/overview)
- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Bruno Docs](https://docs.usebruno.com/introduction/what-is-bruno)
- [Bruno Starter Guide](https://docs.usebruno.com/advanced-guides/starter-guide)
- [mysql2 Docs](https://sidorares.github.io/node-mysql2/docs)
- [Zod Docs](https://zod.dev)

---

**Este documento es la fuente de verdad del proyecto. Cualquier cambio en arquitectura, dependencias o estructura debe reflejarse aquí antes de implementarse.**
