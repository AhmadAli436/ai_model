export interface ChatMessage {
  id: string;
  userId: string;
  question: string;
  answer: string;
  tokens: number;
  createdAt: Date;
}

export interface ChatMessageCreate {
  userId: string;
  question: string;
  answer: string;
  tokens: number;
}
