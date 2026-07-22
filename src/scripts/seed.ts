import { connectDB, disconnectDB, isDbConnected } from '@/config/db';
import { ProductModel } from '@/models/product.model';
import { products } from '@/data/products';
import { logger } from '@/utils/logger';

/**
 * Uploads the full product catalogue to MongoDB.
 * Idempotent: upserts by `slug`, so re-running updates existing docs.
 * Run with:  npm run seed
 */
const run = async (): Promise<void> => {
  await connectDB();
  if (!isDbConnected()) {
    logger.error('Cannot seed — no MongoDB connection. Check MONGODB_URI and Atlas IP access list.');
    process.exit(1);
  }

  logger.info(`Seeding ${products.length} products...`);
  for (const p of products) {
    await ProductModel.updateOne({ slug: p.slug }, { $set: p }, { upsert: true });
  }

  const count = await ProductModel.countDocuments();
  logger.info(`Seed complete. Collection now holds ${count} products.`);
  await disconnectDB();
  process.exit(0);
};

run().catch((err) => {
  logger.error('Seeding failed', err);
  process.exit(1);
});
