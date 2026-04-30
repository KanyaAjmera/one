import express from 'express';
import { askQuestion, getLaws } from '../controllers/chatController.js';

const router = express.Router();

router.post('/ask', askQuestion);
router.get('/laws', getLaws);

export default router;
