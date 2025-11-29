import { ChatRepository } from '../../chat/repositories/ChatRepository';
import { UserUsageRepository } from '../../chat/repositories/UserUsageRepository';
import { SubscriptionRepository } from '../../subscriptions/repositories/SubscriptionRepository';

export interface DashboardStats {
  totalMessages: number;
  totalSubscriptions: number;
  remainingQuota: number | null; // null if unlimited (Enterprise)
}

export class DashboardService {
  private chatRepository: ChatRepository;
  private userUsageRepository: UserUsageRepository;
  private subscriptionRepository: SubscriptionRepository;
  private readonly FREE_MESSAGES_PER_MONTH = 3;

  constructor() {
    this.chatRepository = new ChatRepository();
    this.userUsageRepository = new UserUsageRepository();
    this.subscriptionRepository = new SubscriptionRepository();
  }

  async getDashboardStats(userId: string): Promise<DashboardStats> {
    // Get total messages
    const messages = await this.chatRepository.findByUserId(userId);
    const totalMessages = messages.length;

    // Get total subscriptions
    const subscriptions =
      await this.subscriptionRepository.findByUserId(userId);
    const totalSubscriptions = subscriptions.length;

    // Calculate remaining quota
    const remainingQuota = await this.calculateRemainingQuota(userId);

    return {
      totalMessages,
      totalSubscriptions,
      remainingQuota,
    };
  }

  private async calculateRemainingQuota(
    userId: string
  ): Promise<number | null> {
    // Check free quota
    const userUsage = await this.userUsageRepository.findByUserId(userId);
    const freeQuotaRemaining = userUsage
      ? Math.max(0, this.FREE_MESSAGES_PER_MONTH - userUsage.freeMessagesUsed)
      : this.FREE_MESSAGES_PER_MONTH;

    // If free quota available, return it
    if (freeQuotaRemaining > 0) {
      return freeQuotaRemaining;
    }

    // Check subscription bundles
    const activeBundles =
      await this.subscriptionRepository.findActiveByUserId(userId);

    if (activeBundles.length === 0) {
      return 0; // No quota available
    }

    // Find bundle with remaining quota
    const bundleWithQuota = activeBundles.find(
      bundle => bundle.messagesUsed < bundle.maxMessages
    );

    if (!bundleWithQuota) {
      return 0; // No quota available
    }

    // Check if Enterprise (unlimited)
    if (bundleWithQuota.tier === 'enterprise') {
      return null; // Unlimited
    }

    // Calculate remaining quota from subscription
    const subscriptionQuotaRemaining =
      bundleWithQuota.maxMessages - bundleWithQuota.messagesUsed;

    return subscriptionQuotaRemaining;
  }
}
