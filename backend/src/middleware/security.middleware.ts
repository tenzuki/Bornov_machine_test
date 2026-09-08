import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export const securityHeaders = helmet();

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // In development mode or for same-origin server requests, allow all origins
    if (env.NODE_ENV === 'development' || !origin) {
      return callback(null, true);
    }
    if (origin === env.CORS_ORIGIN || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 requests per IP per window for auth routes
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
      statusCode: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
};
