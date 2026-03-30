import { Router, Request, Response } from 'express';
import { customerService } from '../services/customer.service';
import { programRepo } from '../repositories/program.repo';
import { AppError, BadRequestError } from '../types';

const router = Router();

// GET /api/enroll/:code - Get program info for enrollment page (public)
router.get('/:code', async (req: Request, res: Response) => {
  try {
    const code = req.params.code as string;
    const program = await programRepo.findByEnrollmentCode(code);
    if (!program) {
      res.status(404).json({ error: 'Program not found' });
      return;
    }

    res.json({
      program: {
        id: program.id,
        name: program.name,
        stampsRequired: program.stampsRequired,
        rewardText: program.rewardText,
        cardColor: program.cardColor,
        textColor: program.textColor,
        category: program.category,
        stampIcon: program.stampIcon,
        merchant: {
          businessName: program.merchant.businessName,
        },
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Enrollment lookup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/enroll/:code - Self-service enrollment (public)
router.post('/:code', async (req: Request, res: Response) => {
  try {
    const code = req.params.code as string;
    const { phone, name } = req.body;

    if (!phone) {
      throw new BadRequestError('Phone number is required');
    }

    const program = await programRepo.findByEnrollmentCode(code);
    if (!program) {
      res.status(404).json({ error: 'Program not found' });
      return;
    }

    const card = await customerService.createWithCardPublic(
      program.merchantId,
      phone,
      name || null,
      program.id,
    );

    res.status(201).json({
      card: {
        qrCode: card.qrCode,
        currentStamps: card.currentStamps,
        program: {
          name: program.name,
          stampsRequired: program.stampsRequired,
          rewardText: program.rewardText,
        },
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Self-enrollment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
