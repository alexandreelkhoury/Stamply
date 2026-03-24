import { Response } from 'express';
import { programService } from '../services/program.service';
import { AuthRequest } from '../middleware/auth';
import { AppError, BadRequestError } from '../types';

export const programController = {
  async list(req: AuthRequest, res: Response) {
    try {
      const programs = await programService.list(req.merchant!.id);
      res.json({ programs });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      console.error('Get programs error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const program = await programService.getById(id, req.merchant!.id);
      res.json({ program });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      console.error('Get program error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const { name, stampsRequired, rewardText, cardColor, textColor } = req.body;
      if (!name || !stampsRequired || !rewardText) {
        throw new BadRequestError('Name, stampsRequired, and rewardText are required');
      }

      const program = await programService.create(req.merchant!.id, {
        name,
        stampsRequired: parseInt(stampsRequired),
        rewardText,
        cardColor,
        textColor,
      });
      res.status(201).json({ program });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      console.error('Create program error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const { name, stampsRequired, rewardText, cardColor, textColor, isActive } = req.body;

      const data: Record<string, unknown> = {};
      if (name !== undefined) data.name = name;
      if (stampsRequired !== undefined) data.stampsRequired = parseInt(stampsRequired);
      if (rewardText !== undefined) data.rewardText = rewardText;
      if (cardColor !== undefined) data.cardColor = cardColor;
      if (textColor !== undefined) data.textColor = textColor;
      if (isActive !== undefined) data.isActive = isActive;

      const program = await programService.update(id, req.merchant!.id, data);
      res.json({ program });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      console.error('Update program error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      await programService.delete(id, req.merchant!.id);
      res.json({ message: 'Program deleted' });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      console.error('Delete program error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
