FROM node:22-alpine

WORKDIR /app

# Instalar dependencias del sistema necesarias para paquetes nativos
RUN apk add --no-cache python3 make g++

# Copiar manifiestos de dependencias
COPY package*.json ./

# Instalar dependencias con legacy-peer-deps
# (requerido por conflictos de peer deps entre react-native 0.81 y @types/react ~19.x)
RUN npm install --legacy-peer-deps

# Fix: ajv@^8.x requerido por expo-router internamente via schema-utils → ajv-keywords
# Sin esto falla con: "Cannot find module 'ajv/dist/compile/codegen'"
RUN npm install ajv@^8.12.0 --save-dev --legacy-peer-deps

COPY . .

EXPOSE 8081 19000 19001 19002

CMD ["npx", "expo", "start", "--lan"]
