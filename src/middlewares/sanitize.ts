import type { NextFunction, Request, Response } from 'express';

/** Recursively strip keys that could carry MongoDB operators ($ or dotted keys). */
const clean = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (k.startsWith('$') || k.includes('.')) continue;
      out[k] = clean(v);
    }
    return out;
  }
  return value;
};

/** Sanitizes req.body and req.params against NoSQL-operator injection. */
export const mongoSanitize = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === 'object') req.body = clean(req.body) as typeof req.body;
  if (req.params && typeof req.params === 'object')
    req.params = clean(req.params) as typeof req.params;
  next();
};
