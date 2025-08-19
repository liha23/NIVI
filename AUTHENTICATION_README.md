# Authentication & MongoDB Integration

## Overview
The AI Chat application now includes a complete authentication system with MongoDB integration for storing user chat history. Users can register, login, and have their conversations automatically saved to the cloud.

## Features

### 🔐 Authentication System
- **User Registration**: Create new accounts with username, email, and password
- **User Login**: Secure login with email and password
- **JWT Tokens**: Secure authentication using JSON Web Tokens
- **Password Hashing**: Passwords are securely hashed using bcrypt
- **Session Management**: Automatic token storage and validation

### 💾 MongoDB Integration
- **User Data Storage**: User accounts stored in MongoDB
- **Chat History**: All conversations saved to MongoDB
- **Real-time Sync**: Chat data automatically syncs between sessions
- **Data Persistence**: Chat history persists across devices

### 🎨 Modern UI
- **Responsive Design**: Works on desktop and mobile
- **Dark Theme**: Consistent with existing design
- **Smooth Transitions**: Elegant animations and transitions
- **Error Handling**: User-friendly error messages

## Backend Architecture

### Database Models

#### User Model
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  avatar: String (optional),
  isActive: Boolean (default: true),
  lastLogin: Date,
  timestamps: true
}
```

#### Chat Model
```javascript
{
  userId: ObjectId (ref: User),
  chatId: Number (unique per user),
  title: String,
  messages: [{
    id: Number,
    type: String (user/bot),
    content: String,
    timestamp: Date
  }],
  isActive: Boolean (default: true),
  timestamps: true
}
```

### API Endpoints

#### Authentication Routes (`/api/auth`)
- `POST /register` - Create new user account
- `POST /login` - User login
- `GET /profile` - Get user profile (protected)
- `PUT /profile` - Update user profile (protected)
- `PUT /change-password` - Change password (protected)

#### Chat Routes (`/api/chat`)
- `GET /` - Get all user chats (protected)
- `GET /:chatId` - Get specific chat with messages (protected)
- `POST /` - Create new chat (protected)
- `PUT /:chatId` - Update chat (protected)
- `DELETE /:chatId` - Delete chat (protected)
- `DELETE /` - Clear all chats (protected)

## Frontend Components

### Authentication Components
- **Login.jsx**: User login form with validation
- **Register.jsx**: User registration form with validation
- **AuthPage.jsx**: Container for login/register switching
- **AuthContext.jsx**: Authentication state management

### Integration
- **App.jsx**: Updated to handle authentication flow
- **MongoDB Sync**: Automatic chat saving and loading
- **User Interface**: User info display and logout functionality

## Setup Instructions

### 1. Backend Setup
```bash
cd server
npm install
npm run dev
```

### 2. Frontend Setup
```bash
cd ..
npm install
npm run dev
```

### 3. MongoDB Configuration
The application uses the provided MongoDB connection string:
```
mongodb+srv://aadileetcode:3PyPy3AbgYSbTtrZ@cluster0.ppfyozj.mongodb.net/ai-chat
```

## Usage Flow

### For New Users
1. **Register**: Click "Sign up here" on login page
2. **Create Account**: Fill in username, email, and password
3. **Start Chatting**: Automatically logged in and ready to chat
4. **Data Sync**: All conversations saved to MongoDB

### For Existing Users
1. **Login**: Enter email and password
2. **Load History**: Previous chats automatically loaded
3. **Continue Chatting**: Seamless experience with cloud sync

### Features Available
- **Cloud Storage**: Chat history saved to MongoDB
- **Cross-Device Sync**: Access chats from any device
- **Secure Authentication**: JWT-based security
- **User Profile**: Manage account settings
- **Logout**: Secure session termination

## Security Features

### Password Security
- **bcrypt Hashing**: Passwords hashed with salt rounds
- **Minimum Length**: 6 character minimum
- **Validation**: Client and server-side validation

### Authentication Security
- **JWT Tokens**: Secure token-based authentication
- **Token Expiry**: 7-day token expiration
- **Protected Routes**: API endpoints require authentication
- **CORS Protection**: Cross-origin request protection

### Data Security
- **Input Validation**: All inputs validated and sanitized
- **Rate Limiting**: API rate limiting to prevent abuse
- **Error Handling**: Secure error messages without data leakage

## Database Operations

### Chat Management
- **Automatic Saving**: Chats saved after each message
- **Real-time Updates**: Changes immediately synced
- **Soft Deletes**: Chats marked inactive rather than deleted
- **User Isolation**: Users can only access their own chats

### Performance Optimizations
- **Indexing**: Database indexes for faster queries
- **Pagination**: Efficient data loading
- **Caching**: Local storage for immediate access
- **Lazy Loading**: Chat messages loaded on demand

## Error Handling

### Network Errors
- **Graceful Degradation**: Falls back to local storage
- **Retry Logic**: Automatic retry for failed requests
- **User Feedback**: Clear error messages

### Authentication Errors
- **Token Validation**: Automatic token refresh
- **Session Expiry**: Graceful logout on expired sessions
- **Invalid Credentials**: Clear feedback for login issues

## Future Enhancements

### Planned Features
- **Email Verification**: Email confirmation for new accounts
- **Password Reset**: Forgot password functionality
- **Social Login**: Google, GitHub integration
- **Two-Factor Authentication**: Enhanced security
- **Chat Export**: Export conversations to file
- **User Avatars**: Profile picture upload
- **Chat Sharing**: Share conversations with other users

### Technical Improvements
- **Real-time Updates**: WebSocket integration
- **Offline Support**: Offline chat capability
- **Push Notifications**: Browser notifications
- **Advanced Search**: Search through chat history
- **Chat Analytics**: Usage statistics and insights

## Troubleshooting

### Common Issues

**"Connection failed"**
- Check if backend server is running
- Verify MongoDB connection string
- Check network connectivity

**"Login failed"**
- Verify email and password
- Check if account exists
- Ensure proper email format

**"Chats not loading"**
- Check authentication token
- Verify MongoDB connection
- Check browser console for errors

**"Registration failed"**
- Ensure username/email not already taken
- Check password requirements
- Verify all fields are filled

### Performance Tips
- **Close Unused Tabs**: Reduce memory usage
- **Clear Browser Cache**: If experiencing issues
- **Stable Internet**: For optimal sync performance
- **Regular Logout**: Clear sessions periodically

This authentication system provides a secure, scalable foundation for the AI Chat application with full MongoDB integration for persistent data storage.

