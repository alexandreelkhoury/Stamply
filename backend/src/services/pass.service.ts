import path from 'path';
import fs from 'fs';
import { PKPass } from 'passkit-generator';
import { db } from '../lib/db';
import { NotFoundError, BadRequestError } from '../types';
import { randomUUID } from 'crypto';

const PASS_TYPE_ID = process.env.APPLE_PASS_TYPE_ID || '';
const TEAM_ID = process.env.APPLE_TEAM_ID || '';
const APPLE_CERTS_DIR = process.env.APPLE_CERTS_DIR || path.join(__dirname, '../../certs');
const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:4000';

function appleWalletConfigured(): boolean {
  if (!PASS_TYPE_ID || !TEAM_ID) return false;
  try {
    const signerCert = path.join(APPLE_CERTS_DIR, 'signerCert.pem');
    const signerKey = path.join(APPLE_CERTS_DIR, 'signerKey.pem');
    const wwdr = path.join(APPLE_CERTS_DIR, 'wwdr.pem');
    return fs.existsSync(signerCert) && fs.existsSync(signerKey) && fs.existsSync(wwdr);
  } catch {
    return false;
  }
}

function googleWalletConfigured(): boolean {
  return !!(process.env.GOOGLE_WALLET_ISSUER_ID && process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_KEY);
}

export const passService = {
  getCapabilities() {
    return {
      appleWallet: appleWalletConfigured(),
      googleWallet: googleWalletConfigured(),
    };
  },

  async generateApplePass(qrCode: string): Promise<Buffer> {
    if (!appleWalletConfigured()) {
      throw new BadRequestError('Apple Wallet is not configured. Contact the administrator.');
    }

    const card = await db.card.findUnique({
      where: { qrCode },
      include: {
        customer: true,
        program: {
          include: {
            merchant: { select: { businessName: true, address: true, city: true } },
          },
        },
      },
    });

    if (!card) throw new NotFoundError('Card');

    const serial = card.applePassSerial || randomUUID();

    // Save serial if new
    if (!card.applePassSerial) {
      await db.card.update({
        where: { id: card.id },
        data: { applePassSerial: serial },
      });
    }

    const signerCert = fs.readFileSync(path.join(APPLE_CERTS_DIR, 'signerCert.pem'));
    const signerKey = fs.readFileSync(path.join(APPLE_CERTS_DIR, 'signerKey.pem'));
    const wwdr = fs.readFileSync(path.join(APPLE_CERTS_DIR, 'wwdr.pem'));
    const signerKeyPassphrase = process.env.APPLE_SIGNER_KEY_PASSPHRASE || '';

    const pass = new PKPass(
      {},
      {
        signerCert,
        signerKey,
        wwdr,
        signerKeyPassphrase,
      },
      {
        formatVersion: 1,
        serialNumber: serial,
        passTypeIdentifier: PASS_TYPE_ID,
        teamIdentifier: TEAM_ID,
        organizationName: card.program.merchant.businessName,
        description: `${card.program.name} Loyalty Card`,
        foregroundColor: 'rgb(255, 255, 255)',
        backgroundColor: hexToRgb(card.program.cardColor),
        logoText: card.program.merchant.businessName,
      },
    );

    pass.type = 'storeCard';

    // Header fields
    pass.headerFields.push({
      key: 'rewards',
      label: 'REWARDS',
      value: String(card.rewardsEarned),
    });

    // Primary fields
    pass.primaryFields.push({
      key: 'stamps',
      label: 'STAMPS',
      value: `${card.currentStamps} / ${card.program.stampsRequired}`,
    });

    // Secondary fields
    pass.secondaryFields.push({
      key: 'reward',
      label: 'REWARD',
      value: card.program.rewardText,
    });

    if (card.customer.name) {
      pass.secondaryFields.push({
        key: 'member',
        label: 'MEMBER',
        value: card.customer.name,
      });
    }

    // Auxiliary fields
    pass.auxiliaryFields.push({
      key: 'remaining',
      label: 'REMAINING',
      value: `${Math.max(0, card.program.stampsRequired - card.currentStamps)} stamps`,
    });

    // Back fields
    pass.backFields.push(
      {
        key: 'program',
        label: 'PROGRAM',
        value: card.program.name,
      },
      {
        key: 'business',
        label: 'BUSINESS',
        value: card.program.merchant.businessName,
      },
    );

    if (card.program.merchant.address) {
      pass.backFields.push({
        key: 'address',
        label: 'ADDRESS',
        value: `${card.program.merchant.address}${card.program.merchant.city ? `, ${card.program.merchant.city}` : ''}`,
      });
    }

    // Barcode — merchant scans this QR code to add stamps
    pass.setBarcodes({
      format: 'PKBarcodeFormatQR',
      message: card.qrCode,
      messageEncoding: 'iso-8859-1',
      altText: card.qrCode,
    });

    // Web service for automatic updates (optional, when webServiceURL is configured)
    if (process.env.APPLE_PASS_WEB_SERVICE_URL) {
      (pass as any).webServiceURL = process.env.APPLE_PASS_WEB_SERVICE_URL;
      (pass as any).authenticationToken = serial;
    }

    const buffer = pass.getAsBuffer();
    return buffer;
  },

  async generateGoogleWalletLink(qrCode: string): Promise<string> {
    if (!googleWalletConfigured()) {
      throw new BadRequestError('Google Wallet is not configured. Contact the administrator.');
    }

    const card = await db.card.findUnique({
      where: { qrCode },
      include: {
        customer: true,
        program: {
          include: {
            merchant: { select: { businessName: true, address: true, city: true } },
          },
        },
      },
    });

    if (!card) throw new NotFoundError('Card');

    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID!;
    const classId = `${issuerId}.stamply_${card.programId}`;
    const objectId = `${issuerId}.stamply_card_${card.id}`;

    // Save Google pass ID if new
    if (!card.googlePassId) {
      await db.card.update({
        where: { id: card.id },
        data: { googlePassId: objectId },
      });
    }

    // Build JWT for Save to Google Wallet link
    const jwt = await import('jsonwebtoken');
    const serviceAccountKey = JSON.parse(process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_KEY!);

    const claims = {
      iss: serviceAccountKey.client_email,
      aud: 'google',
      origins: [APP_URL],
      typ: 'savetowallet',
      payload: {
        loyaltyClasses: [
          {
            id: classId,
            issuerName: card.program.merchant.businessName,
            programName: card.program.name,
            programLogo: {
              sourceUri: { uri: `${APP_URL}/icon-192.png` },
            },
            hexBackgroundColor: card.program.cardColor,
            reviewStatus: 'UNDER_REVIEW',
          },
        ],
        loyaltyObjects: [
          {
            id: objectId,
            classId,
            state: 'ACTIVE',
            accountId: card.customer.phone,
            accountName: card.customer.name || card.customer.phone,
            loyaltyPoints: {
              label: 'Stamps',
              balance: { int: card.currentStamps },
            },
            barcode: {
              type: 'QR_CODE',
              value: card.qrCode,
              alternateText: card.qrCode,
            },
            textModulesData: [
              {
                header: 'Reward',
                body: card.program.rewardText,
              },
              {
                header: 'Progress',
                body: `${card.currentStamps} / ${card.program.stampsRequired} stamps`,
              },
            ],
          },
        ],
      },
    };

    const token = jwt.default.sign(claims, serviceAccountKey.private_key, { algorithm: 'RS256' });
    return `https://pay.google.com/gp/v/save/${token}`;
  },
};

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return 'rgb(108, 99, 255)';
  return `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`;
}
