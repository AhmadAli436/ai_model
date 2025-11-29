'use client';

import { ChatHistoryItem } from '@/types';

interface ChatMessageProps {
  message: ChatHistoryItem;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* User Question */}
      <div className="flex justify-end">
        <div className="w-full max-w-3xl">
          <div className="rounded-lg bg-purple-600 px-4 py-3 text-white shadow-sm">
            <p className="whitespace-pre-wrap text-sm">{message.question}</p>
          </div>
          <p className="mt-1 text-right text-xs text-gray-500">
            {formatDate(message.createdAt)}
          </p>
        </div>
      </div>

      {/* AI Response */}
      <div className="flex justify-start">
        <div className="w-full max-w-3xl">
          <div className="rounded-lg bg-gray-100 px-4 py-3 text-gray-900 shadow-sm">
            <p className="whitespace-pre-wrap text-sm">{message.answer}</p>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {formatDate(message.createdAt)}
            </p>
            <p className="text-xs text-gray-500">{message.tokens} tokens</p>
          </div>
        </div>
      </div>
    </div>
  );
}
