import { Response } from 'express';
import { AuthRequest } from '../../shared/auth/middleware';
import { SubscriptionService } from '../services/SubscriptionService';
import {
  BundleTier,
  BillingCycle,
} from '../domain/entities/SubscriptionBundle';
import { AppError } from '../../shared/utils/errors';

export class SubscriptionController {
  private subscriptionService: SubscriptionService;

  constructor() {
    this.subscriptionService = new SubscriptionService();
  }

  createSubscription = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { tier, billingCycle, autoRenew } = req.body;

      if (!userId) {
        res.status(401).json({
          error: {
            message: 'Unauthorized: User not authenticated',
            code: 'UNAUTHORIZED',
          },
        });
        return;
      }

      // Validate tier
      if (!tier || !Object.values(BundleTier).includes(tier)) {
        res.status(400).json({
          error: {
            message: 'Invalid tier. Must be: basic, pro, or enterprise',
            code: 'VALIDATION_ERROR',
          },
        });
        return;
      }

      // Validate billing cycle
      if (
        !billingCycle ||
        !Object.values(BillingCycle).includes(billingCycle)
      ) {
        res.status(400).json({
          error: {
            message: 'Invalid billing cycle. Must be: monthly or yearly',
            code: 'VALIDATION_ERROR',
          },
        });
        return;
      }

      const subscription = await this.subscriptionService.createSubscription(
        userId,
        tier as BundleTier,
        billingCycle as BillingCycle,
        autoRenew !== undefined ? Boolean(autoRenew) : true
      );

      res.status(201).json({
        message: 'Subscription created successfully',
        data: subscription,
      });
    } catch (error) {
      console.error('Create subscription error:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: {
            message: error.message,
            code: error.code,
          },
        });
      } else {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error('Unexpected create subscription error:', errorMessage);
        res.status(500).json({
          error: {
            message: 'Internal server error',
            code: 'INTERNAL_ERROR',
            ...(process.env.NODE_ENV === 'development' && {
              details: errorMessage,
            }),
          },
        });
      }
    }
  };

  getUserSubscriptions = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          error: {
            message: 'Unauthorized: User not authenticated',
            code: 'UNAUTHORIZED',
          },
        });
        return;
      }

      const subscriptions =
        await this.subscriptionService.getUserSubscriptions(userId);

      res.status(200).json({
        message: 'Subscriptions retrieved successfully',
        data: subscriptions,
      });
    } catch (error) {
      console.error('Get subscriptions error:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: {
            message: error.message,
            code: error.code,
          },
        });
      } else {
        res.status(500).json({
          error: {
            message: 'Internal server error',
            code: 'INTERNAL_ERROR',
          },
        });
      }
    }
  };

  getActiveSubscriptions = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          error: {
            message: 'Unauthorized: User not authenticated',
            code: 'UNAUTHORIZED',
          },
        });
        return;
      }

      const subscriptions =
        await this.subscriptionService.getActiveSubscriptions(userId);

      res.status(200).json({
        message: 'Active subscriptions retrieved successfully',
        data: subscriptions,
      });
    } catch (error) {
      console.error('Get active subscriptions error:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: {
            message: error.message,
            code: error.code,
          },
        });
      } else {
        res.status(500).json({
          error: {
            message: 'Internal server error',
            code: 'INTERNAL_ERROR',
          },
        });
      }
    }
  };

  cancelSubscription = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({
          error: {
            message: 'Unauthorized: User not authenticated',
            code: 'UNAUTHORIZED',
          },
        });
        return;
      }

      if (!id) {
        res.status(400).json({
          error: {
            message: 'Subscription ID is required',
            code: 'VALIDATION_ERROR',
          },
        });
        return;
      }

      const subscription = await this.subscriptionService.cancelSubscription(
        userId,
        id
      );

      res.status(200).json({
        message: 'Subscription cancelled successfully',
        data: subscription,
      });
    } catch (error) {
      console.error('Cancel subscription error:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: {
            message: error.message,
            code: error.code,
          },
        });
      } else {
        res.status(500).json({
          error: {
            message: 'Internal server error',
            code: 'INTERNAL_ERROR',
          },
        });
      }
    }
  };

  processRenewals = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      // This endpoint can be called manually or by a cron job
      // In production, you'd want to protect this with admin authentication
      const result = await this.subscriptionService.processAutoRenewals();

      res.status(200).json({
        message: 'Auto-renewals processed successfully',
        data: {
          renewed: result.renewed,
          failed: result.failed,
          total: result.processed.length,
        },
      });
    } catch (error) {
      console.error('Process renewals error:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: {
            message: error.message,
            code: error.code,
          },
        });
      } else {
        res.status(500).json({
          error: {
            message: 'Internal server error',
            code: 'INTERNAL_ERROR',
          },
        });
      }
    }
  };
}
