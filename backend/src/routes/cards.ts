import { Router } from 'express';
import { cardController } from '../controllers/card.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/:qrCode/public', cardController.getPublic);
router.get('/', requireAuth, cardController.list);
router.get('/:id', requireAuth, cardController.getById);

export default router;
