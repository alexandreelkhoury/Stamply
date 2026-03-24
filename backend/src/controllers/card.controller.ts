import { Request, Response } from 'express';
import { cardService } from '../services/card.service';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../types';

export const cardController = {
  async getPublic(req: Request, res: Response) {
    try {
      const qrCode = req.params.qrCode as string;
      const card = await cardService.getPublic(qrCode);
      res.json({ card });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      console.error('Get public card error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async list(req: AuthRequest, res: Response) {
    try {
      const cards = await cardService.list(req.merchant!.id);
      res.json({ cards });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      console.error('Get cards error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const card = await cardService.getById(id, req.merchant!.id);
      res.json({ card });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      console.error('Get card error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
