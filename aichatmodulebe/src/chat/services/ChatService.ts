import { ChatRepository } from '../repositories/ChatRepository';
import { UserUsageRepository } from '../repositories/UserUsageRepository';
import { SubscriptionRepository } from '../../subscriptions/repositories/SubscriptionRepository';
import { ChatMessageCreate } from '../domain/entities/ChatMessage';
import {
  QuotaExceededError,
  SubscriptionRequiredError,
} from '../../shared/utils/errors';

export class ChatService {
  private chatRepository: ChatRepository;
  private userUsageRepository: UserUsageRepository;
  private subscriptionRepository: SubscriptionRepository;

  // Constants
  private readonly FREE_MESSAGES_PER_MONTH = 3;

  constructor() {
    this.chatRepository = new ChatRepository();
    this.userUsageRepository = new UserUsageRepository();
    this.subscriptionRepository = new SubscriptionRepository();
  }

  async sendMessage(
    userId: string,
    question: string
  ): Promise<{
    id: string;
    question: string;
    answer: string;
    tokens: number;
    createdAt: Date;
  }> {
    // Step 1: Check and reset monthly quota if needed
    await this.checkAndResetMonthlyQuota(userId);

    // Step 2: Check quota availability
    const hasQuota = await this.checkQuota(userId);
    if (!hasQuota) {
      throw new QuotaExceededError(
        'Quota exceeded. Please subscribe to continue using the service.'
      );
    }

    // Step 3: Generate mocked AI response (with delay simulation)
    const { answer, tokens } = await this.generateMockAIResponse(question);

    // Step 4: Store message in database
    const messageData: ChatMessageCreate = {
      userId,
      question,
      answer,
      tokens,
    };

    const chatMessage = await this.chatRepository.create(messageData);

    // Step 5: Update usage (deduct from free quota or subscription)
    await this.updateUsage(userId);

    return {
      id: chatMessage.id,
      question: chatMessage.question,
      answer: chatMessage.answer,
      tokens: chatMessage.tokens,
      createdAt: chatMessage.createdAt,
    };
  }

  private async checkAndResetMonthlyQuota(userId: string): Promise<void> {
    const userUsage = await this.userUsageRepository.findByUserId(userId);

    if (!userUsage) {
      // Create user usage record if it doesn't exist
      const today = new Date();
      await this.userUsageRepository.create({
        userId,
        freeMessagesUsed: 0,
        lastResetDate: today,
      });
      return;
    }

    // Check if we need to reset (it's the 1st of the month and last reset was before this month)
    const today = new Date();
    const lastReset = new Date(userUsage.lastResetDate);
    const isFirstOfMonth = today.getDate() === 1;
    const isNewMonth =
      today.getMonth() !== lastReset.getMonth() ||
      today.getFullYear() !== lastReset.getFullYear();

    if (isFirstOfMonth && isNewMonth) {
      await this.userUsageRepository.resetFreeQuota(userId);
    }
  }

  private async checkQuota(userId: string): Promise<boolean> {
    // Check free quota first
    const userUsage = await this.userUsageRepository.findByUserId(userId);

    if (
      userUsage &&
      userUsage.freeMessagesUsed < this.FREE_MESSAGES_PER_MONTH
    ) {
      return true; // Free quota available
    }

    // Check subscription bundles
    const activeBundle =
      await this.subscriptionRepository.findLatestWithQuota(userId);

    if (activeBundle) {
      // Check if Enterprise (unlimited)
      if (activeBundle.tier === 'enterprise') {
        return true; // Enterprise has unlimited
      }

      // Check if bundle has remaining quota
      if (activeBundle.messagesUsed < activeBundle.maxMessages) {
        return true; // Subscription quota available
      }
    }

    return false; // No quota available
  }

