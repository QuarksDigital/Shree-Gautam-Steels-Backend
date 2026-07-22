import { Router } from 'express';
import {
  createEnquiry,
  listEnquiries,
  updateEnquiryStatus,
} from '@/controllers/enquiry.controller';
import { enquiryLimiter } from '@/middlewares/rateLimit';
import { requireApiKey } from '@/middlewares/requireApiKey';

const router = Router();

// Public submission (rate-limited + honeypot + validation inside controller)
router.post('/', enquiryLimiter, createEnquiry);

// Admin
router.get('/', requireApiKey, listEnquiries);
router.patch('/:id', requireApiKey, updateEnquiryStatus);

export default router;
