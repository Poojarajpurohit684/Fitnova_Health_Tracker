export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  RATE_LIMIT = 'RATE_LIMIT',
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const createError = (
  code: ErrorCode,
  message: string,
  statusCode: number,
  details?: any
): AppError => {
  return new AppError(code, message, statusCode, details);
};

export const errorMap = {
  [ErrorCode.VALIDATION_ERROR]: { status: 400, message: 'Validation failed' },
  [ErrorCode.UNAUTHORIZED]: { status: 401, message: 'Unauthorized' },
  [ErrorCode.FORBIDDEN]: { status: 403, message: 'Forbidden' },
  [ErrorCode.NOT_FOUND]: { status: 404, message: 'Not found' },
  [ErrorCode.CONFLICT]: { status: 409, message: 'Conflict' },
  [ErrorCode.INTERNAL_ERROR]: { status: 500, message: 'Internal server error' },
  [ErrorCode.BAD_REQUEST]: { status: 400, message: 'Bad request' },
  [ErrorCode.RATE_LIMIT]: { status: 429, message: 'Too many requests' },
};
