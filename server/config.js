export const config = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://aadileetcode:3PyPy3AbgYSbTtrZ@cluster0.ppfyozj.mongodb.net/ai-chat',
  JWT_SECRET: process.env.JWT_SECRET || 'nivii-ai-chat-secret-key-2024',
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [
    'https://nivii.app',
    'https://nivi-4l6r.vercel.app',
    'https://nivi.aadigarg.life', 
    'https://aadigarg.life'
  ]
}
