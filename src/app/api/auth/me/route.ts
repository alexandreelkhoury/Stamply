import { NextResponse } from 'next/server';
import { getCurrentMerchant } from '@/lib/auth';

export async function GET() {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  return NextResponse.json({ merchant });
}
