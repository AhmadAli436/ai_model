# AI Chat Module Backend

A comprehensive backend API for an AI-powered chat application with subscription management, quota tracking, and user authentication. Built using Clean Architecture and Domain-Driven Design (DDD) principles for maintainability and scalability.

## Overview

This backend service provides a complete API for an AI chat application that allows users to interact with an AI assistant through chat messages. The system implements a freemium model with three subscription tiers, monthly quota management, and comprehensive user management features.

### Key Features

- **AI Chat Functionality**: Users can send messages and receive AI-generated responses (currently using mocked responses, ready for OpenAI integration)
- **User Authentication**: Secure signup, signin, and password reset functionality using JWT tokens
- **Subscription Management**: Three-tier subscription system (Basic, Pro, Enterprise) with monthly and yearly billing cycles
- **Quota System**: Free tier with 3 messages per month, subscription-based quotas, and unlimited messages for Enterprise tier
- **Usage Tracking**: Automatic tracking of message usage and quota consumption
- **Auto-Renewal**: Automated subscription renewal with payment simulation
- **Dashboard Statistics**: User dashboard with message counts, subscription info, and remaining quota

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: Zod
- **CORS**: Enabled for cross-origin requests

## Architecture

This project follows Clean Architecture / Domain-Driven Design (DDD) principles:

- **Domain/Entities**: Core business logic and domain models (User, ChatMessage, SubscriptionBundle, UserUsage)
- **Services**: Business logic orchestration and workflow management
- **Repositories**: Data access layer abstraction
- **Controllers**: HTTP request handlers and response formatting
- **Shared**: Common utilities, authentication middleware, database connection, and error handling

## Project Structure

```
src/
├── auth/                    # Authentication Module
│   ├── domain/             # User entity and domain logic
│   ├── services/           # AuthService (signup, signin, password reset)
│   ├── repositories/       # UserRepository (data access)
│   ├── controllers/        # AuthController (HTTP handlers)
│   └── routes/             # Auth routes (signup, signin, password reset)
├── chat/                    # Chat Module
│   ├── domain/             # ChatMessage entity and domain logic
│   ├── services/           # ChatService (message processing, quota checking)
│   ├── repositories/       # ChatRepository, UserUsageRepository
│   ├── controllers/        # ChatController (HTTP handlers)
│   └── routes/             # Chat routes (send message, get history)
├── subscriptions/          # Subscription Module
│   ├── domain/             # SubscriptionBundle entity
│   ├── services/           # SubscriptionService (create, cancel, auto-renewal)
│   ├── repositories/       # SubscriptionRepository
│   ├── controllers/        # SubscriptionController
│   ├── routes/             # Subscription routes
│   └── config/             # Pricing configuration
├── dashboard/              # Dashboard Module
│   ├── services/           # DashboardService (statistics aggregation)
│   ├── controllers/        # DashboardController
│   └── routes/             # Dashboard routes
├── shared/                 # Shared utilities
│   ├── auth/               # JWT token generation and authentication middleware
│   ├── db/                 # PostgreSQL database connection
│   └── utils/              # Error handling, custom error classes
└── server.ts               # Application entry point and Express app setup
```

## API Endpoints

### Authentication (`/api/auth`)

- `POST /api/auth/signup` - Create a new user account
  - Body: `{ email: string, password: string }`
  - Returns: `{ user: { id, email }, token: string }`

- `POST /api/auth/signin` - Sign in existing user
  - Body: `{ email: string, password: string }`
  - Returns: `{ user: { id, email }, token: string }`

- `POST /api/auth/forgot-password` - Request password reset
  - Body: `{ email: string }`
  - Returns: `{ message: string }`

- `POST /api/auth/reset-password` - Reset password with token
  - Body: `{ token: string, newPassword: string }`
  - Returns: `{ message: string }`

### Chat (`/api/chat`)

All chat endpoints require authentication (JWT token in Authorization header).

- `POST /api/chat/message` - Send a chat message to AI
  - Body: `{ question: string }`
  - Returns: `{ id, question, answer, tokens, createdAt }`
  - Automatically checks quota and updates usage

- `GET /api/chat/history` - Get user's chat history
  - Returns: `Array<{ id, question, answer, tokens, createdAt }>`

### Subscriptions (`/api/subscriptions`)

All subscription endpoints require authentication.

- `POST /api/subscriptions/create` - Create a new subscription
  - Body: `{ tier: 'basic' | 'pro' | 'enterprise', billingCycle: 'monthly' | 'yearly', autoRenew?: boolean }`
  - Returns: Subscription bundle details

- `GET /api/subscriptions/my-subscriptions` - Get user's subscriptions
  - Returns: `Array<SubscriptionBundle>`

- `GET /api/subscriptions/active` - Get user's active subscriptions
  - Returns: `Array<SubscriptionBundle>`

- `POST /api/subscriptions/:id/cancel` - Cancel a subscription
  - Returns: Cancelled subscription details

### Dashboard (`/api/dashboard`)

Requires authentication.

- `GET /api/dashboard/stats` - Get user dashboard statistics
  - Returns: `{ totalMessages: number, totalSubscriptions: number, remainingQuota: number | null }`

