import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// #2: Throw if JWT_SECRET is missing in production
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production');
}
const secret = JWT_SECRET || 'dev-secret-local-only';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(merchantId: string): string {
  return jwt.sign({ merchantId }, secret, { expiresIn: '30d' });
}

export function verifyToken(token: string): { merchantId: string } | null {
  try {
    return jwt.verify(token, secret) as { merchantId: string };
  } catch {
    return null;
  }
}
