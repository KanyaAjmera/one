import express from 'express';
import { 
    getGenerations, 
    getGeneration, 
    deleteGeneration 
} from '../controllers/generationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getGenerations);
router.get('/:id', protect, getGeneration);
router.delete('/:id', protect, deleteGeneration);

export default router;
