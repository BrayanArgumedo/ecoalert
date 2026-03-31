# Setup — Levantar EcoAlert desde cero

## Requisitos
- Node.js v22+
- Docker Desktop
- Bruno (https://www.usebruno.com/downloads)
- Expo Go SDK 54 en tu dispositivo Android

## 1. Clonar el repositorio
```bash
git clone git@github.com:BrayanArgumedo/ecoalert.git
cd ecoalert
```

## 2. Levantar la base de datos
```bash
cd infrastructure/docker
docker compose up -d
```
Verificar en http://localhost:8080 (phpMyAdmin) con user: root / pass: root

## 3. Levantar el backend
```bash
cd backend
cp .env.example .env
npm install
npm run migrate
npm run dev
```
API disponible en http://localhost:3000/api/v1

## 4. Levantar el mobile
```bash
cd mobile
cp .env.example .env
# Editar .env con tu IP local (ifconfig | grep inet)
npm install
npm start
```
Escanear QR con Expo Go en el celular.

## 5. Configurar Bruno
Abrir Bruno → Open Collection → seleccionar carpeta `bruno-collection/`
Seleccionar environment `local` en el dropdown superior derecho.
