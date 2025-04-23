import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response.util';

export function notFoundHandler(req: Request, res: Response) {
  return res.status(404).json(errorResponse(`Ruta no encontrada: ${req.path}`));
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);

  // Determinar el código de estado apropiado
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  return res.status(statusCode).json(errorResponse(
    process.env.NODE_ENV === 'production' 
      ? 'Ocurrió un error en el servidor' 
      : err.message
  ));
}