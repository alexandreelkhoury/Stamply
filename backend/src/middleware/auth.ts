import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/auth';
import { db } from '../lib/db';

export interface AuthRequest extends Request {
  merchant?: {
    id: string;
    email: string;
    businessName: string;
    phone: string | null;
    logoUrl: string | null;
    subscriptionStatus: string;
  };
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.token;

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

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

  if (!merchant) {
    res.status(401).json({ error: 'Merchant not found' });
    return;
  }

  req.merchant = merchant;
  next();
}
