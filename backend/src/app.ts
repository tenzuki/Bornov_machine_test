import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { securityHeaders, corsMiddleware, requestLogger } from './middleware/security.middleware';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';

const app: Application = express();

// Security & Core Middlewares
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);

// Healthcheck Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'task-collaboration-backend',
  });
});

// API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/tasks', taskRoutes);

app.get('/api/v1', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to Task Collaboration API v1',
    version: '1.0.0',
  });
});

// Global Centralized Error Handler Middleware (Must be last)
app.use(errorHandler);

export default app;
