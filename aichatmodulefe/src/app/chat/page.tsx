'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import ChatInterface from '@/components/chat/ChatInterface';

function ChatPageContent() {
  return (
    <LayoutWrapper>
      <div className="flex-1 overflow-hidden">
        <div className="mx-auto h-full max-w-5xl bg-white shadow-sm">
          <ChatInterface />
        </div>
      </div>
    </LayoutWrapper>
  );
}

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatPageContent />
    </ProtectedRoute>
  );
}
