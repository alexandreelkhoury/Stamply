import crypto from 'crypto';

// #16: Use crypto.randomBytes instead of Math.random
export function generateQrCode(): string {
  return crypto.randomBytes(6).toString('base64url').slice(0, 8);
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '');
  // #12: Basic phone validation
  if (cleaned.length < 7 || cleaned.length > 16) {
    throw new Error('Invalid phone number');
  }
  return cleaned;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
