import { Router } from 'express';
import { SubscriptionController } from '../controllers/SubscriptionController';
import { authenticate } from '../../shared/auth/middleware';

const router = Router();
const subscriptionController = new SubscriptionController();

// All subscription routes require authentication
router.post('/create', authenticate, subscriptionController.createSubscription);
router.get('/', authenticate, subscriptionController.getUserSubscriptions);
router.get(
  '/active',
  authenticate,
  subscriptionController.getActiveSubscriptions
);
router.post(
  '/:id/cancel',
  authenticate,
  subscriptionController.cancelSubscription
);
router.post(
  '/renewals/process',
  authenticate,
  subscriptionController.processRenewals
);

export default router;
