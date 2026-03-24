import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth';
import { AppError, BadRequestError } from '../types';

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { email, password, businessName } = req.body;
      if (!email || !password || !businessName) {
        throw new BadRequestError('Email, password, and business name are required');
      }

      const result = await authService.register(email, password, businessName);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      console.error('Register error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new BadRequestError('Email and password are required');
      }

      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async me(req: AuthRequest, res: Response) {
    res.json({ merchant: req.merchant });
  },
};
