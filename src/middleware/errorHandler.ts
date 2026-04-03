import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode, errorMap } from '../utils/errors';
import { logger } from '../config/logger';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    logger.warn(`AppError: ${err.code}`, { message: err.message, details: err.details });
    res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { details: err.details }),
    });
    return;
  }

  logger.error('Unhandled error', err);
  res.status(500).json({
    success: false,
    code: ErrorCode.INTERNAL_ERROR,
    message: errorMap[ErrorCode.INTERNAL_ERROR].message,
    ...(process.env.NODE_ENV === 'development' && { error: err.message }),
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
