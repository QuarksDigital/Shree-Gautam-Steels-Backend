import rateLimit from 'express-rate-limit';

const json = (message: string) => ({
  handler: (_req: unknown, res: { status: (n: number) => { json: (b: unknown) => void } }) =>
    res.status(429).json({ success: false, message }),
  standardHeaders: true,
  legacyHeaders: false,
});

/** Broad limiter for the whole API. */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  ...json('Too many requests - please slow down and try again shortly.'),
});

/** Strict limiter for enquiry submissions (anti-spam). */
export const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  ...json('Too many enquiries from this IP. Please try again later.'),
});
