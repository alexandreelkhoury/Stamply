import { Response } from 'express';
import { customerService } from '../services/customer.service';
import { AuthRequest } from '../middleware/auth';
import { AppError, BadRequestError } from '../types';

export const customerController = {
  async list(req: AuthRequest, res: Response) {
    try {
      const customers = await customerService.list(req.merchant!.id);
      res.json({ customers });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      console.error('Get customers error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const { phone, name, programId } = req.body;
      if (!phone || !programId) {
        throw new BadRequestError('Phone and programId are required');
      }

      const card = await customerService.createWithCard(
        req.merchant!.id,
        phone,
        name || null,
        programId,
      );
      res.status(201).json({ card });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      console.error('Create customer error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const customer = await customerService.getById(id, req.merchant!.id);
      res.json({ customer });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      console.error('Get customer error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
