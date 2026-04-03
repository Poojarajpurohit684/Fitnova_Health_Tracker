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

// Validate CORS origins (comma-separated)
const corsOriginEnv = process.env.CORS_ORIGIN || 'http://localhost:4200,http://localhost:4201,https://fit-nova.web.app,https://fit-nova.firebaseapp.com';
if (corsOriginEnv.trim() === '*') {
  logger.warn('CORS_ORIGIN is set to "*" - this is a security risk in production');
}

const corsOrigins = corsOriginEnv
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

if (corsOrigins.length === 0) {
  logger.error('Invalid CORS_ORIGIN: no origins configured');
  process.exit(1);
}

if (corsOrigins.some((o) => o !== '*' && !o.startsWith('http://') && !o.startsWith('https://'))) {
  logger.error('Invalid CORS_ORIGIN: each origin must start with http:// or https:// (or be "*")');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (corsOrigins.includes('*') || corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  maxAge: 86400, // 24 hours
}));

// HTTPS Enforcement in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// Request timeout
app.use((req, res, next) => {
  req.setTimeout(30000); // 30 seconds
  res.setTimeout(30000);
  next();
});

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

// Health Check Endpoints
app.get('/health', async (_req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    checks: {
      database: 'unknown',
      cache: 'ok',
      memory: 'ok',
    },
  };

  // Check database
  try {
    await require('mongoose').connection.db.admin().ping();
    health.checks.database = 'ok';
  } catch (error) {
    health.checks.database = 'error';
    health.status = 'degraded';
  }

  // Check memory
  const memUsage = process.memoryUsage();
  if (memUsage.heapUsed / memUsage.heapTotal > 0.9) {
    health.checks.memory = 'warning';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

app.get('/health/ready', async (_req, res) => {
  // Readiness check - can accept traffic?
  try {
    await require('mongoose').connection.db.admin().ping();
    res.status(200).json({ ready: true });
  } catch (error) {
    res.status(503).json({ ready: false });
  }
});

app.get('/health/live', (_req, res) => {
  // Liveness check - is process alive?
  res.status(200).json({ alive: true });
});

// Cache Stats (Admin)
app.get('/admin/cache-stats', (_req, res) => {
  res.json(cache.getStats());
});

// Rate Limiter Stats (Admin)
app.get('/admin/rate-limiter-stats', (_req, res) => {
  res.json(rateLimiter.getStats());
});

// API Routes
app.use('/api/v1/auth', authRateLimiter.middleware(), authRoutes);

// Cache invalidation middleware for workouts
app.use('/api/v1/workouts', (req, _res, next) => {
  // Clear cache on POST, PUT, DELETE to ensure fresh data on next GET
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    // Clear all workout-related cache entries
    const stats = cache.getStats();
    stats.keys.forEach(key => {
      if (key.includes('/workouts')) {
        cache.delete(key);
      }
    });
  }
  next();
});

app.use('/api/v1/workouts', cacheMiddleware(300), workoutRoutes);

// Cache invalidation middleware for nutrition
app.use('/api/v1/nutrition', (req, _res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    const stats = cache.getStats();
    stats.keys.forEach(key => {
      if (key.includes('/nutrition')) {
        cache.delete(key);
      }
    });
  }
  next();
});

app.use('/api/v1/nutrition', cacheMiddleware(300), nutritionRoutes);

// Cache invalidation middleware for goals
app.use('/api/v1/goals', (req, _res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    const stats = cache.getStats();
    stats.keys.forEach(key => {
      if (key.includes('/goals')) {
        cache.delete(key);
      }
    });
  }
  next();
});

app.use('/api/v1/goals', cacheMiddleware(300), goalRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/connections', connectionRoutes);

// Cache invalidation middleware for activity feed
app.use('/api/v1/activity-feed', (req, _res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    const stats = cache.getStats();
    stats.keys.forEach(key => {
      if (key.includes('/activity-feed')) {
        cache.delete(key);
      }
    });
  }
  next();
});

app.use('/api/v1/activity-feed', cacheMiddleware(300), activityFeedRoutes);

// Cache invalidation middleware for analytics
app.use('/api/v1/analytics', (req, _res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    const stats = cache.getStats();
    stats.keys.forEach(key => {
      if (key.includes('/analytics')) {
        cache.delete(key);
      }
    });
  }
  next();
});

app.use('/api/v1/analytics', cacheMiddleware(300), analyticsRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Error Handler (Must be last)
app.use(errorHandler);

// Connect to MongoDB and start server
let server: any;

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
      logger.info('HTTP server closed');
      try {
        await require('mongoose').disconnect();
        logger.info('Database disconnected');
      } catch (error) {
        logger.error('Error disconnecting database', error as Error);
      }
      process.exit(0);
    });
  }

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after 30 seconds');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

startServer();

export default app;
