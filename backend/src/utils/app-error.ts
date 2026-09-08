export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(statusCode: number, message: string, details?: any, isOperational = true) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: any) {
    return new AppError(400, message, details);
  }

  static unauthorized(message = 'Unauthorized access') {
    return new AppError(401, message);
  }

  static forbidden(message = 'Forbidden resource access') {
    return new AppError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new AppError(404, message);
  }

  static conflict(message: string) {
    return new AppError(409, message);
  }

  static internal(message = 'Internal server error') {
    return new AppError(500, message, undefined, false);
  }
}
