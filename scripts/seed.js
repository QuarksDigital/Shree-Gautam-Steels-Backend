/**
 * Standalone MongoDB seeding script (plain Node / CommonJS).
 *
 * No build step required — run it directly:
 *   node scripts/seed.js
 * or via npm:
 *   npm run seed:js
 *
 * Reads MONGODB_URI / MONGODB_DB from `.env` (see .env.example), upserts the
 * product catalogue by `slug` (idempotent — safe to re-run), then exits.
 *
 * The product list here mirrors src/data/products.ts so the seed works without
 * compiling the TypeScript sources.
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB = process.env.MONGODB_DB || 'shreegautam';

// Frontend-relative product photography (served from the Next.js public/products/).
const IMG_SAUCEPAN = '/products/tri-ply-saucepan.png';
const IMG_CASSEROLE = '/products/triply-casserole.png';
const IMG_CASSEROLE_26 = '/products/triply-casserole-26cm.png';
const IMG_TOPE_24 = '/products/tri-ply-tope-24cm.png';

/** @type {Array<object>} */
const products = [
  {
    id: 'sg-001',
    slug: 'tri-ply-stainless-steel-saucepan',
    name: 'Tri Ply Stainless Steel Saucepan',
    category: 'Cookware',
    tagline: 'Triply saucepan with a long stay-cool handle.',
    description:
      'Triply stainless steel saucepan — steel bonded over an aluminium core over steel for even, edge-to-edge heat. Single long tubular handle with a heat-guard collar, mirror-finished body and a single pouring lip. Induction compatible and food-grade.',
    image: IMG_SAUCEPAN,
    specs: {
      material: 'Stainless Steel (Triply)',
      gauge: '2.5 mm',
      capacity: '2.5 L',
      finish: 'Mirror Finish',
      dimensions: '14 / 16 / 18 cm',
    },
    price: '~ ₹ 400 / Piece',
    moq: 50,
    featured: true,
  },
  {
    id: 'sg-002',
    slug: 'triply-stainless-steel-casserole',
    name: 'Triply Stainless Steel Casserole',
    category: 'Cookware',
    tagline: 'Two-handled triply casserole, canteen-grade.',
    description:
      'Food-grade triply casserole / tope with two riveted side handles for a secure carry. Straight round body in bonded steel-aluminium-steel construction for even heating and efficient fuel use. Offered as a graduated set of four.',
    image: IMG_CASSEROLE,
    specs: {
      material: 'Stainless Steel (Triply)',
      capacity: '1.5 L – 5 L',
      finish: 'Steel Finish',
      dimensions: 'Set of 4',
    },
    price: '~ ₹ 450 / Piece',
    moq: 50,
    featured: true,
  },
  {
    id: 'sg-003',
    slug: 'triply-casserole-26cm',
    name: 'Triply Casserole 26cm',
    category: 'Cookware',
    tagline: '26 cm triply casserole, side-handled.',
    description:
      '5 L triply casserole in a 26 cm round form with two side handles and brass-tone handle brackets. Plain, deep body built for volume service; bonded triply base for even heat. Supplied as a set of four.',
    image: IMG_CASSEROLE_26,
    specs: {
      material: 'Stainless Steel (Triply)',
      capacity: '5 L',
      finish: 'Steel Finish',
      dimensions: '26 cm · Set of 4',
    },
    price: '~ ₹ 450 / Piece',
    moq: 50,
    featured: false,
  },
  {
    id: 'sg-004',
    slug: 'tri-ply-tope-24cm',
    name: 'Tri Ply Tope 24cm',
    category: 'Cookware',
    tagline: '24 cm triply tope / patila, straight-walled.',
    description:
      'Straight-walled triply tope (patila) in a 24 cm size with a rolled rim and mirror-finished body. Three-layer bonded construction (steel-aluminium-steel) for even heating; works on all stovetops including induction. Made by Shree Gautam Enterprises.',
    image: IMG_TOPE_24,
    specs: {
      material: 'Stainless Steel (Triply)',
      capacity: '5 L',
      finish: 'Mirror Finish',
      dimensions: '24 cm',
    },
    price: '~ ₹ 450 / Piece',
    moq: 50,
    featured: true,
  },
];

// Mongoose schema (kept in sync with src/models/product.model.ts).
const specSchema = new mongoose.Schema(
  {
    material: { type: String, required: true },
    gauge: String,
    capacity: String,
    finish: String,
    dimensions: String,
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['Cookware', 'Serveware', 'Storage', 'Thalis', 'Spice Boxes'],
      index: true,
    },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    specs: { type: specSchema, required: true },
    price: String,
    moq: { type: Number, required: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const ProductModel =
  mongoose.models.Product || mongoose.model('Product', productSchema);

async function run() {
  if (!MONGODB_URI) {
    console.error(
      '[seed] MONGODB_URI is not set. Copy .env.example to .env and set it, then re-run.',
    );
    process.exit(1);
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(MONGODB_URI, {
    dbName: MONGODB_DB,
    serverSelectionTimeoutMS: 10000,
  });
  console.log(`[seed] Connected to MongoDB (db: ${MONGODB_DB}).`);

  console.log(`[seed] Upserting ${products.length} products...`);
  for (const p of products) {
    await ProductModel.updateOne({ slug: p.slug }, { $set: p }, { upsert: true });
    console.log(`  ✓ ${p.name}`);
  }

  const count = await ProductModel.countDocuments();
  console.log(`[seed] Done. Collection now holds ${count} products.`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('[seed] Seeding failed:', err);
  try {
    await mongoose.disconnect();
  } catch (_) {
    /* ignore */
  }
  process.exit(1);
});
