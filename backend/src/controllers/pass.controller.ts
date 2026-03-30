import { Request, Response } from 'express';
import { passService } from '../services/pass.service';
import { AppError } from '../types';

export const passController = {
  async getCapabilities(_req: Request, res: Response) {
    try {
      const capabilities = passService.getCapabilities();
      res.json(capabilities);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      console.error('Get pass capabilities error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getApplePass(req: Request, res: Response) {
    try {
      const qrCode = req.params.qrCode as string;
      const buffer = await passService.generateApplePass(qrCode);

      res.set({
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename=stamply-${qrCode}.pkpass`,
      });
      res.send(buffer);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      console.error('Generate Apple Pass error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getGoogleWalletLink(req: Request, res: Response) {
    try {
      const qrCode = req.params.qrCode as string;
      const link = await passService.generateGoogleWalletLink(qrCode);
      res.json({ link });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      console.error('Generate Google Wallet link error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
