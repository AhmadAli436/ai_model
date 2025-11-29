import pool from '../../shared/db/connection';
import { ChatMessage, ChatMessageCreate } from '../domain/entities/ChatMessage';

export class ChatRepository {
  async create(message: ChatMessageCreate): Promise<ChatMessage> {
    const query = `
      INSERT INTO chat_messages (user_id, question, answer, tokens, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, user_id as "userId", question, answer, tokens, created_at as "createdAt"
    `;

    const result = await pool.query(query, [
      message.userId,
      message.question,
      message.answer,
      message.tokens,
    ]);

    return this.mapRowToChatMessage(result.rows[0]);
  }

  async findByUserId(userId: string): Promise<ChatMessage[]> {
    const query = `
      SELECT id, user_id as "userId", question, answer, tokens, created_at as "createdAt"
      FROM chat_messages
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows.map(row => this.mapRowToChatMessage(row));
  }

  private mapRowToChatMessage(row: Record<string, unknown>): ChatMessage {
    return {
      id: row.id as string,
      userId: row.userId as string,
      question: row.question as string,
      answer: row.answer as string,
      tokens: row.tokens as number,
      createdAt: new Date(row.createdAt as string),
    };
  }
}
