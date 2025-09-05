import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { config } from './config.js'
import authRoutes from './routes/auth.js'
import chatRoutes from './routes/chat.js'

const app = express()

// Security middleware
app.use(helmet())

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? [
          config.FRONTEND_URL,
          ...config.ALLOWED_ORIGINS
        ]
      : [
          'http://localhost:3000',
          'http://localhost:5173',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:5173',
          'https://nivii.app' // Allow production domain in development for testing
        ]
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
}

app.use(cors(corsOptions))

// Handle preflight requests
app.options('*', cors(corsOptions))

// Rate limiting - disabled for development to prevent 429 errors
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 20000, // limit each IP to 200 requests per windowMs (increased for development)
//   message: {
//     success: false,
//     message: 'Too many requests from this IP, please try again later.'
//   }
// })
// app.use('/api/', limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully')
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error)
  process.exit(1)
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/chat', chatRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI Chat Server is running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

// Start server
const PORT = config.PORT
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Environment: ${config.NODE_ENV}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed')
    process.exit(0)
  })
})
    