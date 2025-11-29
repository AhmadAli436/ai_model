import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { AppError } from '../../shared/utils/errors';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  signup = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          error: {
            message: 'Email and password are required',
            code: 'VALIDATION_ERROR',
          },
        });
        return;
      }

      const result = await this.authService.signup(email, password);

      res.status(201).json({
        message: 'User created successfully',
        data: result,
      });
    } catch (error) {
      console.error('Signup error:', error);
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
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error('Unexpected signup error:', errorMessage);
        console.error('Error stack:', errorStack);
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

  signin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          error: {
            message: 'Email and password are required',
            code: 'VALIDATION_ERROR',
          },
        });
        return;
      }

      const result = await this.authService.signin(email, password);

      res.status(200).json({
        message: 'Sign in successful',
        data: result,
      });
    } catch (error) {
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

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          error: {
            message: 'Email is required',
            code: 'VALIDATION_ERROR',
          },
        });
        return;
      }

      const result = await this.authService.forgotPassword(email);

      res.status(200).json(result);
    } catch (error) {
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

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        res.status(400).json({
          error: {
            message: 'Token and password are required',
            code: 'VALIDATION_ERROR',
          },
        });
        return;
      }

      const result = await this.authService.resetPassword(token, password);

      res.status(200).json(result);
    } catch (error) {
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
