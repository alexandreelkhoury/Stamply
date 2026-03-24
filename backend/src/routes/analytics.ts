import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, analyticsController.getDashboard);

export default router;
