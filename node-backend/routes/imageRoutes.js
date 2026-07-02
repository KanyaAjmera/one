import express from 'express';
import { createImage } from '../controllers/imageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/image', protect, createImage);

export default router;
