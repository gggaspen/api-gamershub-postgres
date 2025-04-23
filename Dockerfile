# Utilizamos la imagen oficial de Node.js
FROM node:18-alpine

# Creamos y establecemos el directorio de trabajo
WORKDIR /app

# Copiamos los archivos package.json y package-lock.json para instalar dependencias
COPY package*.json ./

# Instalamos todas las dependencias (incluyendo devDependencies)
RUN npm install

# Copiamos el resto de los archivos del proyecto
COPY . .

# Compilamos la aplicación TypeScript
RUN npm run build

# Eliminamos las dependencias de desarrollo para reducir el tamaño
RUN npm prune --production

# Exponemos el puerto que usará la aplicación
EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["node", "dist/index.js"]
