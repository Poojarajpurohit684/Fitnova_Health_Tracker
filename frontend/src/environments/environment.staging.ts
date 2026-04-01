// FitNova Frontend - Staging Environment Configuration

export const environment = {
  production: false,
  staging: true,
  
  // API Configuration
  apiUrl: 'https://your-backend-staging-domain.com',
  apiVersion: 'v1',
  apiTimeout: 30000, // 30 seconds
  
  // Logging
  logLevel: 'info',
  enableConsoleLogging: true,
  enableRemoteLogging: false,
  
  // Analytics
  enableAnalytics: true,
  analyticsSampleRate: 0.1,
  
  // Error Reporting
  enableErrorReporting: true,
  errorReportingDSN: '',
  
  // Feature Flags
  features: {
    socialFeatures: true,
    analyticsExport: true,
    advancedFiltering: true,
    notifications: true,
    darkMode: true,
  },
  
  // UI Configuration
  ui: {
    itemsPerPage: 20,
    animationsEnabled: true,
    theme: 'light',
  },
  
  // Cache Configuration
  cache: {
    enabled: true,
    ttl: 300000, // 5 minutes
  },
  
  // Authentication
  auth: {
    tokenStorageKey: 'fitnova_token',
    refreshTokenStorageKey: 'fitnova_refresh_token',
    tokenRefreshThreshold: 300000, // 5 minutes before expiry
  },
  
  // Notification Configuration
  notifications: {
    enabled: true,
    soundEnabled: true,
    desktopNotificationsEnabled: true,
  },
  
  // Performance Monitoring
  performanceMonitoring: {
    enabled: true,
    sampleRate: 0.1,
  },
};
