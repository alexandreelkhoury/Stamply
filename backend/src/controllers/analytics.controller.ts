import { Response } from 'express';
import { analyticsService } from '../services/analytics.service';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../types';

export const analyticsController = {
  async getDashboard(req: AuthRequest, res: Response) {
    try {
      const data = await analyticsService.getDashboard(req.merchant!.id);
      res.json(data);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      console.error('Analytics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
