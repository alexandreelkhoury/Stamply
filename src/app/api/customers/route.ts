import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentMerchant } from '@/lib/auth';
import { generateQrCode } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { phone, name, programId } = await req.json();

    if (!phone || !programId) {
      return NextResponse.json({ error: 'Missing phone or program ID' }, { status: 400 });
    }

    // Verify merchant owns this program
    const program = await db.program.findFirst({
      where: { id: programId, merchantId: merchant.id },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Find or create customer
    let customer = await db.customer.findUnique({ where: { phone } });
    if (!customer) {
      customer = await db.customer.create({
        data: { phone, name: name || null },
      });
    }

    // Check if card already exists
    const existingCard = await db.card.findUnique({
      where: {
        customerId_programId: {
          customerId: customer.id,
          programId: program.id,
        },
      },
    });

    if (existingCard) {
      return NextResponse.json({
        card: existingCard,
        message: 'Customer already has a card for this program',
      });
    }

    // Generate unique QR code
    let qrCode = generateQrCode();
    while (await db.card.findUnique({ where: { qrCode } })) {
      qrCode = generateQrCode();
    }

    // Create card
    const card = await db.card.create({
      data: {
        customerId: customer.id,
        programId: program.id,
        qrCode,
      },
    });

    return NextResponse.json({ card, customer }, { status: 201 });
  } catch (error) {
    console.error('Create customer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
