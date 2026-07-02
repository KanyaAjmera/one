import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getConversations,
    getConversation,
    createConversation,
    addMessages,
    updateConversation,
    deleteConversation,
} from '../controllers/conversationController.js';

const router = express.Router();

// All routes require auth
router.use(protect);

router.get('/', getConversations);
router.post('/', createConversation);
router.get('/:id', getConversation);
router.post('/:id/messages', addMessages);
router.patch('/:id', updateConversation);
router.delete('/:id', deleteConversation);

export default router;
