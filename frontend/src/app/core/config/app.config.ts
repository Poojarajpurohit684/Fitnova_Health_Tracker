import { environment } from '../../../environments/environment';

/**
 * Centralized Application Configuration
 * Single source of truth for all hardcoded values
 */

export const APP_CONFIG = {
  // API Configuration
  API: {
    BASE_URL: environment.apiUrl,
    AUTH_URL: `${environment.apiUrl}/auth`,
    TIMEOUT: 30000, // 30 seconds
    MAX_RETRIES: 3,
    RETRY_DELAY_BASE: 1000, // 1 second exponential backoff
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    GOALS_PAGE_SIZE: 100,
  },

  // Cache
  CACHE: {
    TTL: 300, // 5 minutes in seconds
  },

  // Rate Limiting
  RATE_LIMIT: {
    GENERAL_THRESHOLD: 1000,
    AUTH_THRESHOLD: 50,
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  },

  // Token Management
  TOKEN: {
    REFRESH_INTERVAL: 20 * 60 * 1000, // 20 minutes
    STORAGE_KEY: 'auth_token',
  },

  // User Preferences - Default Daily Goals
  DEFAULT_DAILY_GOALS: {
    calories: 2000,
    protein: 150,
    carbohydrates: 250,
    fats: 80,
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

  // Default User Preferences
  DEFAULT_PREFERENCES: {
    theme: 'dark' as const,
    units: 'metric' as const,
    language: 'en',
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      workoutReminders: true,
      nutritionReminders: true,
      goalReminders: true,
      socialNotifications: true,
    },
    privacy: {
      profileVisibility: 'public' as const,
      showWorkouts: true,
      showNutrition: true,
      showGoals: true,
      showStats: true,
    },
  },

  // Connection Status
  CONNECTION_STATUS: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
  },

  // Analytics
  ANALYTICS: {
    WEEK_DAYS: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    MONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    WEEKS: ['W1', 'W2', 'W3', 'W4'],
  },

  // Time Ranges
  TIME_RANGES: {
    WEEK_MS: 7 * 24 * 60 * 60 * 1000,
    MONTH_MS: 30 * 24 * 60 * 60 * 1000,
    YEAR_MS: 365 * 24 * 60 * 60 * 1000,
  },
};
