import { Router } from 'express';
import { stampController } from '../controllers/stamp.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/', requireAuth, stampController.create);
router.get('/', requireAuth, stampController.list);

export default router;
