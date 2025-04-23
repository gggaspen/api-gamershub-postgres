# Utilizamos la imagen oficial de Node.js
FROM node:18-alpine as builder

# Creamos y establecemos el directorio de trabajo
WORKDIR /app

# Copiamos los archivos package.json y package-lock.json para instalar dependencias
COPY package*.json ./

# Instalamos dependencias
RUN npm ci

# Copiamos el resto de los archivos del proyecto
COPY . .

# Compilamos la aplicación TypeScript
RUN npm run build

# Etapa de producción
FROM node:18-alpine as production

# Establecemos NODE_ENV en producción
ENV NODE_ENV=production

# Creamos y establecemos el directorio de trabajo
WORKDIR /app

# Copiamos los archivos necesarios desde la etapa de construcción
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Instalamos solo dependencias de producción
RUN npm ci --only=production

# Exponemos el puerto que usará la aplicación
EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["node", "dist/index.js"]
