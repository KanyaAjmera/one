import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
    submitScore, 
    getRecentScores, 
    getBestScores, 
    getUserStats 
} from '../controllers/gameController.js';

const router = express.Router();

// Apply auth middleware to all routes below
router.use(protect);

router.post('/submit', submitScore);
router.get('/recent', getRecentScores);
router.get('/best', getBestScores);
router.get('/stats', getUserStats);

export default router;
