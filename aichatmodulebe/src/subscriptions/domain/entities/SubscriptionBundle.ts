export enum BundleTier {
  BASIC = 'basic',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export interface SubscriptionBundle {
  id: string;
  userId: string;
  tier: BundleTier;
  billingCycle: BillingCycle;
  maxMessages: number;
  messagesUsed: number;
  price: number;
  startDate: Date;
  endDate: Date;
  renewalDate: Date | null;
  autoRenew: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionBundleCreate {
  userId: string;
  tier: BundleTier;
  billingCycle: BillingCycle;
  maxMessages: number;
  price: number;
  startDate: Date;
  endDate: Date;
  renewalDate: Date | null;
  autoRenew: boolean;
}
