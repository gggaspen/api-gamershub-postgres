# GamerHub API

API de servicio para la tienda de dropshipping GamerHub, conectando a la base de datos PostgreSQL.

## Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución JavaScript del lado del servidor
- **Express**: Framework web para Node.js
- **PostgreSQL**: Base de datos relacional
- **TypeScript**: Superset de JavaScript con tipado estático

## Estructura del Proyecto

```
gamershub-api/
├── src/
│   ├── config/         # Configuraciones (DB, env)
│   ├── controllers/    # Controladores para manejar la lógica de negocio
│   ├── routes/         # Definición de rutas de la API
│   ├── middleware/     # Middleware (auth, error handling, etc.)
│   ├── utils/          # Utilidades y helpers
│   └── index.ts        # Punto de entrada de la aplicación
├── .env                # Variables de entorno
├── .gitignore          # Archivos ignorados por Git
├── package.json        # Dependencias y scripts
└── tsconfig.json       # Configuración de TypeScript
```

## Instalación

1. Clona el repositorio
2. Instala las dependencias: `npm install`
3. Configura el archivo `.env` con tus variables de entorno:
   ```
   PORT=3001
   DATABASE_URL=postgresql://usuario:contraseña@host:puerto/nombre_db
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   ```
4. Ejecuta el servidor en modo desarrollo: `npm run dev`

## Scripts Disponibles

- `npm run start`: Inicia la aplicación en modo producción
- `npm run dev`: Inicia la aplicación en modo desarrollo con hot-reload
- `npm run build`: Compila el código TypeScript a JavaScript

## Endpoints de la API

### Productos

- `GET /api/products`: Obtener lista de productos con paginación
- `GET /api/products/featured`: Obtener productos destacados
- `GET /api/products/:slug`: Obtener detalles de un producto específico

### Categorías

- `GET /api/categories`: Obtener todas las categorías
- `GET /api/categories/:slug`: Obtener detalles de una categoría específica

### Plataformas

- `GET /api/platforms`: Obtener todas las plataformas
- `GET /api/platforms/:slug`: Obtener detalles de una plataforma específica

## Despliegue

Esta API está diseñada para ser desplegada en Railway.

1. Conecta el repositorio a Railway
2. Configura las variables de entorno necesarias
3. Railway detectará automáticamente el comando de inicio en package.json

## Licencia

Este proyecto es propietario y confidencial. Todos los derechos reservados.