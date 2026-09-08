import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication context is missing'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(AppError.forbidden(`Forbidden: Requires one of [${allowedRoles.join(', ')}] roles`));
    }

    next();
  };
};
