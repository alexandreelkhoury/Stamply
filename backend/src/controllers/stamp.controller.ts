import { Response } from 'express';
import { stampService } from '../services/stamp.service';
import { AuthRequest } from '../middleware/auth';
import { AppError, BadRequestError } from '../types';

export const stampController = {
  async create(req: AuthRequest, res: Response) {
    try {
      const { qrCode } = req.body;
      if (!qrCode) {
        throw new BadRequestError('QR code is required');
      }

      const result = await stampService.addStamp(qrCode, req.merchant!.id);
      res.json(result);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      console.error('Stamp error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async list(req: AuthRequest, res: Response) {
    try {
      const stamps = await stampService.list(req.merchant!.id);
      res.json({ stamps });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      console.error('Get stamps error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
