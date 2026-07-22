import type { NextFunction, Request, Response } from 'express';
import { enquiryService } from '@/services/enquiry.service';
import { validateEnquiry } from '@/utils/validateEnquiry';
import { ApiError } from '@/utils/ApiError';

/** POST /api/enquiries  (public, rate-limited) */
export const createEnquiry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = (req.body ?? {}) as Record<string, unknown>;

    // Honeypot: real users never fill the hidden `website` field.
    if (typeof body.hp_token === 'string' && body.hp_token.trim() !== '') {
      res.status(201).json({ success: true, message: 'Enquiry received.' });
      return;
    }

    const { value, errors } = validateEnquiry(body);
    if (!value) {
      throw ApiError.badRequest(errors.join(' '));
    }

    const { id } = await enquiryService.create(value, {
      ip: req.ip,
      userAgent: req.header('user-agent') ?? undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you — your enquiry has been received. We respond within one business day.',
      id,
    });
  } catch (err) {
    next(err);
  }
};

/** GET /api/enquiries  (admin) */
export const listEnquiries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined;
    const data = await enquiryService.list({ status, limit });
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/enquiries/:id  (admin) */
export const updateEnquiryStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const status = typeof req.body?.status === 'string' ? req.body.status : '';
    const updated = await enquiryService.setStatus(req.params.id, status);
    if (!updated) throw ApiError.notFound(`Enquiry '${req.params.id}' not found`);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};
