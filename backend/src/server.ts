import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Server running in [${env.NODE_ENV}] mode on port ${env.PORT}`);
  logger.info(`Health check available at: http://localhost:${env.PORT}/health`);
});

// Handle unhandled promise rejections & uncaught exceptions
process.on('unhandledRejection', (reason: Error) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', { reason: reason.message });
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', { error: err.message, stack: err.stack });
  process.exit(1);
});
