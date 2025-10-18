// Configuration file for AI Chat
// Replace the API key with your actual Gemini API key from Google AI Studio

export const config = {
  // Get your API key from: https://makersuite.google.com/app/apikey
  GEMINI_API_KEY: 'AIzaSyB6TgwC_T39MinVgu1taqUWT86xrIUX5LA',
  
  // API Configuration
  API_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta',
  MODEL: 'gemini-2.0-flash',
  
  // App Configuration
  APP_NAME: 'NIVII AI',
  CREATOR_NAME: 'NIVII',
  
  // UI Configuration
  MAX_MESSAGE_LENGTH: 1000,
  TYPING_DELAY: 800, // milliseconds
  
  // Theme Configuration
  THEMES: {
    midnight: {
      name: 'Midnight',
      description: 'Deep dark theme with modern aesthetics',
      primary: '#0ea5e9',
      secondary: '#8b5cf6',
      background: '#0a0a0a',
      surface: '#171717',
      surfaceHover: '#262626',
      border: '#404040',
      text: '#fafafa',
      textSecondary: '#a3a3a3',
      textMuted: '#737373',
      accent: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    aurora: {
      name: 'Aurora',
      description: 'Dark theme with vibrant gradient accents',
      primary: '#6366f1',
      secondary: '#ec4899',
      background: '#0f0f23',
      surface: '#1a1a2e',
      surfaceHover: '#2d2d3f',
      border: '#404969',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      accent: '#8b5cf6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#f43f5e'
    },
    ocean: {
      name: 'Ocean',
      description: 'Cool blue theme inspired by deep waters',
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      background: '#0c1420',
      surface: '#1e293b',
      surfaceHover: '#334155',
      border: '#475569',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      accent: '#3b82f6',
      success: '#14b8a6',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    forest: {
      name: 'Forest',
      description: 'Nature-inspired green theme',
      primary: '#10b981',
      secondary: '#059669',
      background: '#0d1b0f',
      surface: '#1a2e1a',
      surfaceHover: '#2d4a2d',
      border: '#3a5a3a',
      text: '#f0fdf4',
      textSecondary: '#86efac',
      textMuted: '#4ade80',
      accent: '#22c55e',
      success: '#10b981',
      warning: '#eab308',
      error: '#ef4444'
    },
    sunset: {
      name: 'Sunset',
      description: 'Warm orange and pink gradient theme',
      primary: '#f97316',
      secondary: '#ec4899',
      background: '#1a0f0a',
      surface: '#2a1a0f',
      surfaceHover: '#3a2a1f',
      border: '#5a4a3f',
      text: '#fef7ed',
      textSecondary: '#fdba74',
      textMuted: '#fb923c',
      accent: '#f59e0b',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    }
  },
  DEFAULT_THEME: 'midnight'
}
