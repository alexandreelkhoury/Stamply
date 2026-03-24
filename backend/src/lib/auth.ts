import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(merchantId: string): string {
  return jwt.sign({ merchantId }, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): { merchantId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { merchantId: string };
  } catch {
    return null;
  }
}
