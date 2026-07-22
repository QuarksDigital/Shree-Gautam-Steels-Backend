import type { NextFunction, Request, Response } from 'express';
import { productService } from '@/services/product.service';
import { ApiError } from '@/utils/ApiError';

/** GET /api/products?category=&featured=&search= */
export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, featured, search } = req.query;
    const data = await productService.findAll({
      category: typeof category === 'string' ? category : undefined,
      search: typeof search === 'string' ? search : undefined,
      featured: featured === undefined ? undefined : featured === 'true' || featured === '1',
    });
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

/** GET /api/products/categories */
export const getCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await productService.categories();
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

/** GET /api/products/:slug */
export const getProductBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await productService.findBySlug(req.params.slug);
    if (!product) throw ApiError.notFound(`Product '${req.params.slug}' not found`);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

/** POST /api/products */
export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const created = await productService.create(req.body ?? {});
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
};

/** PUT|PATCH /api/products/:slug */
export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await productService.update(req.params.slug, req.body ?? {});
    if (!updated) throw ApiError.notFound(`Product '${req.params.slug}' not found`);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/products/:slug */
export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const removed = await productService.remove(req.params.slug);
    if (!removed) throw ApiError.notFound(`Product '${req.params.slug}' not found`);
    res.json({ success: true, message: `Product '${req.params.slug}' deleted.` });
  } catch (err) {
    next(err);
  }
};
