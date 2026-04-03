import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { logger } from './config/logger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter, authRateLimiter } from './middleware/rateLimiter';
import { cacheMiddleware, cache } from './utils/cache';
import authRoutes from './routes/auth';
import workoutRoutes from './routes/workouts';
import nutritionRoutes from './routes/nutrition';
import goalRoutes from './routes/goals';
import connectionRoutes from './routes/connections';
import activityFeedRoutes from './routes/activity-feed';
import analyticsRoutes from './routes/analytics';
import userRoutes from './routes/users';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'NODE_ENV',
];

const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

// CORS origins — allow all Firebase hosting URLs + localhost by default
const corsOriginEnv = process.env.CORS_ORIGIN || 'http://localhost:4200,http://localhost:4201,https://fit-nova.web.app,https://fit-nova.firebaseapp.com';
const corsOrigins = corsOriginEnv.split(',').map((o) => o.trim()).filter(Boolean);

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    if (corsOrigins.includes('*') || corsOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  maxAge: 86400,
}));

// Rate Limiting
app.use(rateLimiter.middleware());

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });
  next();
});

// Root
app.get('/', (_req, res) => {
  res.json({ message: '🚀 FitNova Backend API is running', version: 'v1' });
});

// Health Check
app.get('/health', async (_req, res) => {
  try {
    await require('mongoose').connection.db.admin().ping();
    res.json({ status: 'ok', uptime: process.uptime(), environment: process.env.NODE_ENV });
  } catch {
    res.status(503).json({ status: 'error' });
  }
});

// Cache Stats
app.get('/admin/cache-stats', (_req, res) => {
  res.json(cache.getStats());
});

// API Routes
app.use('/api/v1/auth', authRateLimiter.middleware(), authRoutes);

app.use('/api/v1/workouts', (req, _res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    cache.getStats().keys.filter(k => k.includes('/workouts')).forEach(k => cache.delete(k));
  }
  next();
});
app.use('/api/v1/workouts', cacheMiddleware(300), workoutRoutes);

app.use('/api/v1/nutrition', (req, _res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    cache.getStats().keys.filter(k => k.includes('/nutrition')).forEach(k => cache.delete(k));
  }
  next();
});
app.use('/api/v1/nutrition', cacheMiddleware(300), nutritionRoutes);

app.use('/api/v1/goals', (req, _res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    cache.getStats().keys.filter(k => k.includes('/goals')).forEach(k => cache.delete(k));
  }
  next();
});
app.use('/api/v1/goals', cacheMiddleware(300), goalRoutes);

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/connections', connectionRoutes);

app.use('/api/v1/activity-feed', (req, _res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    cache.getStats().keys.filter(k => k.includes('/activity-feed')).forEach(k => cache.delete(k));
  }
  next();
});
app.use('/api/v1/activity-feed', cacheMiddleware(300), activityFeedRoutes);

app.use('/api/v1/analytics', cacheMiddleware(300), analyticsRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', path: req.path });
});

// Error Handler (Must be last)
app.use(errorHandler);

// Start Server
let server: ReturnType<typeof app.listen>;

const startServer = async () => {
  try {
    await connectDB();
    logger.info('✓ MongoDB connected');
    server = app.listen(PORT, () => {
      logger.info(`✓ Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('✗ Failed to start server', error as Error);
    process.exit(1);
  }
};

// Graceful Shutdown
const gracefulShutdown = async () => {
  logger.info('Graceful shutdown initiated');
  if (server) {
    server.close(async () => {
      try {
        await require('mongoose').disconnect();
        logger.info('Database disconnected');
      } catch (error) {
        logger.error('Error disconnecting database', error as Error);
      }
      process.exit(0);
    });
  }
  setTimeout(() => process.exit(1), 30000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

startServer();

export default app;
