import React, { useState, useEffect } from 'react'
import { Send, Bot, User, Trash2, Sparkles, Download, BarChart3, Search, Bookmark } from 'lucide-react'
import ChatMessage from './components/ChatMessage'
import TypingIndicator from './components/TypingIndicator'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import AuthPage from './components/AuthPage'
import ExportModal from './components/ExportModal'
import AnalyticsModal from './components/AnalyticsModal'
import SearchModal from './components/SearchModal'
import { config } from '../config.js'
import { frontendConfig } from './config.js'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { keyboardShortcuts } from './utils/keyboardShortcuts'
import { analyticsUtils } from './utils/analyticsUtils'
import { 
  prepareConversationContext, 
  updateMemoryData, 
  saveMemoryToStorage, 
  loadMemoryFromStorage,
  getMemoryStats 
} from './utils/memoryUtils'

function App() {
  console.log('App component rendering...')
  
  const { user, token, isAuthenticated, logout, login, isLoading: authLoading } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [currentChatId, setCurrentChatId] = useState(null)
  const [currentMessages, setCurrentMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastSavedMessages, setLastSavedMessages] = useState([])
  const [responseCache, setResponseCache] = useState(new Map()) // Simple cache for responses
  
  // New feature states
  const [showExportModal, setShowExportModal] = useState(false)
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [bookmarkedMessages, setBookmarkedMessages] = useState([])
  const [messageReactions, setMessageReactions] = useState({})
  const [messageLikes, setMessageLikes] = useState({})
  const [messageDislikes, setMessageDislikes] = useState({})
  const [replyToMessage, setReplyToMessage] = useState(null)
  
  // Memory management state
  const [memoryData, setMemoryData] = useState(null)
  const [memoryStats, setMemoryStats] = useState(null)

  console.log('Auth state:', { user, isAuthenticated, authLoading })

  // Utility function to remove duplicate messages
  const removeDuplicateMessages = (messages) => {
    return messages.filter((msg, index, self) => 
      index === self.findIndex(m => 
        m.id === msg.id && 
        m.content === msg.content && 
        m.timestamp === msg.timestamp &&
        m.type === msg.type
      )
    )
  }

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
           
           // Ensure all chat history items have proper timestamp fields
           const formattedHistory = history.map(chat => ({
             ...chat,
             lastActivity: chat.lastActivity || chat.timestamp || new Date(),
             createdAt: chat.createdAt || chat.timestamp || new Date(),
             timestamp: chat.timestamp || new Date()
           }))
           
           setChatHistory(formattedHistory)
          
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
                const deduplicatedMessages = removeDuplicateMessages(formattedMessages)
                console.log('Loaded messages for current chat:', deduplicatedMessages.length, 'messages')
                setCurrentMessages(deduplicatedMessages.length > 0 ? deduplicatedMessages : [getWelcomeMessage()])
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

  // Initialize memory system
  useEffect(() => {
    const loadedMemory = loadMemoryFromStorage()
    setMemoryData(loadedMemory)
    setMemoryStats(getMemoryStats(loadedMemory))
    console.log('Memory system initialized:', getMemoryStats(loadedMemory))
  }, [])

  // Single useEffect for saving data - with immediate save for important changes
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
    const shouldSave = currentMessages.length > 0
    
    console.log('Save conditions:', { messagesChanged, shouldSave, currentChatId: !!currentChatId })
    
    if (shouldSave && messagesChanged) {
      // Immediate save for important changes (user messages, bot responses)
      if (isAuthenticated && token && currentChatId) {
        console.log('Saving to MongoDB immediately...')
        saveCurrentChatToMongoDB().then(() => {
          setLastSavedMessages([...currentMessages])
        }).catch(error => {
          console.error('Failed to save to MongoDB:', error)
        })
      }
      
      if (!isAuthenticated && currentChatId) {
        console.log('Saving to localStorage immediately...')
        localStorage.setItem(`chat_${currentChatId}`, JSON.stringify(currentMessages))
      }
      
      if (!isAuthenticated && chatHistory.length > 0) {
        console.log('Saving chat history to localStorage...')
        localStorage.setItem('ai_chat_history', JSON.stringify(chatHistory))
      }
    }
  }, [currentMessages, currentChatId, chatHistory, isAuthenticated, token, lastSavedMessages])

  // Save on page unload/close
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('Page unloading, saving current chat...')
      if (isAuthenticated && token && currentChatId && currentMessages.length > 0) {
        // Use sendBeacon for reliable saving on page unload
        const data = JSON.stringify({
          messages: currentMessages
        })
        navigator.sendBeacon(`${frontendConfig.getApiUrl()}/api/chat/${currentChatId}`, data)
      }
      
      if (!isAuthenticated && currentChatId && currentMessages.length > 0) {
        localStorage.setItem(`chat_${currentChatId}`, JSON.stringify(currentMessages))
        localStorage.setItem('ai_chat_history', JSON.stringify(chatHistory))
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [currentMessages, currentChatId, chatHistory, isAuthenticated, token])

  // Initialize keyboard shortcuts
  useEffect(() => {
    const appFunctions = {
      createNewChat,
      toggleSidebar: () => setIsSidebarOpen(!isSidebarOpen),
      closeModals: () => {
        setShowExportModal(false)
        setShowAnalyticsModal(false)
        setShowSearchModal(false)
      },
      openSearch: () => setShowSearchModal(true),
      saveChat: forceSaveCurrentChat,
      exportChat: () => setShowExportModal(true),
      sendMessage: () => {
        // This would need to be implemented with a ref to the input
        console.log('Send message shortcut triggered')
      },
      previousMessage: () => {
        // Navigate to previous message
        console.log('Previous message shortcut triggered')
      },
      nextMessage: () => {
        // Navigate to next message
        console.log('Next message shortcut triggered')
      },
      toggleTheme: () => {
        // This would need to be implemented with theme context
        console.log('Toggle theme shortcut triggered')
      },
      toggleVoiceMode: () => {
        // This would need to be implemented with voice mode
        console.log('Toggle voice mode shortcut triggered')
      },
      openSettings: () => {
        // This would need to be implemented with settings modal
        console.log('Open settings shortcut triggered')
      },
      showHelp: () => {
        // Show keyboard shortcuts help
        console.log('Show help shortcut triggered')
      }
    }

    keyboardShortcuts.initialize(appFunctions)

    return () => {
      keyboardShortcuts.cleanup()
    }
  }, [isSidebarOpen])

  // Track user behavior
  useEffect(() => {
    if (currentMessages.length > 0) {
      analyticsUtils.trackUserBehavior('message_sent', {
        messageCount: currentMessages.length,
        chatId: currentChatId
      })
    }
  }, [currentMessages.length, currentChatId])

  // Clear authentication data (for debugging auth issues)
  const clearAuthData = () => {
    console.log('Clearing authentication data...')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setToken(null)
    console.log('✅ Authentication data cleared')
  }

  // Debug function to inspect JWT token
  const inspectJWTToken = () => {
    if (!token) {
      console.log('❌ No token found')
      return
    }
    
    console.log('🔍 JWT Token Analysis:')
    console.log('Raw token:', token)
    
    try {
      // Split the token into its parts
      const parts = token.split('.')
      if (parts.length !== 3) {
        console.log('❌ Invalid JWT format')
        return
      }
      
      // Decode header (without verification)
      const header = JSON.parse(atob(parts[0]))
      console.log('📋 Header:', header)
      
      // Decode payload (without verification)
      const payload = JSON.parse(atob(parts[1]))
      console.log('📦 Payload:', payload)
      
      // Check if token is expired
      const now = Math.floor(Date.now() / 1000)
      if (payload.exp && payload.exp < now) {
        console.log('⚠️ Token is EXPIRED!')
        console.log('Expires at:', new Date(payload.exp * 1000).toISOString())
        console.log('Current time:', new Date().toISOString())
      } else if (payload.exp) {
        console.log('✅ Token is valid')
        console.log('Expires at:', new Date(payload.exp * 1000).toISOString())
        console.log('Current time:', new Date().toISOString())
      }
      
      console.log('🔐 Signature (last part):', parts[2])
      
    } catch (error) {
      console.error('❌ Error decoding JWT:', error)
    }
  }

  // Make inspectJWTToken available globally for debugging
  window.inspectJWTToken = inspectJWTToken

  // Force save function for critical saves
  const forceSaveCurrentChat = async () => {
    if (isAuthenticated && token && currentChatId && currentMessages.length > 0) {
      try {
        console.log('Force saving current chat...')
        await saveCurrentChatToMongoDB()
        setLastSavedMessages([...currentMessages])
        console.log('✅ Force save completed successfully')
      } catch (error) {
        console.error('❌ Force save failed:', error)
      }
    } else if (!isAuthenticated && currentChatId && currentMessages.length > 0) {
      console.log('Force saving to localStorage...')
      localStorage.setItem(`chat_${currentChatId}`, JSON.stringify(currentMessages))
      localStorage.setItem('ai_chat_history', JSON.stringify(chatHistory))
      console.log('✅ Force save to localStorage completed')
    }
  }

  // Periodic save to ensure messages are saved
  useEffect(() => {
    if (currentMessages.length > 0 && currentChatId) {
      const interval = setInterval(() => {
        const messagesChanged = JSON.stringify(currentMessages) !== JSON.stringify(lastSavedMessages)
        if (messagesChanged) {
          console.log('Periodic save triggered...')
          forceSaveCurrentChat()
        }
      }, 10000) // Save every 10 seconds if there are unsaved changes
      
      return () => clearInterval(interval)
    }
  }, [currentMessages, currentChatId, lastSavedMessages, isAuthenticated, token])
  
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
        
        // Check for database warning (MongoDB not connected)
        if (data.warning) {
          console.warn('⚠️  MongoDB Warning:', data.warning)
          createNewChat()
          return
        }
        
                 if (data.success && data.data) {
           const chats = data.data.map(chat => ({
             id: chat.chatId,
             title: chat.title,
             messageCount: chat.messageCount,
             lastMessage: chat.lastMessage,
             timestamp: new Date(chat.updatedAt || chat.createdAt || new Date()),
             lastActivity: new Date(chat.updatedAt || chat.createdAt || new Date()),
             createdAt: new Date(chat.createdAt || chat.updatedAt || new Date())
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
          const deduplicatedMessages = removeDuplicateMessages(messages)
          console.log('Loaded messages:', deduplicatedMessages.length, 'messages')
          const finalMessages = deduplicatedMessages.length > 0 ? deduplicatedMessages : [getWelcomeMessage()]
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
          
          console.log('✅ Chat history updated with latest data')
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
            
            // Update the current chat ID to the MongoDB ID
            setCurrentChatId(newChatId)
            
            console.log('✅ Chat history updated with MongoDB ID:', newChatId)
            
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
         timestamp: new Date(),
         lastActivity: new Date(),
         createdAt: new Date()
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
         timestamp: new Date(),
         lastActivity: new Date(),
         createdAt: new Date()
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
            const deduplicatedMessages = removeDuplicateMessages(formattedMessages)
            setCurrentMessages(deduplicatedMessages.length > 0 ? deduplicatedMessages : [getWelcomeMessage()])
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
           ? { 
               ...chat, 
               title,
               lastActivity: new Date(),
               timestamp: new Date()
             } 
           : chat
       )
     )
   }

  const sendMessage = async (message, attachedFiles = [], isEnhanceMode = false) => {
    if (!message.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString(),
      files: attachedFiles
    }

    // Check for duplicate messages before adding
    const isDuplicate = currentMessages.some(msg => 
      msg.content === userMessage.content && 
      msg.type === userMessage.type &&
      Math.abs(new Date(msg.timestamp) - new Date(userMessage.timestamp)) < 1000 // Within 1 second
    )
    
    if (isDuplicate) {
      console.log('Duplicate message detected, skipping...')
      return
    }

    const updatedMessages = [...currentMessages, userMessage]
    setCurrentMessages(updatedMessages)
    setIsLoading(true)

    // Update chat title for the first user message
    if (currentMessages.length === 1) {
      updateChatTitle(currentChatId, message.trim())
      console.log('Updated chat title for first message:', message.trim())
    }

    // Save user message immediately to ensure it's stored (only if not enhance mode)
    if (!isEnhanceMode) {
      if (isAuthenticated && token && currentChatId) {
        console.log('Saving user message immediately...')
        try {
          await saveCurrentChatToMongoDB()
          setLastSavedMessages([...updatedMessages])
        } catch (error) {
          console.error('Failed to save user message:', error)
        }
      } else if (!isAuthenticated && currentChatId) {
        console.log('Saving user message to localStorage...')
        localStorage.setItem(`chat_${currentChatId}`, JSON.stringify(updatedMessages))
      }
    }

    try {
      const startTime = Date.now()
      const response = await fetchGeminiResponse(message.trim(), attachedFiles)
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      // If this is enhance mode, return the response directly without adding to chat
      if (isEnhanceMode) {
        return response
      }
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response,
        timestamp: new Date().toISOString(),
        responseTime: responseTime
      }

      // Check for duplicate bot messages before adding
      const isBotDuplicate = updatedMessages.some(msg => 
        msg.content === botMessage.content && 
        msg.type === botMessage.type &&
        Math.abs(new Date(msg.timestamp) - new Date(botMessage.timestamp)) < 1000 // Within 1 second
      )
      
      if (isBotDuplicate) {
        console.log('Duplicate bot message detected, skipping...')
        return response
      }

      const finalMessages = [...updatedMessages, botMessage]
      setCurrentMessages(finalMessages)
      
      // Force save after bot response to ensure conversation is saved (only if not enhance mode)
      if (!isEnhanceMode) {
        if (isAuthenticated && token && currentChatId) {
          console.log('Force saving after bot response...')
          try {
            await saveCurrentChatToMongoDB()
            setLastSavedMessages([...finalMessages])
          } catch (error) {
            console.error('Failed to save bot response:', error)
          }
        } else if (!isAuthenticated && currentChatId) {
          console.log('Force saving to localStorage after bot response...')
          localStorage.setItem(`chat_${currentChatId}`, JSON.stringify(finalMessages))
        }
      }
      
      return response
    } catch (error) {
      // If this is enhance mode, return error message directly
      if (isEnhanceMode) {
        return "Sorry, I couldn't enhance your prompt right now. Please try again."
      }
      console.error('Error:', error)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "Our servers are currently experiencing high traffic. Please try again in a few minutes. Thank you for your patience!",
        timestamp: new Date().toISOString(),
        responseTime: null
      }
      const finalMessages = [...updatedMessages, errorMessage]
      setCurrentMessages(finalMessages)
      
      return errorMessage.content
    } finally {
      setIsLoading(false)
    }
  }

  const fetchGeminiResponse = async (message, attachedFiles = []) => {
    const creatorKeywords = ['who made you', 'who created you', 'who is your creator', 'who built you', 'who developed you']
    const isCreatorQuestion = creatorKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    )

    if (isCreatorQuestion) {
      return `${config.CREATOR_NAME} is my creator! I was built with love and care by ${config.CREATOR_NAME} using the Gupsup AI technology. How can I assist you today?`
    }

    // Check cache first (include files in cache key if present)
    const cacheKey = attachedFiles.length > 0 
      ? `${message.toLowerCase().trim()}-with-files-${attachedFiles.length}`
      : message.toLowerCase().trim()
    
    if (responseCache.has(cacheKey)) {
      console.log('Returning cached response for:', cacheKey)
      return responseCache.get(cacheKey)
    }



    const API_KEY = config.GEMINI_API_KEY
    
    if (API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      return "Please configure your Gupsup AI API key in the config.js file. Replace 'YOUR_GEMINI_API_KEY_HERE' with your actual API key from Google AI Studio."
    }

    // Prepare enhanced conversation context with memory management
    const currentUserMessage = {
      content: message,
      type: 'user',
      timestamp: new Date().toISOString()
    }
    
    console.log('🔄 Preparing conversation context with', currentMessages.length, 'current messages')
    const contextData = prepareConversationContext(currentMessages, currentUserMessage, memoryData)
    const conversationHistory = contextData.conversationHistory
    console.log('📨 Conversation history prepared:', {
      historyLength: conversationHistory.length,
      contextSize: contextData.contextSize,
      totalMessages: contextData.totalMessages,
      hasSummary: !!contextData.summary
    })
    
    // Update memory data if summary was created
    if (contextData.summary) {
      console.log('💾 Updating memory with new summary')
      const updatedMemory = updateMemoryData(memoryData, currentMessages, contextData.summary)
      setMemoryData(updatedMemory)
      saveMemoryToStorage(updatedMemory)
      setMemoryStats(getMemoryStats(updatedMemory))
    }

    // Prepare current message parts
    const currentMessageParts = [{ text: message }]
    
    // Add file data if present
    if (attachedFiles.length > 0) {
      attachedFiles.forEach(file => {
        if (file.dataUrl) {
          if (file.type.startsWith('image/')) {
            // Handle images
            currentMessageParts.push({
              inlineData: {
                mimeType: file.type,
                data: file.dataUrl.split(',')[1]
              }
            })
          } else if (file.type === 'text/plain' || file.type === 'application/pdf') {
            // Handle text files and PDFs
            currentMessageParts.push({
              inlineData: {
                mimeType: file.type,
                data: file.dataUrl.split(',')[1]
              }
            })
          }
        }
      })
    }

    // Add current message
    conversationHistory.push({
      role: 'user',
      parts: currentMessageParts
    })
    
    console.log('🚀 Sending to API:', {
      conversationHistoryLength: conversationHistory.length,
      hasFiles: attachedFiles.length > 0,
      messagePreview: message.substring(0, 50) + '...'
    })

    // Enhanced system prompt with memory awareness
    let systemPrompt = `You are NIVII, a helpful AI assistant with enhanced memory capabilities. You can remember previous conversations and provide contextual responses.

When answering questions:
1. Format code using proper markdown code blocks with language specification (e.g., \`\`\`javascript, \`\`\`python, etc.)
2. Provide clear explanations before and after code examples
3. Use conversation history to provide contextual and relevant responses
4. Reference previous topics when relevant to show continuity
5. Always end your response with a follow-up question to encourage further discussion

Memory Guidelines:
- Reference previous conversations when relevant
- Build upon previously discussed topics
- Maintain context across the conversation
- Acknowledge when you're building on previous information

Examples of good follow-up questions:
- "Would you like me to explain any specific part of this code?"
- "Do you need help implementing this in a different programming language?"
- "Are there any specific use cases you'd like to explore?"
- "Would you like to see more advanced examples of this concept?"
- "Do you have any questions about how this works?"
- "Would you like to continue with the previous topic we discussed?"

Remember to be conversational, helpful, and contextually aware!`

    // Add memory context to system prompt if available
    if (contextData.summary && contextData.summary.relevantSummaries) {
      systemPrompt += `\n\nRelevant Previous Context:\n`
      contextData.summary.relevantSummaries.forEach((summary, index) => {
        systemPrompt += `Previous Session ${index + 1}: Topics discussed - ${summary.topics.join(', ')}\n`
      })
    }

    // Retry logic with exponential backoff
    const maxRetries = 3
    let lastError

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 15000) // 15 second timeout
        })

        // Create the fetch promise with conversation history
        const fetchPromise = fetch(`${config.API_BASE_URL}/models/${config.MODEL}:generateContent?key=${API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: conversationHistory,
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            },
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            }
          })
        })

        // Race between fetch and timeout
        const response = await Promise.race([fetchPromise, timeoutPromise])

        if (response.ok) {
          const data = await response.json()
          if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
            let responseText = data.candidates[0].content.parts[0].text
            
            // Replace Google/Gemini references with NIVII
            responseText = responseText
              .replace(/Google/gi, 'NIVII')
              .replace(/Gemini/gi, 'NIVII')
              .replace(/Google AI/gi, 'NIVII AI')
              .replace(/Google's/gi, "NIVII's")
              .replace(/Google Assistant/gi, 'NIVII Assistant')
              .replace(/Google Bard/gi, 'NIVII')
              .replace(/Bard/gi, 'NIVII')
              .replace(/Google's AI/gi, "NIVII's AI")
              .replace(/Google AI Studio/gi, 'NIVII AI Studio')
              .replace(/Google Cloud/gi, 'NIVII Cloud')
              .replace(/Google Workspace/gi, 'NIVII Workspace')
              .replace(/Google Search/gi, 'NIVII Search')
              .replace(/Google Translate/gi, 'NIVII Translate')
              .replace(/Google Maps/gi, 'NIVII Maps')
              .replace(/Google Drive/gi, 'NIVII Drive')
              .replace(/Google Photos/gi, 'NIVII Photos')
              .replace(/Google Docs/gi, 'NIVII Docs')
              .replace(/Google Sheets/gi, 'NIVII Sheets')
              .replace(/Google Slides/gi, 'NIVII Slides')
              .replace(/Google Meet/gi, 'NIVII Meet')
              .replace(/Google Calendar/gi, 'NIVII Calendar')
              .replace(/Google Gmail/gi, 'NIVII Gmail')
              .replace(/Google Chrome/gi, 'NIVII Chrome')
              .replace(/Google Play/gi, 'NIVII Play')
            
            // Ensure code formatting is properly applied
            responseText = responseText.replace(/```(\w+)?\n/g, '```$1\n')
            
            // If response doesn't end with a follow-up question, add one
            if (!responseText.includes('?') || !responseText.toLowerCase().includes('would you like') && !responseText.toLowerCase().includes('do you') && !responseText.toLowerCase().includes('any questions')) {
              const followUpQuestions = [
                "\n\nWould you like me to explain any part of this in more detail?",
                "\n\nDo you have any questions about this approach?",
                "\n\nWould you like to see more examples or explore related concepts?",
                "\n\nIs there anything specific you'd like me to clarify?",
                "\n\nWould you like help with implementing this or any variations?"
              ]
              responseText += followUpQuestions[Math.floor(Math.random() * followUpQuestions.length)]
            }
            
            // Cache successful responses (limit cache size to 100 entries)
            setResponseCache(prev => {
              const newCache = new Map(prev)
              if (newCache.size >= 100) {
                // Remove oldest entries if cache is full
                const firstKey = newCache.keys().next().value
                newCache.delete(firstKey)
              }
              newCache.set(cacheKey, responseText)
              return newCache
            })
            return responseText
          } else {
            throw new Error('Invalid response format from API')
          }
        } else {
          // Handle specific HTTP status codes
          if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please wait a moment and try again.')
          } else if (response.status === 403) {
            throw new Error('API key is invalid or has insufficient permissions.')
          } else if (response.status >= 500) {
            throw new Error('Server error. Please try again later.')
          } else {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
        }
      } catch (error) {
        lastError = error
        console.error(`API attempt ${attempt} failed:`, error.message)
        
        // If this is the last attempt, throw the error
        if (attempt === maxRetries) {
          break
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000 // 2s, 4s, 8s
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    // If all retries failed, return a user-friendly error message
    if (lastError.message.includes('Rate limit')) {
      return "I'm currently experiencing high traffic. Please wait a moment and try again. Thank you for your patience!"
    } else if (lastError.message.includes('API key')) {
      return "There's an issue with the API configuration. Please contact support if this persists."
    } else if (lastError.message.includes('Server error')) {
      return "Our servers are temporarily unavailable. Please try again in a few minutes."
    } else if (lastError.message.includes('Request timeout')) {
      return "The request is taking longer than expected. Please try again in a moment."
    } else if (lastError.message.includes('Network') || lastError.message.includes('fetch')) {
      return "Network connection issue. Please check your internet connection and try again."
    } else {
      return "I'm having trouble processing your request right now. Please try again in a moment."
    }
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

  // New feature handlers
  const handleMessageReaction = (messageId, reactionType) => {
    console.log('App: handleMessageReaction called with:', messageId, reactionType)
    setMessageReactions(prev => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        [reactionType]: (prev[messageId]?.[reactionType] || 0) + 1
      }
    }))
    
    analyticsUtils.trackUserBehavior('message_reaction', {
      messageId,
      reactionType
    })
  }

  const handleMessageBookmark = (messageId, isBookmarked) => {
    console.log('App: handleMessageBookmark called with:', messageId, isBookmarked)
    if (isBookmarked) {
      const message = currentMessages.find(m => m.id === messageId)
      if (message) {
        setBookmarkedMessages(prev => [...prev, { ...message, bookmarkedAt: new Date().toISOString() }])
      }
    } else {
      setBookmarkedMessages(prev => prev.filter(m => m.id !== messageId))
    }
    
    analyticsUtils.trackUserBehavior('message_bookmark', {
      messageId,
      isBookmarked
    })
  }

  const handleMessageReply = (message) => {
    console.log('App: handleMessageReply called with:', message.id)
    setReplyToMessage(message)
    // Focus on input field to start typing reply
    const inputElement = document.querySelector('textarea[placeholder*="message"]')
    if (inputElement) {
      inputElement.focus()
    }
    
    analyticsUtils.trackUserBehavior('message_reply', {
      messageId: message.id
    })
  }

  const handleMessageLike = (messageId, isLiked) => {
    console.log('App: handleMessageLike called with:', messageId, isLiked)
    setMessageLikes(prev => ({
      ...prev,
      [messageId]: isLiked
    }))
    
    // Remove dislike if liking
    if (isLiked) {
      setMessageDislikes(prev => ({
        ...prev,
        [messageId]: false
      }))
    }
    
    analyticsUtils.trackUserBehavior('message_like', {
      messageId,
      isLiked
    })
  }

  const handleMessageDislike = (messageId, isDisliked) => {
    console.log('App: handleMessageDislike called with:', messageId, isDisliked)
    setMessageDislikes(prev => ({
      ...prev,
      [messageId]: isDisliked
    }))
    
    // Remove like if disliking
    if (isDisliked) {
      setMessageLikes(prev => ({
        ...prev,
        [messageId]: false
      }))
    }
    
    analyticsUtils.trackUserBehavior('message_dislike', {
      messageId,
      isDisliked
    })
  }

  const handleRegenerateAnswer = async (messageId) => {
    console.log('App: handleRegenerateAnswer called with:', messageId)
    
    // Find the message to regenerate
    const messageIndex = currentMessages.findIndex(m => m.id === messageId)
    if (messageIndex === -1) return
    
    // Find the user message that prompted this response
    const userMessageIndex = messageIndex - 1
    if (userMessageIndex < 0) return
    
    const userMessage = currentMessages[userMessageIndex]
    if (userMessage.type !== 'user') return
    
    // Remove the current bot response
    const updatedMessages = currentMessages.slice(0, messageIndex)
    setCurrentMessages(updatedMessages)
    
    // Regenerate the response by calling the AI API directly
    try {
      const startTime = Date.now()
      const response = await fetchGeminiResponse(userMessage.content, userMessage.files || [])
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      // Add the new response with response time
      const newBotMessage = {
        id: Date.now(),
        type: 'bot',
        content: response,
        timestamp: new Date().toISOString(),
        responseTime: responseTime
      }
      
      const finalMessages = [...updatedMessages, newBotMessage]
      setCurrentMessages(finalMessages)
      
      // Save the updated chat
      if (isAuthenticated && token && currentChatId) {
        try {
          await saveCurrentChatToMongoDB()
          setLastSavedMessages([...finalMessages])
        } catch (error) {
          console.error('Failed to save regenerated response:', error)
        }
      } else if (!isAuthenticated && currentChatId) {
        localStorage.setItem(`chat_${currentChatId}`, JSON.stringify(finalMessages))
      }
      
      analyticsUtils.trackUserBehavior('message_regenerate', {
        messageId,
        responseTime
      })
    } catch (error) {
      console.error('Failed to regenerate answer:', error)
      // Restore the original message if regeneration fails
      setCurrentMessages(currentMessages)
    }
  }

  const handleExportChat = () => {
    setShowExportModal(true)
    analyticsUtils.trackUserBehavior('export_chat', {
      chatId: currentChatId,
      messageCount: currentMessages.length
    })
  }

  const handleShowAnalytics = () => {
    setShowAnalyticsModal(true)
    analyticsUtils.trackUserBehavior('view_analytics', {
      chatId: currentChatId
    })
  }

  const handleSearchMessages = () => {
    setShowSearchModal(true)
    analyticsUtils.trackUserBehavior('search_messages', {
      chatId: currentChatId
    })
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
      <div className="h-screen overflow-hidden relative" style={{ backgroundColor: 'var(--color-background)' }}>
        {/* Premium Animated Background Effects */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Floating gradient orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-brand-500/10 to-accent-purple/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-accent-purple/8 to-accent-cyan/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-accent-cyan/6 to-brand-500/6 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
          
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(124,58,237,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(124,58,237,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
          
          {/* Radial gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(124,58,237,0.05),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(59,130,246,0.04),transparent_50%)]" />
          
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-accent-purple/5 animate-gradient-xy opacity-30" />
        </div>

        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
          chatHistory={chatHistory}
          onSelectChat={selectChat}
          onNewChat={createNewChat}
          onDeleteChat={deleteChat}
          currentChatId={currentChatId}
          onSearchMessages={handleSearchMessages}
          onShowAnalytics={handleShowAnalytics}
          onExportChat={handleExportChat}
          onLogout={handleLogout}
          user={user}
        />
        
        <ChatArea
          messages={currentMessages}
          onSendMessage={sendMessage}
          isLoading={isLoading}
          isSidebarOpen={isSidebarOpen}
          currentChatTitle={getCurrentChatTitle()}
          onToggleSidebar={toggleSidebar}
          user={user}
          onMessageReaction={handleMessageReaction}
          onMessageBookmark={handleMessageBookmark}
          onMessageReply={handleMessageReply}
          onMessageLike={handleMessageLike}
          onMessageDislike={handleMessageDislike}
          onRegenerateAnswer={handleRegenerateAnswer}
          memoryStats={memoryStats}
        />

        {/* Modals */}
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          messages={currentMessages}
          chatTitle={getCurrentChatTitle()}
          chatId={currentChatId}
        />

        <AnalyticsModal
          isOpen={showAnalyticsModal}
          onClose={() => setShowAnalyticsModal(false)}
          messages={currentMessages}
          chatHistory={chatHistory}
        />

        <SearchModal
          isOpen={showSearchModal}
          onClose={() => setShowSearchModal(false)}
          messages={currentMessages}
          chatHistory={chatHistory}
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