### Health Check

- `GET /health` - Server health check
  - Returns: `{ status: 'ok', message: string }`

## Subscription Tiers

### Free Tier
- **Monthly Messages**: 3 messages per month
- **Price**: Free
- **Auto-reset**: Resets on the 1st of each month

### Basic Tier
- **Monthly**: 10 messages/month - $10/month or $100/year
- **Yearly**: 10 messages/month - $100/year (save 2 months)

### Pro Tier
- **Monthly**: 100 messages/month - $50/month or $500/year
- **Yearly**: 100 messages/month - $500/year (save 2 months)

### Enterprise Tier
- **Monthly**: Unlimited messages - $200/month or $2000/year
- **Yearly**: Unlimited messages - $2000/year (save 2 months)

## Database Schema

### Users Table
- `id` (UUID) - Primary key
- `email` (VARCHAR) - Unique email address
- `password_hash` (VARCHAR) - Hashed password
- `reset_password_token` (VARCHAR) - Token for password reset
- `reset_password_expires` (TIMESTAMP) - Token expiration
- `created_at`, `updated_at` (TIMESTAMP)

### Chat Messages Table
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `question` (TEXT) - User's question
- `answer` (TEXT) - AI's response
- `tokens` (INTEGER) - Token count for the conversation
- `created_at` (TIMESTAMP)

### User Usage Table
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users (unique)
- `free_messages_used` (INTEGER) - Number of free messages used this month
- `last_reset_date` (DATE) - Date when quota was last reset
- `created_at`, `updated_at` (TIMESTAMP)

### Subscription Bundles Table
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `tier` (VARCHAR) - 'basic', 'pro', or 'enterprise'
- `billing_cycle` (VARCHAR) - 'monthly' or 'yearly'
- `max_messages` (INTEGER) - Maximum messages allowed
- `messages_used` (INTEGER) - Messages used in this bundle
- `price` (DECIMAL) - Subscription price
- `start_date` (DATE) - Subscription start date
- `end_date` (DATE) - Subscription end date
- `renewal_date` (DATE) - Next renewal date
- `auto_renew` (BOOLEAN) - Auto-renewal enabled
- `is_active` (BOOLEAN) - Subscription active status
- `created_at`, `updated_at` (TIMESTAMP)

## How It Works

### Quota Management System

1. **Free Tier Check**: When a user sends a message, the system first checks if they have remaining free quota (3 messages/month)
2. **Subscription Check**: If free quota is exhausted, the system checks for active subscription bundles
3. **Quota Deduction**: Messages are deducted from the appropriate quota (free or subscription)
4. **Monthly Reset**: Free quota automatically resets on the 1st of each month
5. **Enterprise Unlimited**: Enterprise tier users have unlimited messages

### Subscription Lifecycle

1. **Creation**: User creates a subscription with a tier and billing cycle
2. **Activation**: Subscription is immediately active and quota is available
3. **Usage Tracking**: Messages are tracked against the subscription bundle
4. **Auto-Renewal**: When `end_date` is reached and `auto_renew` is true, the system attempts to renew (simulated with 80% success rate)
5. **Cancellation**: Users can cancel subscriptions, which disables auto-renewal

### Message Processing Flow

1. User sends a message via `/api/chat/message`
2. System checks and resets monthly quota if needed (on 1st of month)
3. System validates quota availability (free or subscription)
4. AI response is generated (currently mocked, ready for OpenAI integration)
5. Message is stored in database
6. Usage is updated (quota deducted)
7. Response is returned to user

## Setup

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database (Neon or local PostgreSQL)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file in the root directory:
```env
PORT=3000
DATABASE_URL=your_neon_connection_string_or_postgres_url
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

3. Initialize database schema:
```bash
# Run the SQL script in database/init_database.sql
# You can use psql, pgAdmin, or any PostgreSQL client
psql -d your_database -f database/init_database.sql
```

4. Run development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
npm start
```

## Scripts

- `npm run dev` - Start development server with hot reload (using tsx watch)
- `npm run build` - Compile TypeScript to JavaScript in `dist/` folder
- `npm start` - Start production server from compiled JavaScript
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Automatically fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting without modifying files

## Error Handling

The application uses custom error classes for better error handling:
- `ValidationError` - For input validation errors
- `QuotaExceededError` - When user has exceeded their quota
- `SubscriptionRequiredError` - When subscription is required
- `NotFoundError` - For resource not found errors

All errors are handled by a centralized error handler middleware that returns consistent JSON error responses.

## Security Features

- Password hashing using bcryptjs (10 rounds)
- JWT token-based authentication
- Password reset token expiration (1 hour)
- SQL injection protection (using parameterized queries)
- CORS configuration for cross-origin requests

## Future Enhancements

- Integration with OpenAI API or other AI providers
- Email service integration for password reset emails
- Payment gateway integration (Stripe, PayPal, etc.)
- Webhook support for subscription events
- Rate limiting for API endpoints
- Logging and monitoring (Winston, Sentry)
- Unit and integration tests
- API documentation (Swagger/OpenAPI)

