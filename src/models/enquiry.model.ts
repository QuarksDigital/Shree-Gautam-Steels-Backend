import { Schema, model, type InferSchemaType } from 'mongoose';

const enquirySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    company: { type: String, trim: true, maxlength: 150, default: '' },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 150 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    interest: { type: String, trim: true, maxlength: 100, default: '' },
    quantity: { type: String, trim: true, maxlength: 50, default: '' },
    message: { type: String, trim: true, maxlength: 2000, default: '' },
    status: {
      type: String,
      enum: ['new', 'contacted', 'closed'],
      default: 'new',
      index: true,
    },
    meta: {
      ip: String,
      userAgent: String,
    },
  },
  { timestamps: true },
);

export type EnquiryDoc = InferSchemaType<typeof enquirySchema>;

export const EnquiryModel = model('Enquiry', enquirySchema);
