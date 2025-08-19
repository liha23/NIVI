// Configuration file for AI Chat
// Replace the API key with your actual Gemini API key from Google AI Studio

export const config = {
  // Get your API key from: https://makersuite.google.com/app/apikey
  GEMINI_API_KEY: 'AIzaSyANt_L3RmNppde7T4q3agp-yncbZ5WJ81k',
  
  // API Configuration
  API_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta',
  MODEL: 'gemini-2.0-flash',
  
  // App Configuration
  APP_NAME: 'Gupsup AI',
  CREATOR_NAME: 'Gupsup',
  
  // UI Configuration
  MAX_MESSAGE_LENGTH: 1000,
  TYPING_DELAY: 1000, // milliseconds
  
  // Theme Configuration
  THEMES: {
    dark: {
      name: 'Dark',
      description: 'Classic dark theme',
      primary: '#6366f1',
      background: '#0a0a0a',
      surface: '#1a1a1a',
      text: '#ffffff',
      textSecondary: '#9ca3af'
    },
    light: {
      name: 'Light',
      description: 'Clean light theme',
      primary: '#6366f1',
      background: '#ffffff',
      surface: '#f9fafb',
      text: '#111827',
      textSecondary: '#6b7280'
    },
    blue: {
      name: 'Blue',
      description: 'Ocean blue theme',
      primary: '#3b82f6',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f8fafc',
      textSecondary: '#94a3b8'
    },
    purple: {
      name: 'Purple',
      description: 'Royal purple theme',
      primary: '#8b5cf6',
      background: '#1a1a2e',
      surface: '#16213e',
      text: '#ffffff',
      textSecondary: '#a1a1aa'
    }
  },
  DEFAULT_THEME: 'dark'
}
