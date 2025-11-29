import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { UserRepository } from '../repositories/UserRepository';
import { UserCreate } from '../domain/entities/User';
import { generateToken } from '../../shared/auth/jwt';
import { ValidationError } from '../../shared/utils/errors';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async signup(
    email: string,
    password: string
  ): Promise<{ user: { id: string; email: string }; token: string }> {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }

    // Validate password strength
    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters long');
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ValidationError('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userData: UserCreate = {
      email,
      passwordHash,
    };

    const user = await this.userRepository.create(userData);

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      token,
    };
  }

  async signin(
    email: string,
    password: string
  ): Promise<{ user: { id: string; email: string }; token: string }> {
    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new ValidationError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new ValidationError('Invalid email or password');
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      token,
    };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return {
        message:
          'If an account with that email exists, a password reset link has been sent.',
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1); // Token expires in 1 hour

    // Save reset token to database
    await this.userRepository.update(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetTokenExpires,
    });

    // In a real application, you would send an email here
    // For now, we'll just log it (in production, use a service like SendGrid, AWS SES, etc.)
    console.log(`Password reset token for ${email}: ${resetToken}`);
    console.log(
      `Reset link: http://localhost:3000/api/auth/reset-password?token=${resetToken}`
    );

    return {
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ message: string }> {
    // Validate password strength
    if (newPassword.length < 6) {
      throw new ValidationError('Password must be at least 6 characters long');
    }

    // Find user by reset token
    const user = await this.userRepository.findByResetToken(token);
    if (!user) {
      throw new ValidationError('Invalid or expired reset token');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await this.userRepository.update(user.id, {
      passwordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return {
      message: 'Password has been reset successfully',
    };
  }
}
