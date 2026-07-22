import { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  getCategories,
  getProductBySlug,
  getProducts,
  updateProduct,
} from '@/controllers/product.controller';
import { requireApiKey } from '@/middlewares/requireApiKey';

const router = Router();

// Reads
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:slug', getProductBySlug);

// Writes (guarded by x-api-key when ADMIN_API_KEY is set)
router.post('/', requireApiKey, createProduct);
router.put('/:slug', requireApiKey, updateProduct);
router.patch('/:slug', requireApiKey, updateProduct);
router.delete('/:slug', requireApiKey, deleteProduct);

export default router;
