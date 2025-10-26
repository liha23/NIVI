# Chat ID System Documentation

## Overview

Each chat in NIVII AI now has a unique random identifier that makes it easy to store, retrieve, and share conversations.

## Features

### 1. Unique Random Chat IDs

- **Format**: 12-character URL-safe string (e.g., `hX9kP2mN4qR7`)
- **Generation**: Uses `nanoid` library for cryptographically strong random IDs
- **Uniqueness**: Globally unique across all users (not just per-user)
- **Persistence**: Remains constant throughout the chat's lifetime

### 2. Benefits

- **Easy Storage**: Each chat has a unique identifier in MongoDB
- **Easy Retrieval**: Load any chat by its unique ID
- **Shareable**: Chat IDs are URL-safe and can be easily shared
- **No Collisions**: Extremely low probability of duplicate IDs

### 3. How It Works

#### Frontend (React)
```javascript
import { nanoid } from 'nanoid'

// Creating a new chat
const newChatId = nanoid(12) // Generates 12-character unique ID

// Chat is created with this ID and sent to backend
const chat = {
  id: newChatId,
  title: 'New Chat',
  messages: []
}
```

#### Backend (MongoDB)
```javascript
// Chat model with unique chatId
const chatSchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true,
    default: () => nanoid(12),
    unique: true // Globally unique
  },
  userId: ObjectId,
  messages: [...]
})
```

### 4. API Endpoints

#### Get Chat by ID
```http
GET /api/chat/:chatId
Authorization: Bearer <token>
```

#### Create New Chat
```http
POST /api/chat
Content-Type: application/json
Authorization: Bearer <token>

{
  "chatId": "hX9kP2mN4qR7",
  "title": "New Chat",
  "messages": []
}
```

#### Update Chat
```http
PUT /api/chat/:chatId
Content-Type: application/json
Authorization: Bearer <token>

{
  "messages": [...]
}
```

#### Delete Chat
```http
DELETE /api/chat/:chatId
Authorization: Bearer <token>
```

#### Delete All Chats (Hard Delete)
```http
DELETE /api/chat
Authorization: Bearer <token>
```

### 5. Share Functionality

Chats can be shared via URL:

1. **Generate Share Link**:
   ```javascript
   const shareLink = exportUtils.generateShareLink(chatId, messages)
   // Returns: https://nivii.app/?share=<base64-encoded-data>
   ```

2. **Open Shared Link**:
   - User clicks the share link
   - App detects `?share=` parameter
   - Creates a new chat with unique ID
   - Loads shared messages into the new chat

### 6. Persistence Across Refresh

- **Authenticated Users**: 
  - Chats are stored in MongoDB with unique chatId
  - On refresh, chats are loaded from MongoDB
  - CurrentChatId is restored from chat history

- **Non-Authenticated Users**:
  - Chats are stored in localStorage
  - Each chat uses format: `chat_<chatId>`
  - On refresh, chats are loaded from localStorage

### 7. Migration from Old System

**Old System**:
- Used sequential numbers (1, 2, 3, ...) per user
- ChatIds could conflict across users
- Not suitable for sharing

**New System**:
- Uses unique random strings
- Globally unique
- Perfect for sharing
- More secure (harder to guess)

### 8. Example Usage

```javascript
// Create a new chat
const chatId = nanoid(12) // "hX9kP2mN4qR7"

// Save to MongoDB
await Chat.create({
  chatId: chatId,
  userId: user._id,
  title: "My Chat",
  messages: []
})

// Retrieve later
const chat = await Chat.findOne({ chatId: "hX9kP2mN4qR7" })

// Share the chat
const shareLink = `https://nivii.app/?share=${btoa(JSON.stringify({
  chatId: "hX9kP2mN4qR7",
  messages: chat.messages.slice(0, 10)
}))}`
```

## Implementation Details

### Database Schema Changes

- `chatId` field changed from `Number` to `String`
- Removed `parseInt()` calls in all routes
- Updated index to be globally unique instead of per-user

### Frontend Changes

- Import `nanoid` library
- Generate chatId on chat creation
- Send chatId to backend when creating chat
- Handle shared chats from URL parameters

### Backend Changes

- Use `nanoid` for default chatId generation
- Accept chatId from frontend
- Remove sequential number logic
- Support string-based chatId in all queries

## Testing

To test the new system:

1. **Create a new chat**: Should generate unique 12-char ID
2. **Refresh the page**: Chat should reload with same ID
3. **Share a chat**: Generate share link and open in new tab
4. **Delete all chats**: Should permanently remove all user chats

## Security Considerations

- Chat IDs are not sequential, making them harder to guess
- Each user can only access their own chats (enforced by userId check)
- Share links include only first 10 messages for security
- Hard delete ensures complete data removal when requested
