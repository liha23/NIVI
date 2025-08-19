import React, { useState, useEffect } from 'react'
import { Send, Bot, User, Trash2, Sparkles } from 'lucide-react'
import ChatMessage from './components/ChatMessage'
import TypingIndicator from './components/TypingIndicator'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import AuthPage from './components/AuthPage'
import { config } from '../config.js'
import { frontendConfig } from './config.js'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function App() {
  console.log('App component rendering...')
  
  const { user, token, isAuthenticated, logout, login, isLoading: authLoading } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [currentChatId, setCurrentChatId] = useState(null)
  const [currentMessages, setCurrentMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastSavedMessages, setLastSavedMessages] = useState([])

  console.log('Auth state:', { user, isAuthenticated, authLoading })

  // Single useEffect for all initialization and saving logic
  useEffect(() => {
    console.log('Initialization useEffect triggered:', { isAuthenticated, token: !!token })
    
    // Clear lastSavedMessages on initialization to allow fresh loading
    setLastSavedMessages([])
    
    // Initialize app state
    if (isAuthenticated && token) {
      // Load chats from MongoDB for authenticated users
      console.log('Loading chats from MongoDB...')
      loadChatsFromMongoDB()
    } else if (!isAuthenticated) {
      // Load from localStorage for non-authenticated users
      console.log('Loading chats from localStorage...')
      const savedChatHistory = localStorage.getItem('ai_chat_history')
      if (savedChatHistory) {
        try {
          const history = JSON.parse(savedChatHistory)
          console.log('Loaded chat history from localStorage:', history.length, 'chats')
          setChatHistory(history)
          
          if (history.length > 0) {
            const mostRecentChat = history[0]
            console.log('Setting current chat to most recent:', mostRecentChat.id)
            setCurrentChatId(mostRecentChat.id)
            
            const savedMessages = localStorage.getItem(`chat_${mostRecentChat.id}`)
            if (savedMessages) {
              try {
                const messages = JSON.parse(savedMessages)
                // Ensure all timestamps are properly formatted
                const formattedMessages = messages.map(msg => ({
                  ...msg,
                  timestamp: msg.timestamp ? new Date(msg.timestamp).toISOString() : new Date().toISOString()
                }))
                console.log('Loaded messages for current chat:', formattedMessages.length, 'messages')
                setCurrentMessages(formattedMessages.length > 0 ? formattedMessages : [getWelcomeMessage()])
              } catch (error) {
                console.error('Error loading from localStorage:', error)
                setCurrentMessages([getWelcomeMessage()])
              }
            } else {
              console.log('No saved messages found, creating welcome message')
              setCurrentMessages([getWelcomeMessage()])
            }
          } else {
            console.log('No chat history found, creating new chat')
            createNewChat()
          }
        } catch (error) {
          console.error('Error loading from localStorage:', error)
          createNewChat()
        }
      } else {
        console.log('No saved chat history found, creating new chat')
        createNewChat()
      }
    }
  }, [isAuthenticated, token])

  // Single useEffect for saving data - with much more aggressive debouncing
  useEffect(() => {
    console.log('Save effect triggered:', { 
      isAuthenticated, 
      hasToken: !!token, 
      currentChatId, 
      messagesCount: currentMessages.length,
      chatHistoryCount: chatHistory.length 
    })
    
    // Only save if we have meaningful changes and the messages have actually changed
    const messagesChanged = JSON.stringify(currentMessages) !== JSON.stringify(lastSavedMessages)
    const shouldSave = currentMessages.length > 1 || 
                      (currentMessages.length === 1 && currentMessages[0].type === 'user')
    
    console.log('Save conditions:', { messagesChanged, shouldSave, currentChatId: !!currentChatId })
    
    // Much more aggressive debouncing - only save after 5 seconds of inactivity
    const saveTimeout = setTimeout(() => {
      if (isAuthenticated && token && currentChatId && shouldSave && messagesChanged) {
        console.log('Saving to MongoDB after 5s debounce...')
        saveCurrentChatToMongoDB()
        setLastSavedMessages([...currentMessages])
      }
      
      if (!isAuthenticated && currentChatId && currentMessages.length > 0) {
        console.log('Saving to localStorage...')
        localStorage.setItem(`chat_${currentChatId}`, JSON.stringify(currentMessages))
      }
      
      if (!isAuthenticated && chatHistory.length > 0) {
        console.log('Saving chat history to localStorage...')
        localStorage.setItem('ai_chat_history', JSON.stringify(chatHistory))
      }
    }, 5000) // 5 second debounce to drastically reduce API calls
    
    return () => clearTimeout(saveTimeout)
  }, [currentMessages, currentChatId, chatHistory, isAuthenticated, token, lastSavedMessages])

  // Helper function to create welcome message
  const getWelcomeMessage = () => ({
    id: Date.now(),
    type: 'bot',
    content: "Hello! I'm your AI assistant powered by Gupsup. How can I help you today?",
    timestamp: new Date().toISOString()
  })

  // MongoDB functions
  const loadChatsFromMongoDB = async () => {
    try {
      console.log('Loading chats from MongoDB...')
      const response = await fetch(`${frontendConfig.getApiUrl()}/api/chat`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('MongoDB response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('MongoDB response data:', data)
        
        if (data.success && data.data) {
          const chats = data.data.map(chat => ({
            id: chat.chatId,
            title: chat.title,
            messageCount: chat.messageCount,
            lastMessage: chat.lastMessage,
            timestamp: new Date(chat.updatedAt)
          }))
          console.log('Processed chats:', chats)
          setChatHistory(chats)
          
          if (chats.length > 0) {
            console.log('Loading first chat:', chats[0].id)
            await loadChatFromMongoDB(chats[0].id)
          } else {
            console.log('No chats found, creating new chat')
            createNewChat()
          }
        } else {
          console.log('No success or data in response, creating new chat')
          createNewChat()
        }
      } else {
        const errorText = await response.text()
        console.error('Failed to load chats from MongoDB:', response.status, errorText)
        createNewChat()
      }
    } catch (error) {
      console.error('Error loading chats from MongoDB:', error)
      createNewChat()
    }
  }

  const loadChatFromMongoDB = async (chatId) => {
    try {
      console.log('Loading chat from MongoDB:', chatId)
      const response = await fetch(`${frontendConfig.getApiUrl()}/api/chat/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Load chat response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Load chat response data:', data)
        
        if (data.success && data.data && data.data.messages) {
          // Ensure all timestamps are properly formatted
          const messages = data.data.messages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp).toISOString() : new Date().toISOString()
          }))
          console.log('Loaded messages:', messages.length, 'messages')
          const finalMessages = messages.length > 0 ? messages : [getWelcomeMessage()]
          setCurrentMessages(finalMessages)
          setCurrentChatId(chatId)
          // Update lastSavedMessages to prevent unnecessary saves
          setLastSavedMessages([...finalMessages])
          console.log('✅ Chat loaded successfully from MongoDB')
        } else {
          console.error('Failed to load chat - no messages:', data)
          const welcomeMessage = [getWelcomeMessage()]
          setCurrentMessages(welcomeMessage)
          setCurrentChatId(chatId)
          setLastSavedMessages([...welcomeMessage])
        }
      } else {
        const errorText = await response.text()
        console.error('Failed to load chat:', response.status, errorText)
        const welcomeMessage = [getWelcomeMessage()]
        setCurrentMessages(welcomeMessage)
        setCurrentChatId(chatId)
        setLastSavedMessages([...welcomeMessage])
      }
    } catch (error) {
      console.error('Error loading chat from MongoDB:', error)
      const welcomeMessage = [getWelcomeMessage()]
      setCurrentMessages(welcomeMessage)
      setCurrentChatId(chatId)
      setLastSavedMessages([...welcomeMessage])
    }
  }

  const saveCurrentChatToMongoDB = async () => {
    console.log('saveCurrentChatToMongoDB called with:', {
      currentChatId,
      messagesCount: currentMessages.length,
      isAuthenticated,
      hasToken: !!token,
      firstMessage: currentMessages[0]?.content?.substring(0, 50)
    })
    
    if (!currentChatId || !currentMessages.length || !isAuthenticated || !token) {
      console.log('Skipping MongoDB save - missing data:', { 
        currentChatId, 
        messagesCount: currentMessages.length, 
        isAuthenticated, 
        hasToken: !!token 
      })
      return
    }
    
    try {
      console.log('Saving chat to MongoDB:', currentChatId, 'with', currentMessages.length, 'messages')
      
      // First, try to update the chat (in case it exists)
      const updateResponse = await fetch(`${frontendConfig.getApiUrl()}/api/chat/${currentChatId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: currentMessages
        })
      })
      
      console.log('Update chat response status:', updateResponse.status)
      
      if (updateResponse.ok) {
        // Chat exists and was updated successfully
        const data = await updateResponse.json()
        console.log('Update chat response data:', data)
        
        if (data.success) {
          setChatHistory(prev => 
            prev.map(chat => 
              chat.id === currentChatId 
                ? { 
                    ...chat, 
                    title: data.data.title,
                    messageCount: data.data.messageCount,
                    lastMessage: data.data.lastMessage,
                    timestamp: new Date(data.data.updatedAt)
                  }
                : chat
            )
          )
          console.log('✅ Chat updated successfully in MongoDB')
          return
        } else {
          console.log('❌ Update failed - response not successful:', data)
        }
      } else if (updateResponse.status === 404) {
        // Chat doesn't exist, create a new one
        console.log('Chat not found, creating new chat in MongoDB')
        const createResponse = await fetch(`${frontendConfig.getApiUrl()}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: 'New Chat',
            messages: currentMessages
          })
        })
        
        console.log('Create chat response status:', createResponse.status)
        
        if (createResponse.ok) {
          const data = await createResponse.json()
          console.log('Create chat response data:', data)
          
          if (data.success) {
            const newChatId = data.data.chatId
            console.log('New chat created with ID:', newChatId)
            setCurrentChatId(newChatId)
            
            const newChat = {
              id: newChatId,
              title: data.data.title,
              messageCount: data.data.messageCount,
              lastMessage: data.data.lastMessage,
              timestamp: new Date(data.data.createdAt)
            }
            
            // Update chat history with the new MongoDB chatId
            setChatHistory(prev => 
              prev.map(chat => 
                chat.id === currentChatId 
                  ? { ...newChat, id: newChatId } // Use MongoDB chatId
                  : chat
              )
            )
            
            console.log('✅ Chat created successfully in MongoDB with ID:', newChatId)
            
            // Update lastSavedMessages to prevent unnecessary saves
            setLastSavedMessages([...currentMessages])
          } else {
            console.log('❌ Create failed - response not successful:', data)
          }
        } else {
          const errorText = await createResponse.text()
          console.error('Failed to create chat in MongoDB:', createResponse.status, errorText)
        }
      } else if (updateResponse.status === 429) {
        // Rate limited - wait and retry
        console.log('Rate limited, will retry later...')
        // Don't log this as an error since it's expected behavior
      } else {
        const errorText = await updateResponse.text()
        console.error('Failed to update chat in MongoDB:', updateResponse.status, errorText)
      }
    } catch (error) {
      console.error('Error saving chat to MongoDB:', error)
    }
  }

  const createNewChat = () => {
    console.log('Creating new chat...')
    
    const welcomeMessage = getWelcomeMessage()
    const newChatId = Date.now()
    
    if (isAuthenticated && token) {
      // For authenticated users, create a temporary chat that will be saved to MongoDB
      console.log('Creating new chat for authenticated user with temp ID:', newChatId)
      setCurrentMessages([welcomeMessage])
      setCurrentChatId(newChatId)
      setLastSavedMessages([welcomeMessage]) // Prevent unnecessary saves
      
      const newChat = {
        id: newChatId,
        title: 'New Chat',
        timestamp: new Date()
      }
      setChatHistory(prev => [newChat, ...prev])
      
      // Don't immediately save - let the save effect handle it when messages change
      // This prevents the 404 error from trying to update a non-existent chat
    } else {
      // For non-authenticated users, create local chat
      console.log('Creating new chat for non-authenticated user')
      const newChat = {
        id: newChatId,
        title: 'New Chat',
        timestamp: new Date()
      }
      
      setChatHistory(prev => [newChat, ...prev])
      setCurrentChatId(newChatId)
      setCurrentMessages([welcomeMessage])
      setLastSavedMessages([welcomeMessage]) // Prevent unnecessary saves
      
      localStorage.setItem(`chat_${newChatId}`, JSON.stringify([welcomeMessage]))
    }
  }

  const selectChat = async (chatId) => {
    console.log('Selecting chat:', chatId)
    
    // Set current chat ID immediately for UI feedback
    setCurrentChatId(chatId)
    
    if (isAuthenticated && token) {
      try {
        await loadChatFromMongoDB(chatId)
      } catch (error) {
        console.error('Error loading chat from MongoDB:', error)
        // Fallback to welcome message if loading fails
        setCurrentMessages([getWelcomeMessage()])
      }
    } else {
      const selectedChat = chatHistory.find(chat => chat.id === chatId)
      if (selectedChat) {
        const savedMessages = localStorage.getItem(`chat_${chatId}`)
        if (savedMessages) {
          try {
            const messages = JSON.parse(savedMessages)
            // Ensure all timestamps are properly formatted
            const formattedMessages = messages.map(msg => ({
              ...msg,
              timestamp: msg.timestamp ? new Date(msg.timestamp).toISOString() : new Date().toISOString()
            }))
            setCurrentMessages(formattedMessages.length > 0 ? formattedMessages : [getWelcomeMessage()])
          } catch (error) {
            console.error('Error loading chat messages from localStorage:', error)
            setCurrentMessages([getWelcomeMessage()])
          }
        } else {
          setCurrentMessages([getWelcomeMessage()])
        }
      } else {
        // If chat not found in history, create a new one
        setCurrentMessages([getWelcomeMessage()])
      }
    }
  }

  const deleteChat = async (chatId) => {
    console.log('Deleting chat:', chatId, 'Current chat ID:', currentChatId)
    console.log('Auth state:', { isAuthenticated, hasToken: !!token, hasUser: !!user })
    
    if (isAuthenticated && token && user) {
      try {
        console.log('Sending DELETE request to:', `${frontendConfig.getApiUrl()}/api/chat/${chatId}`)
        const response = await fetch(`${frontendConfig.getApiUrl()}/api/chat/${chatId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        console.log('Delete response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('Delete response data:', data)
          
          if (data.success) {
            console.log('✅ Chat deleted successfully from MongoDB')
            setChatHistory(prev => prev.filter(chat => chat.id !== chatId))
            
            // If the deleted chat was the current chat, create a new one
            if (currentChatId === chatId) {
              console.log('Deleted chat was current chat, creating new one...')
              createNewChat()
            }
          } else {
            console.error('Failed to delete chat:', data.message)
          }
        } else if (response.status === 401) {
          // Token is invalid, treat as unauthenticated
          console.log('Token invalid, treating as unauthenticated user')
          setChatHistory(prev => prev.filter(chat => chat.id !== chatId))
          localStorage.removeItem(`chat_${chatId}`)
          
          if (currentChatId === chatId) {
            createNewChat()
          }
        } else {
          const errorText = await response.text()
          console.error('Failed to delete chat:', response.status, errorText)
        }
      } catch (error) {
        console.error('Error deleting chat from MongoDB:', error)
        // Fallback to localStorage deletion on error
        setChatHistory(prev => prev.filter(chat => chat.id !== chatId))
        localStorage.removeItem(`chat_${chatId}`)
        
        if (currentChatId === chatId) {
          createNewChat()
        }
      }
    } else {
      // For non-authenticated users
      console.log('User not authenticated, deleting from localStorage only')
      setChatHistory(prev => prev.filter(chat => chat.id !== chatId))
      localStorage.removeItem(`chat_${chatId}`)
      
      // If the deleted chat was the current chat, create a new one
      if (currentChatId === chatId) {
        createNewChat()
      }
    }
  }

  const updateChatTitle = (chatId, firstMessage) => {
    const title = firstMessage.length > 50 ? firstMessage.substring(0, 50) + '...' : firstMessage
    setChatHistory(prev => 
      prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, title } 
          : chat
      )
    )
  }

  const sendMessage = async (message) => {
    if (!message.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    }

    const updatedMessages = [...currentMessages, userMessage]
    setCurrentMessages(updatedMessages)
    setIsLoading(true)

    // Update chat title for the first user message
    if (currentMessages.length === 1) {
      updateChatTitle(currentChatId, message.trim())
    }

    // Save user message immediately to ensure it's stored
    if (isAuthenticated && token && currentChatId) {
      console.log('Saving user message immediately...')
      setTimeout(() => {
        saveCurrentChatToMongoDB()
        setLastSavedMessages([...updatedMessages])
      }, 500)
    } else if (!isAuthenticated && currentChatId) {
      console.log('Saving user message to localStorage...')
      localStorage.setItem(`chat_${currentChatId}`, JSON.stringify(updatedMessages))
    }

    try {
      const response = await fetchGeminiResponse(message.trim())
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response,
        timestamp: new Date().toISOString()
      }

      const finalMessages = [...updatedMessages, botMessage]
      setCurrentMessages(finalMessages)
      
      // Force save after bot response to ensure conversation is saved
      if (isAuthenticated && token && currentChatId) {
        setTimeout(() => {
          console.log('Force saving after bot response...')
          saveCurrentChatToMongoDB()
          setLastSavedMessages([...finalMessages])
        }, 2000) // Increased delay to avoid conflicts with debounced save
      } else if (!isAuthenticated && currentChatId) {
        setTimeout(() => {
          console.log('Force saving to localStorage after bot response...')
          localStorage.setItem(`chat_${currentChatId}`, JSON.stringify(finalMessages))
        }, 2000)
      }
      
      return response
    } catch (error) {
      console.error('Error:', error)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm sorry, I encountered an error. Please try again or check your API key configuration.",
        timestamp: new Date().toISOString()
      }
      const finalMessages = [...updatedMessages, errorMessage]
      setCurrentMessages(finalMessages)
      
      return errorMessage.content
    } finally {
      setIsLoading(false)
    }
  }

  const fetchGeminiResponse = async (message) => {
    const creatorKeywords = ['who made you', 'who created you', 'who is your creator', 'who built you', 'who developed you']
    const isCreatorQuestion = creatorKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    )

    if (isCreatorQuestion) {
      return `${config.CREATOR_NAME} is my creator! I was built with love and care by ${config.CREATOR_NAME} using the Gupsup AI technology. How can I assist you today?`
    }

    const API_KEY = config.GEMINI_API_KEY
    
    if (API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      return "Please configure your Gupsup AI API key in the config.js file. Replace 'YOUR_GEMINI_API_KEY_HERE' with your actual API key from Google AI Studio."
    }

    const response = await fetch(`${config.API_BASE_URL}/models/${config.MODEL}:generateContent?key=${API_KEY}`, {
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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.candidates[0].content.parts[0].text
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const getCurrentChatTitle = () => {
    const currentChat = chatHistory.find(chat => chat.id === currentChatId)
    return currentChat?.title || 'New Chat'
  }

  const handleLogout = () => {
    logout()
    setChatHistory([])
    setCurrentChatId(null)
    setCurrentMessages([])
  }

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <ThemeProvider>
        <div className="h-screen bg-dark-950 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-sunset-pink to-sunset-purple rounded-2xl flex items-center justify-center shadow-lg shadow-sunset-pink/30 mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="w-8 h-8 border-2 border-sunset-pink border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  // Show authentication page if not authenticated
  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <AuthPage onAuthSuccess={(authData) => {
          console.log('Auth success:', authData)
          login(authData)
        }} />
      </ThemeProvider>
    )
  }

  console.log('Showing main app...')
  
  return (
    <ThemeProvider>
      <div className="h-screen bg-dark-950 overflow-hidden">


        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
          chatHistory={chatHistory}
          onSelectChat={selectChat}
          onNewChat={createNewChat}
          onDeleteChat={deleteChat}
          currentChatId={currentChatId}
        />
        
        <ChatArea
          messages={currentMessages}
          onSendMessage={sendMessage}
          isLoading={isLoading}
          isSidebarOpen={isSidebarOpen}
          currentChatTitle={getCurrentChatTitle()}
          onToggleSidebar={toggleSidebar}
          user={user}
          onLogout={handleLogout}
        />
      </div>
    </ThemeProvider>
  )
}

const AppWrapper = () => {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </AuthProvider>
  )
}

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen bg-dark-950 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-red-600 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-gray-400 mb-4">Please refresh the page to try again</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gradient-to-r from-sunset-pink to-sunset-purple text-white rounded-lg"
            >
              Refresh Page
            </button>
            {this.state.error && (
              <details className="mt-4 text-left max-w-md mx-auto">
                <summary className="text-gray-400 cursor-pointer">Error Details</summary>
                <pre className="text-xs text-red-400 mt-2 bg-dark-800 p-2 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default AppWrapper
