import { Router } from 'express';
import healthRoutes from '@/routes/health.routes';
import productRoutes from '@/routes/product.routes';
import enquiryRoutes from '@/routes/enquiry.routes';

/**
 * Central router. Every feature router is mounted here, and this single
 * router is mounted once in app.ts under the configured API prefix.
 */
const router = Router();

router.use('/health', healthRoutes);
router.use('/products', productRoutes);
router.use('/enquiries', enquiryRoutes);

export default router;
