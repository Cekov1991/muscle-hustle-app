// App Configuration
export const appConfig = {
  name: 'Fitness App',
  version: '1.0.0',
  
  // API Configuration
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000, // 10 seconds
  },
  
  // Authentication Configuration
  auth: {
    tokenKey: 'auth_token',
    userDataKey: 'user_data',
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  },
  
  // UI Configuration
  ui: {
    toastDuration: {
      short: 2000,
      medium: 3000,
      long: 4000,
    },
    loadingTimeout: 30000, // 30 seconds
  },
  
  // Feature Flags (for future white-labeling)
  features: {
    darkMode: true,
    biometricLogin: false,
    offlineMode: false,
    analytics: false,
  }
}

// Environment-specific overrides
if (import.meta.env.PROD) {
  // Production overrides
  appConfig.features.analytics = true
} else if (import.meta.env.DEV) {
  // Development overrides
  appConfig.api.baseURL = import.meta.env.VITE_API_BASE_URL
}

export default appConfig
