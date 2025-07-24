import { Request, Response } from 'express';

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    error: `Route ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND',
    method: req.method,
    timestamp: new Date().toISOString()
  });
};