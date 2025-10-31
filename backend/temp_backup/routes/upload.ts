import express from 'express';
import { upload, handleUploadError } from '../middleware/upload';
import { uploadFile } from '../controllers/uploadController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Routes
router.post('/', authenticate, authorize('admin'), upload.single('image'), handleUploadError, uploadFile);

export default router;
