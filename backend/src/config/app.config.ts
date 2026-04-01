/**
 * Centralized Backend Application Configuration
 * Single source of truth for all hardcoded values
 */

export const APP_CONFIG = {
  // Server Configuration
  SERVER: {
    PORT: process.env.PORT || 3000,
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:4200',
    REQUEST_TIMEOUT: 30000, // 30 seconds
    RESPONSE_TIMEOUT: 30000, // 30 seconds
    GRACEFUL_SHUTDOWN_TIMEOUT: 30000, // 30 seconds
    CORS_MAX_AGE: 86400, // 24 hours
  },

  // Database Configuration
  DATABASE: {
    MAX_POOL_SIZE: 10,
    MIN_POOL_SIZE: 5,
    SERVER_SELECTION_TIMEOUT: 5000, // 5 seconds
    SOCKET_TIMEOUT: 45000, // 45 seconds
  },

  // Cache Configuration
  CACHE: {
    WORKOUTS_TTL: 300, // 5 minutes
    NUTRITION_TTL: 300, // 5 minutes
    GOALS_TTL: 300, // 5 minutes
    ACTIVITY_FEED_TTL: 300, // 5 minutes
    ANALYTICS_TTL: 300, // 5 minutes
    CLEANUP_INTERVAL: 60000, // 1 minute
  },

  // Rate Limiting Configuration
  RATE_LIMIT: {
    GENERAL: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS: 1000,
      CLEANUP_INTERVAL: 60000, // 1 minute
    },
    AUTH: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS: 50,
      CLEANUP_INTERVAL: 60000, // 1 minute
    },
  },

  // Bcrypt Configuration
  BCRYPT: {
    SALT_ROUNDS: 12,
  },

  // Exercise Calorie Multipliers (calories per minute per intensity level)
  EXERCISE_CALORIE_MULTIPLIERS: {
    running: 10,
    cycling: 8,
    swimming: 11,
    weightlifting: 6,
    yoga: 3,
    walking: 4,
    hiit: 12,
  },

  // Default Connection Status
  CONNECTION_STATUS: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
  },

  // Pagination Defaults
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    GOALS_LIMIT: 100,
  },

  // Analytics Configuration
  ANALYTICS: {
    DEFAULT_DAYS_BACK: 30, // 30 days default
  },
};
