import { SubscriptionRepository } from '../repositories/SubscriptionRepository';
import {
  SubscriptionBundle,
  SubscriptionBundleCreate,
  BundleTier,
  BillingCycle,
} from '../domain/entities/SubscriptionBundle';
import { getPricing } from '../config/pricing';
import { NotFoundError, ValidationError } from '../../shared/utils/errors';

export class SubscriptionService {
  private subscriptionRepository: SubscriptionRepository;
  private readonly PAYMENT_SUCCESS_RATE = 0.8; // 80% success rate

  constructor() {
    this.subscriptionRepository = new SubscriptionRepository();
  }

  async createSubscription(
    userId: string,
    tier: BundleTier,
    billingCycle: BillingCycle,
    autoRenew: boolean = true
  ): Promise<SubscriptionBundle> {
    // Get pricing configuration
    const pricing = getPricing(tier, billingCycle);

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();

    if (billingCycle === BillingCycle.MONTHLY) {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Set renewal date (only if auto-renew is enabled)
    const renewalDate = autoRenew ? new Date(endDate) : null;

    // Create subscription bundle
    const bundleData: SubscriptionBundleCreate = {
      userId,
      tier,
      billingCycle,
      maxMessages: pricing.maxMessages,
      price: pricing.price,
      startDate,
      endDate,
      renewalDate,
      autoRenew,
    };

    const bundle = await this.subscriptionRepository.create(bundleData);

    return bundle;
  }

  async getUserSubscriptions(userId: string): Promise<SubscriptionBundle[]> {
    return this.subscriptionRepository.findByUserId(userId);
  }

  async getActiveSubscriptions(userId: string): Promise<SubscriptionBundle[]> {
    return this.subscriptionRepository.findActiveByUserId(userId);
  }

  async cancelSubscription(
    userId: string,
    subscriptionId: string
  ): Promise<SubscriptionBundle> {
    // Verify subscription belongs to user
    const subscription =
      await this.subscriptionRepository.findById(subscriptionId);

    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }

    if (subscription.userId !== userId) {
      throw new ValidationError('Subscription does not belong to user');
    }

    // Cancel subscription (disable auto-renew)
    const cancelled = await this.subscriptionRepository.cancel(subscriptionId);

    return cancelled;
  }

  async processAutoRenewals(): Promise<{
    renewed: number;
    failed: number;
    processed: SubscriptionBundle[];
  }> {
    // Get all subscriptions that need renewal
    // (auto_renew = true, end_date <= today, is_active = true)
    const allSubscriptions = await this.getAllSubscriptionsNeedingRenewal();

    let renewed = 0;
    let failed = 0;
    const processed: SubscriptionBundle[] = [];

    for (const subscription of allSubscriptions) {
      const result = await this.processRenewal(subscription);
      processed.push(result);

      if (result.isActive) {
        renewed++;
      } else {
        failed++;
      }
    }

    return { renewed, failed, processed };
  }

  private async getAllSubscriptionsNeedingRenewal(): Promise<
    SubscriptionBundle[]
  > {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all subscriptions and filter for those needing renewal
    const allSubscriptions = await this.subscriptionRepository.findAll();

    return allSubscriptions.filter(sub => {
      const endDate = new Date(sub.endDate);
      endDate.setHours(0, 0, 0, 0);
      return sub.autoRenew && sub.isActive && endDate <= today;
    });
  }

  private async processRenewal(
    subscription: SubscriptionBundle
  ): Promise<SubscriptionBundle> {
    // Simulate payment processing
    const paymentSuccess = this.simulatePayment();

    if (paymentSuccess) {
      // Payment successful - create new subscription
      const newBundle = await this.createSubscription(
        subscription.userId,
        subscription.tier,
        subscription.billingCycle,
        subscription.autoRenew
      );

      // Optionally, you could deactivate the old one or keep it for history
      // For now, we'll keep both (old one will naturally expire)

      return newBundle;
    } else {
      // Payment failed - mark subscription as inactive
      const deactivated = await this.subscriptionRepository.deactivate(
        subscription.id
      );

      console.log(
        `Payment failed for subscription ${subscription.id}. Subscription deactivated.`
      );

      return deactivated;
    }
  }

  private simulatePayment(): boolean {
    // Simulate payment with 80% success rate
    return Math.random() < this.PAYMENT_SUCCESS_RATE;
  }

  async getSubscriptionById(
    subscriptionId: string
  ): Promise<SubscriptionBundle | null> {
    return this.subscriptionRepository.findById(subscriptionId);
  }
}
