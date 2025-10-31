import express from 'express';
import { generateQR, verifyAndCheckIn, verifyOnly } from '../controllers/qrController';

const router = express.Router();

router.get('/generate/:bookingId', generateQR);
router.post('/verify', verifyAndCheckIn);
router.post('/verify-only', verifyOnly);

export default router;

