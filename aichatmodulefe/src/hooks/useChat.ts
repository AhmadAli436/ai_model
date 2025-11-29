import { useState } from 'react';
import { chatApi, ChatResponse } from '../lib/api/chat';
import { handleApiError } from '../lib/utils/errors';

export function useChat() {
  const [messages, setMessages] = useState<ChatResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (question: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await chatApi.sendMessage(question);
      setMessages(prev => [response, ...prev]);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const history = await chatApi.getHistory();
      setMessages(history);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    loadHistory,
  };
}
