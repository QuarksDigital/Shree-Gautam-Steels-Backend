import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env, isProd } from '@/config/env';
import routes from '@/routes';
import { notFound } from '@/middlewares/notFound';
import { errorHandler } from '@/middlewares/errorHandler';
import { mongoSanitize } from '@/middlewares/sanitize';
import { apiLimiter } from '@/middlewares/rateLimit';

export const createApp = (): Application => {
  const app = express();

  // Correct client IP behind a single proxy/load balancer (needed for rate limiting).
  app.set('trust proxy', 1);

  // Security & parsing (body size capped to blunt abuse).
  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin.length ? env.corsOrigin : true,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '32kb' }));
  app.use(express.urlencoded({ extended: true, limit: '32kb' }));

  // Strip NoSQL-operator keys ($ / dotted) from body & params.
  app.use(mongoSanitize);

  // HTTP request logging
  app.use(morgan(isProd ? 'combined' : 'dev'));

  // Root — quick liveness check
  app.get('/', (_req, res) => {
    res.json({ success: true, service: 'shreegautam-backend', docs: `${env.apiPrefix}/health` });
  });

  // Mount the API behind a broad rate limiter
  app.use(env.apiPrefix, apiLimiter, routes);

  // Fallbacks
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
