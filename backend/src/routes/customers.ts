import { Router } from 'express';
import { customerController } from '../controllers/customer.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, customerController.list);
router.post('/', requireAuth, customerController.create);
router.get('/:id', requireAuth, customerController.getById);

export default router;
