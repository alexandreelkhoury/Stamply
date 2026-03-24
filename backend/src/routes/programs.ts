import { Router } from 'express';
import { programController } from '../controllers/program.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, programController.list);
router.get('/:id', requireAuth, programController.getById);
router.post('/', requireAuth, programController.create);
router.patch('/:id', requireAuth, programController.update);
router.delete('/:id', requireAuth, programController.delete);

export default router;
