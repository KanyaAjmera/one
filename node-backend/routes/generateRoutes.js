import express from 'express';
import { generatePDF, generatePPT } from '../controllers/generateController.js';

const router = express.Router();

router.post('/pdf', generatePDF);
router.post('/ppt', generatePPT);

export default router;
