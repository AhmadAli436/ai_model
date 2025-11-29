import pool from '../../shared/db/connection';
import {
  SubscriptionBundle,
  SubscriptionBundleCreate,
  BundleTier,
  BillingCycle,
} from '../domain/entities/SubscriptionBundle';

export class SubscriptionRepository {
  async create(bundle: SubscriptionBundleCreate): Promise<SubscriptionBundle> {
    const query = `
      INSERT INTO subscription_bundles (
        user_id, tier, billing_cycle, max_messages, messages_used, price,
        start_date, end_date, renewal_date, auto_renew, is_active, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, 0, $5, $6, $7, $8, $9, true, NOW(), NOW())
      RETURNING 
        id, user_id as "userId", tier, billing_cycle as "billingCycle",
        max_messages as "maxMessages", messages_used as "messagesUsed", price,
        start_date as "startDate", end_date as "endDate", renewal_date as "renewalDate",
        auto_renew as "autoRenew", is_active as "isActive",
        created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await pool.query(query, [
      bundle.userId,
      bundle.tier,
      bundle.billingCycle,
      bundle.maxMessages,
      bundle.price,
      bundle.startDate,
      bundle.endDate,
      bundle.renewalDate,
      bundle.autoRenew,
    ]);

    return this.mapRowToSubscriptionBundle(result.rows[0]);
  }

  async findByUserId(userId: string): Promise<SubscriptionBundle[]> {
    const query = `
      SELECT 
        id, user_id as "userId", tier, billing_cycle as "billingCycle",
        max_messages as "maxMessages", messages_used as "messagesUsed", price,
        start_date as "startDate", end_date as "endDate", renewal_date as "renewalDate",
        auto_renew as "autoRenew", is_active as "isActive",
        created_at as "createdAt", updated_at as "updatedAt"
      FROM subscription_bundles
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows.map(row => this.mapRowToSubscriptionBundle(row));
  }

  async findActiveByUserId(userId: string): Promise<SubscriptionBundle[]> {
    const query = `
      SELECT 
        id, user_id as "userId", tier, billing_cycle as "billingCycle",
        max_messages as "maxMessages", messages_used as "messagesUsed", price,
        start_date as "startDate", end_date as "endDate", renewal_date as "renewalDate",
        auto_renew as "autoRenew", is_active as "isActive",
        created_at as "createdAt", updated_at as "updatedAt"
      FROM subscription_bundles
      WHERE user_id = $1 AND is_active = true AND end_date > NOW()
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows.map(row => this.mapRowToSubscriptionBundle(row));
  }

  async findLatestWithQuota(
    userId: string
  ): Promise<SubscriptionBundle | null> {
    const query = `
      SELECT 
        id, user_id as "userId", tier, billing_cycle as "billingCycle",
        max_messages as "maxMessages", messages_used as "messagesUsed", price,
        start_date as "startDate", end_date as "endDate", renewal_date as "renewalDate",
        auto_renew as "autoRenew", is_active as "isActive",
        created_at as "createdAt", updated_at as "updatedAt"
      FROM subscription_bundles
      WHERE user_id = $1 
        AND is_active = true 
        AND end_date > NOW()
        AND messages_used < max_messages
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToSubscriptionBundle(result.rows[0]);
  }

  async updateUsage(
    bundleId: string,
    messagesUsed: number
  ): Promise<SubscriptionBundle> {
    const query = `
      UPDATE subscription_bundles
      SET messages_used = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING 
        id, user_id as "userId", tier, billing_cycle as "billingCycle",
        max_messages as "maxMessages", messages_used as "messagesUsed", price,
        start_date as "startDate", end_date as "endDate", renewal_date as "renewalDate",
        auto_renew as "autoRenew", is_active as "isActive",
        created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await pool.query(query, [messagesUsed, bundleId]);
    return this.mapRowToSubscriptionBundle(result.rows[0]);
  }

  async deactivate(bundleId: string): Promise<SubscriptionBundle> {
    const query = `
      UPDATE subscription_bundles
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
      RETURNING 
        id, user_id as "userId", tier, billing_cycle as "billingCycle",
        max_messages as "maxMessages", messages_used as "messagesUsed", price,
        start_date as "startDate", end_date as "endDate", renewal_date as "renewalDate",
        auto_renew as "autoRenew", is_active as "isActive",
        created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await pool.query(query, [bundleId]);
    return this.mapRowToSubscriptionBundle(result.rows[0]);
  }

  async cancel(bundleId: string): Promise<SubscriptionBundle> {
    const query = `
      UPDATE subscription_bundles
      SET auto_renew = false, updated_at = NOW()
      WHERE id = $1
      RETURNING 
        id, user_id as "userId", tier, billing_cycle as "billingCycle",
        max_messages as "maxMessages", messages_used as "messagesUsed", price,
        start_date as "startDate", end_date as "endDate", renewal_date as "renewalDate",
        auto_renew as "autoRenew", is_active as "isActive",
        created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await pool.query(query, [bundleId]);
    return this.mapRowToSubscriptionBundle(result.rows[0]);
  }

  async findById(bundleId: string): Promise<SubscriptionBundle | null> {
    const query = `
      SELECT 
        id, user_id as "userId", tier, billing_cycle as "billingCycle",
        max_messages as "maxMessages", messages_used as "messagesUsed", price,
        start_date as "startDate", end_date as "endDate", renewal_date as "renewalDate",
        auto_renew as "autoRenew", is_active as "isActive",
        created_at as "createdAt", updated_at as "updatedAt"
      FROM subscription_bundles
      WHERE id = $1
    `;

    const result = await pool.query(query, [bundleId]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToSubscriptionBundle(result.rows[0]);
  }

  async findAll(): Promise<SubscriptionBundle[]> {
    const query = `
      SELECT 
        id, user_id as "userId", tier, billing_cycle as "billingCycle",
        max_messages as "maxMessages", messages_used as "messagesUsed", price,
        start_date as "startDate", end_date as "endDate", renewal_date as "renewalDate",
        auto_renew as "autoRenew", is_active as "isActive",
        created_at as "createdAt", updated_at as "updatedAt"
      FROM subscription_bundles
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query);
    return result.rows.map(row => this.mapRowToSubscriptionBundle(row));
  }

  private mapRowToSubscriptionBundle(
    row: Record<string, unknown>
  ): SubscriptionBundle {
    return {
      id: row.id as string,
      userId: row.userId as string,
      tier: row.tier as BundleTier,
      billingCycle: row.billingCycle as BillingCycle,
      maxMessages: row.maxMessages as number,
      messagesUsed: row.messagesUsed as number,
      price: parseFloat(row.price as string),
      startDate: new Date(row.startDate as string),
      endDate: new Date(row.endDate as string),
      renewalDate: row.renewalDate ? new Date(row.renewalDate as string) : null,
      autoRenew: row.autoRenew as boolean,
      isActive: row.isActive as boolean,
      createdAt: new Date(row.createdAt as string),
      updatedAt: new Date(row.updatedAt as string),
    };
  }
}
