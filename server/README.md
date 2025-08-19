# AI Chat Server

Backend server for the AI Chat application with MongoDB integration.

## Features

- User authentication with JWT
- Chat storage and retrieval
- MongoDB integration
- Rate limiting
- Security middleware

## Environment Variables

Copy `env.example` to `.env` and configure:

- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `FRONTEND_URL`: Frontend URL for CORS

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production

```bash
npm start
```

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/chat` - Get user chats
- `POST /api/chat` - Create new chat
- `GET /api/chat/:id` - Get specific chat
- `PUT /api/chat/:id` - Update chat
- `DELETE /api/chat/:id` - Delete chat
- `GET /api/health` - Health check
