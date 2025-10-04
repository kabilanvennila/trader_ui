// Application configuration with environment variable support

export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  },

  // Application Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Zone Trader Dashboard',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  },

  // Feature Flags
  features: {
    enableDebugLogs: true, // Enable debug logs
  },

  // User Settings Defaults
  defaults: {
    totalCapital: parseInt(import.meta.env.VITE_DEFAULT_TOTAL_CAPITAL || '1000000'),
    maxBuyingPower: parseInt(import.meta.env.VITE_DEFAULT_MAX_BUYING_POWER || '1600000'),
    currency: import.meta.env.VITE_DEFAULT_CURRENCY || 'INR',
    timezone: import.meta.env.VITE_DEFAULT_TIMEZONE || 'Asia/Kolkata',
  },

  // Pagination Configuration
  pagination: {
    defaultPageSize: parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE || '10'),
    maxPageSize: parseInt(import.meta.env.VITE_MAX_PAGE_SIZE || '100'),
  },

  // Search Configuration
  search: {
    debounceMs: parseInt(import.meta.env.VITE_SEARCH_DEBOUNCE_MS || '300'),
    minSearchLength: parseInt(import.meta.env.VITE_MIN_SEARCH_LENGTH || '2'),
  },

  // Cache Configuration
  cache: {
    durationMs: parseInt(import.meta.env.VITE_CACHE_DURATION_MS || '300000'),
    enabled: import.meta.env.VITE_ENABLE_CACHE !== 'false',
  },
};

// Helper function to validate required environment variables
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate API base URL
  if (!config.api.baseUrl) {
    errors.push('VITE_API_BASE_URL is required');
  }

  // Validate API timeout is a positive number
  if (isNaN(config.api.timeout) || config.api.timeout <= 0) {
    errors.push('VITE_API_TIMEOUT must be a positive number');
  }

  // Validate default capital values
  if (isNaN(config.defaults.totalCapital) || config.defaults.totalCapital <= 0) {
    errors.push('VITE_DEFAULT_TOTAL_CAPITAL must be a positive number');
  }

  if (isNaN(config.defaults.maxBuyingPower) || config.defaults.maxBuyingPower <= 0) {
    errors.push('VITE_DEFAULT_MAX_BUYING_POWER must be a positive number');
  }

  // Validate pagination values
  if (isNaN(config.pagination.defaultPageSize) || config.pagination.defaultPageSize <= 0) {
    errors.push('VITE_DEFAULT_PAGE_SIZE must be a positive number');
  }

  if (isNaN(config.pagination.maxPageSize) || config.pagination.maxPageSize <= 0) {
    errors.push('VITE_MAX_PAGE_SIZE must be a positive number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Development helper to log configuration
export function logConfig(): void {
  console.group('🔧 Application Configuration');
  console.log('API Base URL:', config.api.baseUrl);
  console.log('API Timeout:', config.api.timeout);
  console.log('App Name:', config.app.name);
  console.log('App Version:', config.app.version);
  console.log('Debug Logs Enabled:', config.features.enableDebugLogs);
  console.log('Environment Variables:');
  console.log('  VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('  VITE_ENABLE_DEBUG_LOGS:', import.meta.env.VITE_ENABLE_DEBUG_LOGS);
  console.log('Default Total Capital:', config.defaults.totalCapital);
  console.log('Default Max Buying Power:', config.defaults.maxBuyingPower);
  console.log('Default Currency:', config.defaults.currency);
  console.log('Default Timezone:', config.defaults.timezone);
  console.groupEnd();
}

// Initialize configuration validation on load
const validation = validateConfig();
if (!validation.isValid) {
  console.error('❌ Configuration validation failed:', validation.errors);
  if (import.meta.env.DEV) {
    console.warn('💡 Please check your environment variables and .env file');
  }
}

// Log configuration in development
if (import.meta.env.DEV) {
  logConfig();
}

export default config;
