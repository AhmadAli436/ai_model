import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authenticate } from '../../shared/auth/middleware';

const router = Router();
const dashboardController = new DashboardController();

// Dashboard routes require authentication
router.get('/stats', authenticate, dashboardController.getStats);

export default router;
