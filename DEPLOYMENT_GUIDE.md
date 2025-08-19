# 🚀 Deployment Guide: AI Chat Server to Northflank

## 📋 Prerequisites

1. **Northflank Account**: Sign up at [northflank.com](https://northflank.com)
2. **MongoDB Atlas**: Your MongoDB database (already configured)
3. **GitHub Repository**: Your code should be in a GitHub repo

## 🔧 Step 1: Prepare Your Repository

### 1.1 Update Frontend API URL
Update your frontend to use the Vercel URL:

```javascript
// In your frontend config or environment variables
const API_BASE_URL = 'https://nivi-4l6r.vercel.app'
```

### 1.2 Commit and Push Your Changes
```bash
git add .
git commit -m "Prepare for Northflank deployment"
git push origin main
```

## 🌐 Step 2: Backend Already Deployed to Vercel

Your backend is already deployed at: **https://nivi-4l6r.vercel.app**

### 2.1 Verify Backend Deployment

1. **Test the health endpoint**: Visit `https://nivi-4l6r.vercel.app/api/health`
2. **Check if the server is responding correctly**

### 2.2 Environment Variables (Already Configured)

Your Vercel deployment should have these environment variables configured:

| Variable | Value | Description |
|----------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://aadileetcode:3PyPy3AbgYSbTtrZ@cluster0.ppfyozj.mongodb.net/ai-chat` | Your MongoDB connection string |
| `JWT_SECRET` | `nivi-ai-chat-secret-key-2024` | Your JWT secret key |
| `NODE_ENV` | `production` | Environment setting |
| `FRONTEND_URL` | `https://your-frontend-domain.com` | Your frontend URL (update when you deploy frontend) |

## 🔗 Step 3: Frontend Connected to Vercel Backend

✅ **Frontend Configuration Updated**

Your frontend has been updated to connect to the Vercel backend at `https://nivi-4l6r.vercel.app`. The following changes were made:

### 3.1 API Configuration Updated

- Created `src/config.js` with centralized API configuration
- Updated all API calls in `App.jsx`, `Login.jsx`, and `Register.jsx`
- Frontend now uses: `https://nivi-4l6r.vercel.app`

### 3.2 CORS Settings

In your Vercel environment variables, set:
```
FRONTEND_URL=https://your-frontend-domain.com
```

**Note**: Update this when you deploy your frontend to production.

## 🧪 Step 4: Test Your Deployment

### 4.1 Health Check
Visit: `https://nivi-4l6r.vercel.app/api/health`

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
   - Check Node.js version compatibility

2. **Runtime Errors**:
   - Check Vercel logs in the dashboard
   - Verify environment variables are set correctly
   - Check if your server is configured for Vercel's serverless environment

3. **CORS Errors**:
   - Update `FRONTEND_URL` environment variable
   - Check if frontend URL is correct
   - Verify CORS configuration in your server code

4. **MongoDB Connection Issues**:
   - Verify `MONGODB_URI` is correct
   - Check if MongoDB Atlas allows connections from Vercel
   - Ensure network access is properly configured

### View Logs:
1. Go to your Northflank dashboard
2. Click on your service
3. Go to "Logs" tab
4. Check for any error messages

## 🚀 Step 6: Production Considerations

### 6.1 Security
- Use a strong `JWT_SECRET`
- Enable HTTPS (automatic on Northflank)
- Set up proper CORS origins
- Configure proper network policies

### 6.2 Performance
- Monitor your service usage
- Set up resource limits and scaling rules
- Configure health checks
- Set up alerts for downtime

### 6.3 Monitoring
- Use Northflank's built-in monitoring
- Set up health checks
- Monitor API response times
- Configure logging and metrics

## 📞 Support

If you encounter issues:
1. Check Northflank documentation: [docs.northflank.com](https://docs.northflank.com)
2. Check your application logs
3. Verify all environment variables are set correctly
4. Review Northflank's troubleshooting guides

## 🎉 Success!

Once deployed, your AI chat server will be available at:
`https://your-app-name.northflank.app`

Your frontend can now communicate with the deployed backend! 🚀
