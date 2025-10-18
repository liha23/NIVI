# MongoDB Setup and Configuration Guide

This guide explains how to set up MongoDB for the NIVI AI Chat application and troubleshoot common connection issues.

## Overview

The NIVI AI Chat application uses MongoDB to store:
- User authentication data
- Chat history and messages
- User preferences and settings

The application is designed to work both with and without MongoDB:
- **With MongoDB**: Full persistence across devices and sessions
- **Without MongoDB**: Falls back to localStorage (browser-only persistence)

## Current Status

The application currently experiences MongoDB connection issues due to:
1. DNS resolution errors with the MongoDB Atlas cluster
2. Possible network restrictions or firewall rules
3. Cluster may be deleted or unavailable

## Setting Up MongoDB

### Option 1: MongoDB Atlas (Cloud - Recommended)

1. **Create a MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account (M0 tier is sufficient for development)

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose "Shared" (Free tier)
   - Select your preferred cloud provider and region
   - Click "Create Cluster"

3. **Configure Network Access**
   - Go to "Network Access" in the sidebar
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add specific IP addresses

4. **Create Database User**
   - Go to "Database Access" in the sidebar
   - Click "Add New Database User"
   - Choose authentication method (username/password recommended)
   - Create a username and strong password
   - Grant "Read and write to any database" role

5. **Get Connection String**
   - Go to "Database" and click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your database name (e.g., `ai-chat`)

6. **Update Configuration**
   - Create a `.env` file in the `server` directory:
     ```env
     MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ai-chat?retryWrites=true&w=majority
     JWT_SECRET=your-secret-key-here
     PORT=5000
     NODE_ENV=production
     ```
   - Or update `server/config.js` directly

### Option 2: Local MongoDB

1. **Install MongoDB**
   - Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Follow installation instructions for your OS

2. **Start MongoDB**
   ```bash
   # On macOS/Linux
   mongod --dbpath /path/to/data/directory
   
   # On Windows
   "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath="C:\data\db"
   ```

3. **Update Configuration**
   - In `server/config.js` or `.env`:
     ```
     MONGODB_URI=mongodb://localhost:27017/ai-chat
     ```

## Troubleshooting

### Connection Issues

**Error: `querySrv EREFUSED _mongodb._tcp.cluster0.xxxxx.mongodb.net`**

This error indicates DNS resolution failure. Solutions:

1. **Check MongoDB Atlas Status**
   - Verify your cluster is running in the Atlas dashboard
   - Ensure the cluster hasn't been paused or deleted

2. **Check Network Access**
   - Go to Atlas Network Access settings
   - Ensure your IP address is whitelisted
   - For testing, temporarily allow access from anywhere (0.0.0.0/0)

3. **Verify Connection String**
   - Ensure the connection string is correct
   - Check that username and password are properly encoded
   - Verify the database name is correct

4. **Test Connection**
   ```bash
   # Test MongoDB connection
   cd server
   node -e "const mongoose = require('mongoose'); mongoose.connect('YOUR_CONNECTION_STRING').then(() => console.log('Connected')).catch(e => console.error(e))"
   ```

### Application Behavior Without MongoDB

The application is designed to gracefully handle MongoDB unavailability:

1. **Server Startup**
   - Server will attempt to connect 3 times with exponential backoff
   - After 3 failed attempts, server continues running
   - Warning messages are logged but app remains functional

2. **API Endpoints**
   - All chat API endpoints check MongoDB connection status
   - Return appropriate warnings when database is unavailable
   - Frontend falls back to localStorage for persistence

3. **Data Persistence**
   - Without MongoDB: Data stored in browser's localStorage
   - Data only available on the same device/browser
   - Clearing browser data will delete chat history

## AI Context and Memory

### How It Works

The AI conversation memory system works independently of MongoDB:

1. **Current Chat Context**
   - All messages in the current chat session are maintained in memory
   - The AI receives conversation history with each request
   - Context window: Up to 20 recent messages (configurable)

2. **Long-term Memory**
   - Stored in localStorage (client-side)
   - Includes conversation summaries and topics
   - Persists across sessions on the same device

3. **Context Preparation**
   - Filters out welcome messages
   - Selects relevant messages based on current query
   - Creates summaries for long conversations (30+ messages)
   - Includes previous session context when relevant

### Testing AI Memory

1. **Basic Test**
   - Start a new chat
   - Tell the AI: "My favorite color is blue"
   - Ask: "What is my favorite color?"
   - The AI should remember and respond correctly

2. **Multiple Topics**
   - Tell the AI multiple facts in sequence
   - Ask it to recall all the information
   - The AI should maintain context across messages

3. **Long Conversations**
   - Continue a conversation beyond 20 messages
   - The AI should still maintain relevant context
   - Older messages are summarized but context is preserved

## Environment Variables

Create a `.env` file in the `server` directory with:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Secret for Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this

# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.com

# Additional allowed origins (comma-separated)
ALLOWED_ORIGINS=https://example1.com,https://example2.com
```

## Production Deployment

### MongoDB Atlas Setup for Production

1. **Enable Authentication**
   - Always use strong passwords
   - Enable 2FA on your Atlas account

2. **Network Security**
   - Whitelist only your production server IPs
   - Never use 0.0.0.0/0 in production

3. **Backups**
   - Enable automated backups in Atlas
   - Test restore procedures regularly

4. **Monitoring**
   - Set up Atlas monitoring and alerts
   - Monitor connection count and performance

### Application Configuration

1. **Use Environment Variables**
   - Never commit credentials to version control
   - Use proper secrets management in production

2. **Enable CORS Properly**
   - Configure `ALLOWED_ORIGINS` for your domains
   - Remove development URLs from production config

3. **Rate Limiting**
   - Uncomment rate limiting middleware in production
   - Adjust limits based on expected traffic

## Support

If you continue to experience issues:

1. Check the server logs for detailed error messages
2. Verify MongoDB Atlas cluster status
3. Test connection from your deployment environment
4. Contact MongoDB Atlas support if needed

## License

This setup guide is part of the NIVI AI Chat application.
