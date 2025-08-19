# 🚀 Deployment Guide: AI Chat Server to Render

## 📋 Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **MongoDB Atlas**: Your MongoDB database (already configured)
3. **GitHub Repository**: Your code should be in a GitHub repo

## 🔧 Step 1: Prepare Your Repository

### 1.1 Update Frontend API URL
Update your frontend to use the Render URL once deployed:

```javascript
// In your frontend config or environment variables
const API_BASE_URL = 'https://your-app-name.onrender.com'
```

### 1.2 Commit and Push Your Changes
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

## 🌐 Step 2: Deploy to Render

### 2.1 Create New Web Service

1. **Login to Render**: Go to [dashboard.render.com](https://dashboard.render.com)
2. **Click "New +"** → **"Web Service"**
3. **Connect Repository**: Connect your GitHub repository
4. **Configure Service**:
   - **Name**: `ai-chat-server` (or your preferred name)
   - **Root Directory**: `server` (since your server code is in the server folder)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Choose "Free" for testing

### 2.2 Environment Variables

Add these environment variables in Render:

| Variable | Value | Description |
|----------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://aadileetcode:3PyPy3AbgYSbTtrZ@cluster0.ppfyozj.mongodb.net/ai-chat` | Your MongoDB connection string |
| `JWT_SECRET` | `your-super-secret-jwt-key-here` | A secure random string for JWT |
| `NODE_ENV` | `production` | Environment setting |
| `FRONTEND_URL` | `https://your-frontend-domain.com` | Your frontend URL (update later) |

### 2.3 Deploy

1. **Click "Create Web Service"**
2. **Wait for deployment** (usually 2-5 minutes)
3. **Copy the URL** (e.g., `https://ai-chat-server.onrender.com`)

## 🔗 Step 3: Update Frontend Configuration

### 3.1 Update API Base URL

Update your frontend to use the Render URL:

```javascript
// In your frontend config file
const API_BASE_URL = 'https://your-app-name.onrender.com'
```

### 3.2 Update CORS Settings

In your Render environment variables, set:
```
FRONTEND_URL=https://your-frontend-domain.com
```

## 🧪 Step 4: Test Your Deployment

### 4.1 Health Check
Visit: `https://your-app-name.onrender.com/api/health`

Expected response:
```json
{
  "success": true,
  "message": "AI Chat Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

### 4.2 Test API Endpoints
Use tools like Postman or curl to test:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/chat`

## 🔧 Step 5: Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check if `package.json` is in the correct directory
   - Verify all dependencies are listed

2. **Runtime Errors**:
   - Check Render logs in the dashboard
   - Verify environment variables are set correctly

3. **CORS Errors**:
   - Update `FRONTEND_URL` environment variable
   - Check if frontend URL is correct

4. **MongoDB Connection Issues**:
   - Verify `MONGODB_URI` is correct
   - Check if MongoDB Atlas allows connections from Render

### View Logs:
1. Go to your Render dashboard
2. Click on your service
3. Go to "Logs" tab
4. Check for any error messages

## 🚀 Step 6: Production Considerations

### 6.1 Security
- Use a strong `JWT_SECRET`
- Enable HTTPS (automatic on Render)
- Set up proper CORS origins

### 6.2 Performance
- Consider upgrading to a paid plan for better performance
- Monitor your service usage
- Set up alerts for downtime

### 6.3 Monitoring
- Use Render's built-in monitoring
- Set up health checks
- Monitor API response times

## 📞 Support

If you encounter issues:
1. Check Render documentation: [docs.render.com](https://docs.render.com)
2. Check your application logs
3. Verify all environment variables are set correctly

## 🎉 Success!

Once deployed, your AI chat server will be available at:
`https://your-app-name.onrender.com`

Your frontend can now communicate with the deployed backend! 🚀
