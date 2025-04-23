import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import config from './config';
import routes from './routes';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 solicitudes por ventana
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Rutas
app.use('/api', routes);

// Endpoint de prueba/salud
app.get('/', (req, res) => {
  res.json({ message: 'GamerHub API - Funcionando correctamente' });
});

// Manejadores de errores
app.use(notFoundHandler);
app.use(errorHandler);

// Iniciar servidor
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT} en modo ${config.nodeEnv}`);
});

export default app;