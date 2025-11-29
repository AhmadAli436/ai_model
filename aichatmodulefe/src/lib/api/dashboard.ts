import apiClient from './client';
import { z } from 'zod';

// Dashboard stats schema
export const DashboardStatsSchema = z.object({
  totalMessages: z.number(),
  totalSubscriptions: z.number(),
  remainingQuota: z.number().nullable(),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

export const dashboardApi = {
  // Get dashboard statistics
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/api/dashboard/stats');
    const responseData = response.data;

    // Handle backend response structure: { message: string, data: {...} }
    const statsData = responseData?.data || responseData;

    return DashboardStatsSchema.parse(statsData);
  },
};
