import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

export const createError = (message: string, statusCode: number = 500, code?: string): ApiError => {
  const error: ApiError = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.isOperational = true;
  return error;
};

export const errorHandler = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'INTERNAL_ERROR';

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    
    switch (prismaError.code) {
      case 'P2002':
        statusCode = 409;
        message = 'Resource already exists';
        code = 'DUPLICATE_ENTRY';
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Resource not found';
        code = 'NOT_FOUND';
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Foreign key constraint failed';
        code = 'FOREIGN_KEY_ERROR';
        break;
      default:
        statusCode = 500;
        message = 'Database error occurred';
        code = 'DATABASE_ERROR';
    }
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'TOKEN_INVALID';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  }

  // Multer errors (file upload)
  if (err.name === 'MulterError') {
    const multerError = err as any;
    
    switch (multerError.code) {
      case 'LIMIT_FILE_SIZE':
        statusCode = 413;
        message = 'File too large';
        code = 'FILE_TOO_LARGE';
        break;
      case 'LIMIT_FILE_COUNT':
        statusCode = 400;
        message = 'Too many files';
        code = 'TOO_MANY_FILES';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        statusCode = 400;
        message = 'Unexpected file field';
        code = 'UNEXPECTED_FILE';
        break;
      default:
        statusCode = 400;
        message = 'File upload error';
        code = 'UPLOAD_ERROR';
    }
  }

  // Log error for debugging (but not in production for client errors)
  if (statusCode >= 500 || process.env.NODE_ENV === 'development') {
    console.error(`Error ${statusCode}:`, {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
      headers: req.headers,
      timestamp: new Date().toISOString()
    });
  }

  // Send error response
  const errorResponse = {
    error: message,
    code,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: {
        originalError: err.name,
        url: req.url,
        method: req.method
      }
    })
  };

  res.status(statusCode).json(errorResponse);
};

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    error: `Route ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND'
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};