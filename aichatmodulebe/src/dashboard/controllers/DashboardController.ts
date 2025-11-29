import { Response } from 'express';
import { AuthRequest } from '../../shared/auth/middleware';
import { DashboardService } from '../services/DashboardService';
import { AppError } from '../../shared/utils/errors';

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  getStats = async (req: AuthRequest, res: Response): Promise<void> => {
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

      const stats = await this.dashboardService.getDashboardStats(userId);

      res.status(200).json({
        message: 'Dashboard stats retrieved successfully',
        data: stats,
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
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
