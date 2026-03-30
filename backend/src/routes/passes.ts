import { Router } from 'express';
import { passController } from '../controllers/pass.controller';

const router = Router();

// Public endpoints — customers access these from their card page
router.get('/capabilities', passController.getCapabilities);
router.get('/apple/:qrCode', passController.getApplePass);
router.get('/google/:qrCode', passController.getGoogleWalletLink);

export default router;
