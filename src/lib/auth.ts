import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { db } from './db';

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

export async function getCurrentMerchant() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const merchant = await db.merchant.findUnique({
    where: { id: payload.merchantId },
    select: {
      id: true,
      email: true,
      businessName: true,
      phone: true,
      logoUrl: true,
      subscriptionStatus: true,
    },
  });

  return merchant;
}
