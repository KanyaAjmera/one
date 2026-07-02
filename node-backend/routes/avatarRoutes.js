import express from 'express';
import { createAvatar } from '../controllers/avatarController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/avatar', protect, createAvatar);

export default router;
