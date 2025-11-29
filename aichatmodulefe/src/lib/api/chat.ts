import apiClient from './client';
import { z } from 'zod';

// Validation schemas
export const ChatQuestionSchema = z.object({
  question: z.string().min(1, 'Question is required'),
});

export const ChatMessageSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
  tokens: z.number(),
  createdAt: z.string(),
});

export const ChatHistoryItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  question: z.string(),
  answer: z.string(),
  tokens: z.number(),
  createdAt: z.string(),
});

export type ChatQuestion = z.infer<typeof ChatQuestionSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatHistoryItem = z.infer<typeof ChatHistoryItemSchema>;

export const chatApi = {
  // Send a chat message
  sendMessage: async (question: string): Promise<ChatMessage> => {
    const response = await apiClient.post('/api/chat/message', { question });
    const responseData = response.data;

    // Handle backend response structure: { message: string, data: {...} }
    const messageData = responseData?.data || responseData;

    return ChatMessageSchema.parse(messageData);
  },

  // Get chat history
  getHistory: async (): Promise<ChatHistoryItem[]> => {
    const response = await apiClient.get('/api/chat/history');
    const responseData = response.data;

    // Handle backend response structure: { message: string, data: [...] }
    const historyData = responseData?.data || responseData;

    return z.array(ChatHistoryItemSchema).parse(historyData);
  },
};
