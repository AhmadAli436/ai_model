import { Router } from 'express';
import { ChatController } from '../controllers/ChatController';
import { authenticate } from '../../shared/auth/middleware';

const router = Router();
const chatController = new ChatController();

// All chat routes require authentication
router.post('/message', authenticate, chatController.sendMessage);
router.get('/history', authenticate, chatController.getChatHistory);

export default router;
