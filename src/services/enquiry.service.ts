import { EnquiryModel } from '@/models/enquiry.model';
import { isDbConnected } from '@/config/db';
import { ApiError } from '@/utils/ApiError';
import type { EnquiryInput } from '@/utils/validateEnquiry';

interface Meta {
  ip?: string;
  userAgent?: string;
}

const requireDb = (): void => {
  if (!isDbConnected()) {
    throw new ApiError(503, 'Database not connected - enquiry could not be saved.');
  }
};

class EnquiryService {
  async create(input: EnquiryInput, meta: Meta): Promise<{ id: string }> {
    requireDb();
    const doc = await EnquiryModel.create({ ...input, meta });
    return { id: String(doc._id) };
  }

  async list(opts: { status?: string; limit?: number } = {}): Promise<Record<string, unknown>[]> {
    requireDb();
    const filter: Record<string, unknown> = {};
    if (opts.status) filter.status = opts.status;
    const limit = Math.min(Math.max(opts.limit ?? 100, 1), 500);
    return EnquiryModel.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
  }

  async setStatus(id: string, status: string): Promise<Record<string, unknown> | null> {
    requireDb();
    if (!['new', 'contacted', 'closed'].includes(status)) {
      throw ApiError.badRequest("status must be 'new', 'contacted' or 'closed'.");
    }
    return EnquiryModel.findByIdAndUpdate(id, { $set: { status } }, { new: true }).lean();
  }
}

export const enquiryService = new EnquiryService();
