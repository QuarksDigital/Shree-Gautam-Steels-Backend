import type { NextFunction, Request, Response } from 'express';
import { env } from '@/config/env';
import { ApiError } from '@/utils/ApiError';
import { logger } from '@/utils/logger';

/**
 * Guards write endpoints. If ADMIN_API_KEY is set, requests must send a matching
 * `x-api-key` header. If it is unset, writes are allowed (dev convenience) with a
 * one-time warning - set the key before exposing the API publicly.
 */
let warned = false;

export const requireApiKey = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  if (!env.adminApiKey) {
    if (!warned) {
      logger.warn('ADMIN_API_KEY not set - write endpoints are UNPROTECTED.');
      warned = true;
    }
    return next();
  }
  const provided = req.header('x-api-key');
  if (provided !== env.adminApiKey) {
    return next(new ApiError(401, 'Invalid or missing API key'));
  }
  next();
};
