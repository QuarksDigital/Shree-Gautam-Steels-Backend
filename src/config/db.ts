import mongoose from 'mongoose';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

let connected = false;

/**
 * Connect to MongoDB Atlas. Non-fatal: if the connection fails the API keeps
 * running and the product service falls back to the bundled seed data, so the
 * site never goes dark.
 */
export const connectDB = async (): Promise<boolean> => {
  if (!env.mongoUri) {
    logger.warn('MONGODB_URI not set — using in-memory seed data.');
    return false;
  }
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.mongoUri, {
      dbName: env.mongoDb,
      serverSelectionTimeoutMS: 10000,
    });
    connected = true;
    logger.info(`MongoDB connected (db: ${env.mongoDb}).`);
    return true;
  } catch (err) {
    logger.error('MongoDB connection failed — falling back to seed data.', err);
    return false;
  }
};

export const isDbConnected = (): boolean =>
  connected && mongoose.connection.readyState === 1;

export const disconnectDB = async (): Promise<void> => {
  if (connected) await mongoose.disconnect();
  connected = false;
};
