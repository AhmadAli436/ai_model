import pool from '../../shared/db/connection';
import { User, UserCreate, UserUpdate } from '../domain/entities/User';

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, email, password_hash as "passwordHash",
             reset_password_token as "resetPasswordToken",
             reset_password_expires as "resetPasswordExpires",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM users
      WHERE email = $1
    `;

    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, email, password_hash as "passwordHash",
             reset_password_token as "resetPasswordToken",
             reset_password_expires as "resetPasswordExpires",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM users
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  async findByResetToken(token: string): Promise<User | null> {
    const query = `
      SELECT id, email, password_hash as "passwordHash",
             reset_password_token as "resetPasswordToken",
             reset_password_expires as "resetPasswordExpires",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM users
      WHERE reset_password_token = $1
        AND reset_password_expires > NOW()
    `;

    const result = await pool.query(query, [token]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  async create(user: UserCreate): Promise<User> {
    const query = `
      INSERT INTO users (email, password_hash, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      RETURNING id, email, password_hash as "passwordHash",
                reset_password_token as "resetPasswordToken",
                reset_password_expires as "resetPasswordExpires",
                created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await pool.query(query, [user.email, user.passwordHash]);

    return this.mapRowToUser(result.rows[0]);
  }

  async update(id: string, updates: UserUpdate): Promise<User> {
    const updateFields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (updates.email !== undefined) {
      updateFields.push(`email = $${paramIndex++}`);
      values.push(updates.email);
    }

    if (updates.passwordHash !== undefined) {
      updateFields.push(`password_hash = $${paramIndex++}`);
      values.push(updates.passwordHash);
    }

    if (updates.resetPasswordToken !== undefined) {
      updateFields.push(`reset_password_token = $${paramIndex++}`);
      values.push(updates.resetPasswordToken);
    }

    if (updates.resetPasswordExpires !== undefined) {
      updateFields.push(`reset_password_expires = $${paramIndex++}`);
      values.push(updates.resetPasswordExpires);
    }

    if (updateFields.length === 0) {
      const user = await this.findById(id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE users
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, email, password_hash as "passwordHash",
                reset_password_token as "resetPasswordToken",
                reset_password_expires as "resetPasswordExpires",
                created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await pool.query(query, values);

    return this.mapRowToUser(result.rows[0]);
  }

  private mapRowToUser(row: Record<string, unknown>): User {
    return {
      id: row.id as string,
      email: row.email as string,
      passwordHash: row.passwordHash as string,
      resetPasswordToken: (row.resetPasswordToken as string) || null,
      resetPasswordExpires: row.resetPasswordExpires
        ? new Date(row.resetPasswordExpires as string)
        : null,
      createdAt: new Date(row.createdAt as string),
      updatedAt: new Date(row.updatedAt as string),
    };
  }
}
