import { Response } from 'express';
import { AuthRequest } from '../../shared/auth/middleware';
import { ChatService } from '../services/ChatService';
import { AppError } from '../../shared/utils/errors';

export class ChatController {
  private chatService: ChatService;

  constructor() {
    this.chatService = new ChatService();
  }

  sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { question } = req.body;

      if (!userId) {
        res.status(401).json({
          error: {
            message: 'Unauthorized: User not authenticated',
            code: 'UNAUTHORIZED',
          },
        });
        return;
      }

      if (
        !question ||
        typeof question !== 'string' ||
        question.trim().length === 0
      ) {
        res.status(400).json({
          error: {
            message: 'Question is required and must be a non-empty string',
            code: 'VALIDATION_ERROR',
          },
        });
        return;
      }

      const result = await this.chatService.sendMessage(
        userId,
        question.trim()
      );

      res.status(200).json({
        message: 'Response generated successfully',
        data: result,
      });
    } catch (error) {
      console.error('Send message error:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: {
            message: error.message,
            code: error.code,
          },
        });
      } else {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error('Unexpected send message error:', errorMessage);
        res.status(500).json({
          error: {
            message: 'Internal server error',
            code: 'INTERNAL_ERROR',
            ...(process.env.NODE_ENV === 'development' && {
              details: errorMessage,
            }),
          },
        });
      }
    }
  };

  getChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          error: {
            message: 'Unauthorized: User not authenticated',
            code: 'UNAUTHORIZED',
          },
        });
        return;
      }

      const { ChatRepository } = await import('../repositories/ChatRepository');
      const chatRepository = new ChatRepository();
      const messages = await chatRepository.findByUserId(userId);

      res.status(200).json({
        message: 'Chat history retrieved successfully',
        data: messages,
      });
    } catch (error) {
      console.error('Get chat history error:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: {
            message: error.message,
            code: error.code,
          },
        });
      } else {
        res.status(500).json({
          error: {
            message: 'Internal server error',
            code: 'INTERNAL_ERROR',
          },
        });
      }
    }
  };
}
