# AI Chat - Dark Themed Gemini Chatbot

A beautiful, modern dark-themed AI chatbot powered by Google's Gemini API. Built with React, Tailwind CSS, and Vite.

## Features

- 🌙 **Dark Theme**: Beautiful dark UI with smooth animations
- 🤖 **Gemini AI Integration**: Powered by Google's latest Gemini 2.0 Flash model
- 💬 **Real-time Chat**: Smooth chat experience with typing indicators
- 📱 **Responsive Design**: Works perfectly on desktop and mobile
- 🎨 **Modern UI**: Clean, professional interface with gradient accents
- ⚡ **Fast Performance**: Built with Vite for lightning-fast development
- 🔄 **Chat History**: Maintains conversation context with cookie persistence
- 🗑️ **Clear Chat**: Easy way to start fresh conversations
- 👤 **Creator Recognition**: Special response for "who made you" questions
- 📋 **Collapsible Sidebar**: Toggle sidebar with full-width chat area when closed
- 💾 **Cookie Storage**: Automatic saving of chat history and sidebar state
- 🔍 **Chat Search**: Search through your conversation history
- 🗂️ **Multiple Chats**: Create and manage multiple conversations
- 🎯 **Quick Start**: Suggested prompts for getting started

## Screenshots

The chatbot features a sleek dark interface with:
- Header with app branding and clear chat button
- Message bubbles with user/bot avatars
- Typing indicators when AI is responding
- Responsive input area with send button
- Smooth animations and transitions

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy your API key

### 3. Configure API Key

Open `config.js` and replace `'YOUR_GEMINI_API_KEY_HERE'` with your actual API key:

```javascript
export const config = {
  GEMINI_API_KEY: 'your_actual_api_key_here',
  // ... other config options
}
```

### 4. Run the Development Server

```bash
npm run dev
```

The application will open at `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
```

## Usage

1. **Start Chatting**: Type your message and press Enter or click the send button
2. **Ask About Creator**: Try asking "Who made you?" or "Who is your creator?"
3. **Toggle Sidebar**: Click the toggle button to open/close the sidebar
4. **Multiple Chats**: Create new chats and switch between them using the sidebar
5. **Search Chats**: Use the search bar to find specific conversations
6. **Delete Chats**: Hover over chat items and click the trash icon to delete
7. **Quick Start**: Click on suggested prompts to get started quickly
8. **Multi-line Messages**: Use Shift+Enter for new lines

## API Configuration

The chatbot uses the Gemini 2.0 Flash model with the following configuration:

```javascript
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    contents: [
      {
        parts: [
          {
            text: message
          }
        ]
      }
    ]
  })
})
```

## Special Features

### Creator Recognition
The chatbot has built-in recognition for questions about its creator. When users ask variations of "who made you", it responds with:

> "Nivi is my creator! I was built with love and care by Nivi using the Gemini API. How can I assist you today?"

### Error Handling
- Graceful handling of API errors
- User-friendly error messages
- Fallback responses when API is unavailable

## Technologies Used

- **React 18**: Modern React with hooks
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool and dev server
- **Lucide React**: Beautiful icons
- **Gemini API**: Google's latest AI model

## Project Structure

```
ai-chat/
├── src/
│   ├── components/
│   │   ├── ChatMessage.jsx
│   │   ├── TypingIndicator.jsx
│   │   ├── Sidebar.jsx
│   │   └── ChatArea.jsx
│   ├── utils/
│   │   └── cookies.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── config.js
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Customization

### Styling
- Modify `tailwind.config.js` for theme customization
- Edit `src/index.css` for custom CSS
- Update color schemes in the component files

### Functionality
- Add new message types in `ChatMessage.jsx`
- Modify API calls in `App.jsx`
- Add new features like message reactions or file uploads

## Troubleshooting

### Common Issues

1. **API Key Error**: Make sure you've replaced the placeholder API key
2. **CORS Issues**: The Gemini API should work directly from the browser
3. **Build Errors**: Ensure all dependencies are installed with `npm install`

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify your API key is correct
3. Ensure you have a stable internet connection

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Creator

Built with ❤️ by **Nivi**

---

**Note**: This is a demo application. For production use, consider implementing proper security measures and rate limiting.
