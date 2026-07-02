import express from 'express';
import { createPDF } from '../controllers/pdfController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/pdf', protect, createPDF);

export default router;
