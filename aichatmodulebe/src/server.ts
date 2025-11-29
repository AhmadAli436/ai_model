import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './shared/db/connection';
import { errorHandler } from './shared/utils/errorHandler';
import authRoutes from './auth/routes/authRoutes';
import chatRoutes from './chat/routes/chatRoutes';
import subscriptionRoutes from './subscriptions/routes/subscriptionRoutes';
import dashboardRoutes from './dashboard/routes/dashboardRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'AI Chat Module Backend is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handler middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('🔌 Testing database connection...');
  await testConnection();
});

export default app;
