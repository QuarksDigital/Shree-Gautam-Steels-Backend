import { createApp } from '@/app';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import { connectDB, disconnectDB } from '@/config/db';

const start = async (): Promise<void> => {
  // Connect to MongoDB (non-fatal — API falls back to seed data if it fails).
  await connectDB();

  const app = createApp();
  const server = app.listen(env.port, () => {
    logger.info(`Server running at http://localhost:${env.port} (${env.nodeEnv})`);
    logger.info(`API base: http://localhost:${env.port}${env.apiPrefix}`);
  });

  const shutdown = (signal: string): void => {
    logger.warn(`${signal} received — shutting down.`);
    server.close(async () => {
      await disconnectDB();
      logger.info('Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', reason);
  });
};

start().catch((err) => {
  logger.error('Fatal startup error', err);
  process.exit(1);
});
