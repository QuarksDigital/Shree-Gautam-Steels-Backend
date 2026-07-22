import { products as seed } from '@/data/products';
import { ProductModel } from '@/models/product.model';
import { isDbConnected } from '@/config/db';
import { ApiError } from '@/utils/ApiError';
import type { Product, ProductCategory } from '@/types/product';

export interface ProductQuery {
  category?: string;
  featured?: boolean;
  search?: string;
}

/** Map a lean Mongo document to the public Product shape. */
const toProduct = (d: Record<string, unknown>): Product => ({
  id: d.id as string,
  slug: d.slug as string,
  name: d.name as string,
  category: d.category as ProductCategory,
  tagline: d.tagline as string,
  description: d.description as string,
  image: d.image as string,
  specs: d.specs as Product['specs'],
  price: d.price as string | undefined,
  moq: d.moq as number,
  featured: Boolean(d.featured),
});

const filterSeed = (query: ProductQuery): Product[] => {
  let result = [...seed];
  if (query.category) {
    const c = query.category.toLowerCase();
    result = result.filter((p) => p.category.toLowerCase() === c);
  }
  if (typeof query.featured === 'boolean') {
    result = result.filter((p) => Boolean(p.featured) === query.featured);
  }
  if (query.search) {
    const t = query.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(t) ||
        p.tagline.toLowerCase().includes(t) ||
        p.description.toLowerCase().includes(t),
    );
  }
  return result;
};

const requireDb = (): void => {
  if (!isDbConnected()) {
    throw new ApiError(503, 'Database not connected — write operations are unavailable.');
  }
};

/**
 * Product data access. Reads from MongoDB when connected; otherwise (or if the
 * collection is empty) transparently falls back to the bundled seed data.
 * Writes require a live MongoDB connection.
 */
class ProductService {
  async findAll(query: ProductQuery = {}): Promise<Product[]> {
    if (isDbConnected()) {
      const filter: Record<string, unknown> = {};
      if (query.category) filter.category = query.category;
      if (typeof query.featured === 'boolean') filter.featured = query.featured;
      if (query.search) {
        const rx = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        filter.$or = [{ name: rx }, { tagline: rx }, { description: rx }];
      }
      const docs = await ProductModel.find(filter).sort({ id: 1 }).lean();
      if (docs.length) return docs.map(toProduct);
    }
    return filterSeed(query);
  }

  async findBySlug(slug: string): Promise<Product | null> {
    if (isDbConnected()) {
      const doc = await ProductModel.findOne({ slug }).lean();
      if (doc) return toProduct(doc);
    }
    return seed.find((p) => p.slug === slug) ?? null;
  }

  async categories(): Promise<ProductCategory[]> {
    if (isDbConnected()) {
      const cats = (await ProductModel.distinct('category')) as ProductCategory[];
      if (cats.length) return cats;
    }
    return [...new Set(seed.map((p) => p.category))];
  }

  async create(input: Partial<Product>): Promise<Product> {
    requireDb();
    if (!input.slug || !input.name) {
      throw ApiError.badRequest('`slug` and `name` are required.');
    }
    const payload = {
      ...input,
      id: input.id ?? `sg-${Date.now()}`,
      featured: Boolean(input.featured),
    };
    try {
      const doc = await ProductModel.create(payload);
      return toProduct(doc.toObject());
    } catch (err) {
      const e = err as { code?: number; name?: string; message?: string };
      if (e.code === 11000) {
        throw new ApiError(409, `A product with slug '${input.slug}' already exists.`);
      }
      if (e.name === 'ValidationError') {
        throw ApiError.badRequest(e.message ?? 'Invalid product payload.');
      }
      throw err;
    }
  }

  async update(slug: string, patch: Partial<Product>): Promise<Product | null> {
    requireDb();
    // Never allow changing the immutable keys via update.
    const { id: _id, slug: _slug, ...safe } = patch;
    void _id;
    void _slug;
    try {
      const doc = await ProductModel.findOneAndUpdate(
        { slug },
        { $set: safe },
        { new: true, runValidators: true },
      ).lean();
      return doc ? toProduct(doc) : null;
    } catch (err) {
      const e = err as { name?: string; message?: string };
      if (e.name === 'ValidationError') {
        throw ApiError.badRequest(e.message ?? 'Invalid product payload.');
      }
      throw err;
    }
  }

  async remove(slug: string): Promise<boolean> {
    requireDb();
    const result = await ProductModel.deleteOne({ slug });
    return result.deletedCount > 0;
  }
}

export const productService = new ProductService();
