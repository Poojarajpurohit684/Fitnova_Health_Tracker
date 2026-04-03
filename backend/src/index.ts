import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { logger } from './config/logger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter, authRateLimiter } from './middleware/rateLimiter';
import { cacheMiddleware, cache } from './utils/cache';

// Routes
import authRoutes from './routes/auth';
import workoutRoutes from './routes/workouts';
import nutritionRoutes from './routes/nutrition';
import goalRoutes from './routes/goals';
import connectionRoutes from './routes/connections';
import activityFeedRoutes from './routes/activity-feed';
import analyticsRoutes from './routes/analytics';
import userRoutes from './routes/users';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ================== ✅ ENV VALIDATION ==================
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'NODE_ENV'];

const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

// ================== ✅ CORS ==================
const corsOriginEnv =
  process.env.CORS_ORIGIN || 'http://localhost:4200,http://localhost:4201';

const corsOrigins = corsOriginEnv.split(',').map(o => o.trim());

app.use(
  cors({
    origin: corsOrigins.includes('*') ? '*' : corsOrigins,
    credentials: true,
  })
);

// ================== ✅ SECURITY ==================
app.use(helmet());

// ================== ✅ BODY PARSER ==================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ================== ✅ RATE LIMIT ==================
app.use(rateLimiter.middleware());

// ================== ✅ ROOT ROUTE (FIXED POSITION) ==================
app.get('/', (_req, res) => {
  res.json({
    message: '🚀 FitNova Backend API is running',
    version: 'v1',
    endpoints: [
      '/health',
      '/api/v1/auth',
      '/api/v1/workouts',
      '/api/v1/users',
    ],
  });
});

// ================== ✅ HEALTH ROUTES ==================
app.get('/health', async (_req, res) => {
  try {
    await require('mongoose').connection.db.admin().ping();
    res.json({ status: 'ok' });
  } catch {
    res.status(500).json({ status: 'error' });
  }
});

// ================== ✅ API ROUTES ==================
app.use('/api/v1/auth', authRateLimiter.middleware(), authRoutes);
app.use('/api/v1/workouts', cacheMiddleware(300), workoutRoutes);
app.use('/api/v1/nutrition', cacheMiddleware(300), nutritionRoutes);
app.use('/api/v1/goals', cacheMiddleware(300), goalRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/connections', connectionRoutes);
app.use('/api/v1/activity-feed', cacheMiddleware(300), activityFeedRoutes);
app.use('/api/v1/analytics', cacheMiddleware(300), analyticsRoutes);

// ================== ❌ 404 HANDLER (MUST BE LAST BEFORE ERROR) ==================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// ================== ❌ ERROR HANDLER ==================
app.use(errorHandler);

// ================== 🚀 START SERVER ==================
const startServer = async () => {
  try {
    await connectDB();
    logger.info('✓ MongoDB connected');

    app.listen(PORT, () => {
      logger.info(`✓ Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('✗ Failed to start server', error as Error);
    process.exit(1);
  }
};

startServer();

export default app;