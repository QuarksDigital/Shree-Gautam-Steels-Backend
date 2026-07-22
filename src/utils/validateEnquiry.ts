import validator from 'validator';

export interface EnquiryInput {
  name: string;
  company: string;
  email: string;
  phone: string;
  interest: string;
  quantity: string;
  message: string;
}

export interface ValidationResult {
  value?: EnquiryInput;
  errors: string[];
}

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/**
 * Validates and sanitizes a raw enquiry payload.
 * - Trims all fields, enforces lengths, validates email.
 * - HTML-escapes free-text fields to neutralize stored XSS.
 */
export const validateEnquiry = (body: Record<string, unknown>): ValidationResult => {
  const errors: string[] = [];

  const name = str(body.name);
  const company = str(body.company);
  const email = str(body.email);
  const phone = str(body.phone);
  const interest = str(body.interest);
  const quantity = str(body.quantity);
  const message = str(body.message);

  if (!name || name.length > 100) errors.push('Name is required (max 100 chars).');
  if (!email || !validator.isEmail(email) || email.length > 150)
    errors.push('A valid email is required.');
  if (!phone || phone.length < 4 || phone.length > 30)
    errors.push('A valid phone number is required.');
  if (company.length > 150) errors.push('Company is too long.');
  if (interest.length > 100) errors.push('Product interest is too long.');
  if (quantity.length > 50) errors.push('Quantity is too long.');
  if (message.length > 2000) errors.push('Message is too long (max 2000 chars).');

  if (errors.length) return { errors };

  return {
    errors: [],
    value: {
      name: validator.escape(name),
      company: validator.escape(company),
      email: validator.normalizeEmail(email) || email.toLowerCase(),
      phone: validator.escape(phone),
      interest: validator.escape(interest),
      quantity: validator.escape(quantity),
      message: validator.escape(message),
    },
  };
};
