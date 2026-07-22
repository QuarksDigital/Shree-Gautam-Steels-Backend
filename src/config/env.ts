import dotenv from 'dotenv';

dotenv.config();

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: toNumber(process.env.PORT, 4000),
  apiPrefix: process.env.API_PREFIX ?? '/api',
  corsOrigin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  mongoUri: process.env.MONGODB_URI ?? '',
  mongoDb: process.env.MONGODB_DB ?? 'shreegautam',
  /** If set, write endpoints (POST/PUT/PATCH/DELETE) require x-api-key header. */
  adminApiKey: process.env.ADMIN_API_KEY ?? '',
} as const;

export const isProd = env.nodeEnv === 'production';
