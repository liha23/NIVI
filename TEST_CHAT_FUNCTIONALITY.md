# Chat Functionality Test Guide

## Testing Chat Switching

1. **Open the application** and ensure you're logged in
2. **Create multiple chats** by clicking "New Chat" button
3. **Send messages** in each chat to make them different
4. **Click on different chats** in the sidebar to switch between them
5. **Verify** that:
   - The chat title updates in the header
   - The messages change to show the correct conversation
   - The selected chat is highlighted in the sidebar
   - Console shows "Chat clicked: [chatId]" messages

## Testing Chat Deletion

1. **Create a few chats** with different messages
2. **Click the trash icon** on any chat in the sidebar
3. **Confirm deletion** when prompted
4. **Verify** that:
   - The chat disappears from the sidebar
   - Console shows "Delete chat clicked: [chatId]" message
   - If you deleted the current chat, a new chat is automatically created
   - The chat history is properly updated

## Testing New Chat Creation

1. **Click "New Chat"** button in the sidebar
2. **Verify** that:
   - A new chat appears at the top of the sidebar
   - The new chat becomes the current chat
   - Console shows "New chat button clicked" message
   - A welcome message appears in the chat area

## Debug Information

Check the browser console for these log messages:
- "Initialization useEffect triggered"
- "Loading chats from MongoDB/localStorage"
- "Chat clicked: [chatId]"
- "Delete chat clicked: [chatId]"
- "New chat button clicked"
- "Creating new chat..."
- "Save effect triggered"

## Common Issues and Solutions

### Chat switching not working:
- Check if the server is running on port 5000
- Verify authentication token is valid
- Check browser console for errors

### Chat deletion not working:
- Ensure you're clicking the trash icon, not the chat area
- Check if the confirmation dialog appears
- Verify server is running and accessible

### New chat not creating:
- Check if the "New Chat" button is clickable
- Verify console shows "New chat button clicked"
- Check for any JavaScript errors in console

## Server Requirements

Make sure the server is running:
```bash
cd server
npm install
npm start
```

The server should be accessible at `http://localhost:5000`
