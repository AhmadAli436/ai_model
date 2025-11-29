import {
  BundleTier,
  BillingCycle,
} from '../domain/entities/SubscriptionBundle';

export interface PricingConfig {
  maxMessages: number;
  price: number;
}

export const PRICING: Record<
  BundleTier,
  Record<BillingCycle, PricingConfig>
> = {
  basic: {
    monthly: {
      maxMessages: 10,
      price: 10.0,
    },
    yearly: {
      maxMessages: 10,
      price: 100.0, // 10 months worth (discount)
    },
  },
  pro: {
    monthly: {
      maxMessages: 100,
      price: 50.0,
    },
    yearly: {
      maxMessages: 100,
      price: 500.0, // 10 months worth (discount)
    },
  },
  enterprise: {
    monthly: {
      maxMessages: 999999, // Unlimited (very large number)
      price: 200.0,
    },
    yearly: {
      maxMessages: 999999, // Unlimited
      price: 2000.0, // 10 months worth (discount)
    },
  },
};

export const getPricing = (
  tier: BundleTier,
  billingCycle: BillingCycle
): PricingConfig => {
  return PRICING[tier][billingCycle];
};
