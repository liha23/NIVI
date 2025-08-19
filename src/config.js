// Frontend configuration for AI Chat
export const frontendConfig = {
  // API Configuration
  API_BASE_URL: 'https://nivi-4l6r.vercel.app',
  
  // App Configuration
  APP_NAME: 'Gupsup AI',
  CREATOR_NAME: 'Gupsup',
  
  // Development vs Production
  IS_PRODUCTION: true, // Set to false for local development
  
  // Fallback to localhost for development
  getApiUrl: () => {
    return frontendConfig.IS_PRODUCTION 
      ? frontendConfig.API_BASE_URL 
      : 'http://localhost:5000';
  }
};
