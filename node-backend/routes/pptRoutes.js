import express from 'express';
import { createPPT } from '../controllers/pptController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/ppt', protect, createPPT);

export default router;
