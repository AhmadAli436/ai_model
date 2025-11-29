import apiClient from './client';
import { z } from 'zod';

// Validation schemas
export const BundleTierSchema = z.enum(['basic', 'pro', 'enterprise']);
export const BillingCycleSchema = z.enum(['monthly', 'yearly']);

export const CreateSubscriptionSchema = z.object({
  tier: BundleTierSchema,
  billingCycle: BillingCycleSchema,
  autoRenew: z.boolean().default(true),
});

export const SubscriptionBundleSchema = z.object({
  id: z.string(),
  userId: z.string(),
  tier: BundleTierSchema,
  billingCycle: BillingCycleSchema,
  maxMessages: z.number(),
  messagesUsed: z.number(),
  price: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  renewalDate: z.string().nullable(),
  autoRenew: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type BundleTier = z.infer<typeof BundleTierSchema>;
export type BillingCycle = z.infer<typeof BillingCycleSchema>;
export type CreateSubscription = z.infer<typeof CreateSubscriptionSchema>;
export type SubscriptionBundle = z.infer<typeof SubscriptionBundleSchema>;

export const subscriptionApi = {
  // Create a new subscription
  create: async (data: CreateSubscription): Promise<SubscriptionBundle> => {
    const response = await apiClient.post('/api/subscriptions/create', data);
    const responseData = response.data;

    // Handle backend response structure: { message: string, data: {...} }
    const subscriptionData = responseData?.data || responseData;

    return SubscriptionBundleSchema.parse(subscriptionData);
  },

  // Get all user subscriptions
  getAll: async (): Promise<SubscriptionBundle[]> => {
    const response = await apiClient.get('/api/subscriptions');
    const responseData = response.data;

    // Handle backend response structure: { message: string, data: [...] }
    const subscriptionsData = responseData?.data || responseData;

    return z.array(SubscriptionBundleSchema).parse(subscriptionsData);
  },

  // Get active subscriptions
  getActive: async (): Promise<SubscriptionBundle[]> => {
    const response = await apiClient.get('/api/subscriptions/active');
    const responseData = response.data;

    // Handle backend response structure: { message: string, data: [...] }
    const subscriptionsData = responseData?.data || responseData;

    return z.array(SubscriptionBundleSchema).parse(subscriptionsData);
  },

  // Cancel a subscription
  cancel: async (subscriptionId: string): Promise<SubscriptionBundle> => {
    const response = await apiClient.post(
      `/api/subscriptions/${subscriptionId}/cancel`
    );
    const responseData = response.data;

    // Handle backend response structure: { message: string, data: {...} }
    const subscriptionData = responseData?.data || responseData;

    return SubscriptionBundleSchema.parse(subscriptionData);
  },
};