  private async updateUsage(userId: string): Promise<void> {
    // Check free quota first
    const userUsage = await this.userUsageRepository.findByUserId(userId);

    if (
      userUsage &&
      userUsage.freeMessagesUsed < this.FREE_MESSAGES_PER_MONTH
    ) {
      // Use free quota
      const newCount = userUsage.freeMessagesUsed + 1;
      await this.userUsageRepository.update(userId, newCount);
      return;
    }

    // Use subscription quota
    const activeBundle =
      await this.subscriptionRepository.findLatestWithQuota(userId);

    if (activeBundle) {
      // Enterprise is unlimited, but we still track usage
      if (activeBundle.tier === 'enterprise') {
        // For enterprise, we can still increment but it won't block
        const newCount = activeBundle.messagesUsed + 1;
        await this.subscriptionRepository.updateUsage(
          activeBundle.id,
          newCount
        );
      } else {
        // For Basic and Pro, increment usage
        const newCount = activeBundle.messagesUsed + 1;
        await this.subscriptionRepository.updateUsage(
          activeBundle.id,
          newCount
        );
      }
    } else {
      throw new SubscriptionRequiredError(
        'Free quota exhausted. A valid subscription is required.'
      );
    }
  }

  private async generateMockAIResponse(
    question: string
  ): Promise<{ answer: string; tokens: number }> {
    // Simulate OpenAI API delay (500-2000ms)
    const delay = Math.floor(Math.random() * 1500) + 500;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Generate a mocked response based on the question
    const answer = this.generateMockAnswer(question);

    // Calculate mock tokens (roughly 1 token per 4 characters)
    const tokens =
      Math.ceil(answer.length / 4) + Math.ceil(question.length / 4);

    return { answer, tokens };
  }

  private generateMockAnswer(question: string): string {
    const lowerQuestion = question.toLowerCase();

    // Simple keyword-based mock responses
    if (lowerQuestion.includes('typescript') || lowerQuestion.includes('ts')) {
      return 'TypeScript is a programming language developed by Microsoft. It is a typed superset of JavaScript that compiles to plain JavaScript. TypeScript adds static type definitions to JavaScript, which helps catch errors during development and makes code more maintainable.';
    }

    if (lowerQuestion.includes('javascript') || lowerQuestion.includes('js')) {
      return 'JavaScript is a high-level, interpreted programming language that is one of the core technologies of the World Wide Web. It enables interactive web pages and is an essential part of web applications. JavaScript is dynamic, weakly typed, and supports multiple programming paradigms.';
    }

    if (lowerQuestion.includes('node') || lowerQuestion.includes('nodejs')) {
      return "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. It allows developers to run JavaScript on the server side, enabling the development of scalable network applications. Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient.";
    }

    if (lowerQuestion.includes('react')) {
      return 'React is a JavaScript library for building user interfaces, particularly web applications. It was developed by Facebook and is used for creating reusable UI components. React uses a virtual DOM to efficiently update the user interface and supports both client-side and server-side rendering.';
    }

    if (lowerQuestion.includes('database') || lowerQuestion.includes('sql')) {
      return 'A database is an organized collection of data stored and accessed electronically. SQL (Structured Query Language) is a domain-specific language used for managing and querying relational databases. Databases allow for efficient storage, retrieval, and manipulation of large amounts of data.';
    }

    if (lowerQuestion.includes('api')) {
      return 'An API (Application Programming Interface) is a set of protocols, routines, and tools for building software applications. APIs define how different software components should interact, allowing applications to communicate with each other. REST APIs are commonly used for web services, using HTTP methods like GET, POST, PUT, and DELETE.';
    }

    if (lowerQuestion.includes('hello') || lowerQuestion.includes('hi')) {
      return "Hello! I'm an AI assistant. How can I help you today? Feel free to ask me any questions about programming, technology, or general topics.";
    }

    if (
      lowerQuestion.includes('what is') ||
      lowerQuestion.includes('what are')
    ) {
      return `Based on your question "${question}", I can provide some general information. This is a mocked response, but in a real implementation, this would be generated by an AI model like OpenAI's GPT. The response would be contextually relevant and comprehensive.`;
    }

    if (lowerQuestion.includes('how') || lowerQuestion.includes('why')) {
      return `That's an interesting question about "${question}". In a real AI implementation, I would provide a detailed, step-by-step explanation. For now, this is a mocked response that demonstrates the chat functionality. The actual AI would analyze your question and provide comprehensive, accurate information.`;
    }

    // Default generic response
    return `Thank you for your question: "${question}". This is a mocked AI response. In a production environment, this would be generated by an advanced AI model that understands context, provides accurate information, and can engage in meaningful conversations. The response would be tailored to your specific question and include relevant details, examples, and explanations.`;
  }
}
