import pool from '../../shared/db/connection';
import { UserUsage, UserUsageCreate } from '../domain/entities/UserUsage';

export class UserUsageRepository {
  async findByUserId(userId: string): Promise<UserUsage | null> {
    const query = `
      SELECT id, user_id as "userId", free_messages_used as "freeMessagesUsed",
             last_reset_date as "lastResetDate", created_at as "createdAt",
             updated_at as "updatedAt"
      FROM user_usage
      WHERE user_id = $1
    `;

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToUserUsage(result.rows[0]);
  }

  async create(usage: UserUsageCreate): Promise<UserUsage> {
    const query = `
      INSERT INTO user_usage (user_id, free_messages_used, last_reset_date, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING id, user_id as "userId", free_messages_used as "freeMessagesUsed",
                last_reset_date as "lastResetDate", created_at as "createdAt",
                updated_at as "updatedAt"
    `;

    const result = await pool.query(query, [
      usage.userId,
      usage.freeMessagesUsed,
      usage.lastResetDate,
    ]);

    return this.mapRowToUserUsage(result.rows[0]);
  }

  async update(userId: string, freeMessagesUsed: number): Promise<UserUsage> {
    const query = `
      UPDATE user_usage
      SET free_messages_used = $1, updated_at = NOW()
      WHERE user_id = $2
      RETURNING id, user_id as "userId", free_messages_used as "freeMessagesUsed",
                last_reset_date as "lastResetDate", created_at as "createdAt",
                updated_at as "updatedAt"
    `;

    const result = await pool.query(query, [freeMessagesUsed, userId]);
    return this.mapRowToUserUsage(result.rows[0]);
  }

  async resetFreeQuota(userId: string): Promise<UserUsage> {
    const query = `
      UPDATE user_usage
      SET free_messages_used = 0, last_reset_date = NOW(), updated_at = NOW()
      WHERE user_id = $1
      RETURNING id, user_id as "userId", free_messages_used as "freeMessagesUsed",
                last_reset_date as "lastResetDate", created_at as "createdAt",
                updated_at as "updatedAt"
    `;

    const result = await pool.query(query, [userId]);
    return this.mapRowToUserUsage(result.rows[0]);
  }

  private mapRowToUserUsage(row: Record<string, unknown>): UserUsage {
    return {
      id: row.id as string,
      userId: row.userId as string,
      freeMessagesUsed: row.freeMessagesUsed as number,
      lastResetDate: new Date(row.lastResetDate as string),
      createdAt: new Date(row.createdAt as string),
      updatedAt: new Date(row.updatedAt as string),
    };
  }
}
