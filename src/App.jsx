import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Trash2, Sparkles } from 'lucide-react'
import ChatMessage from './components/ChatMessage'
import TypingIndicator from './components/TypingIndicator'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import { config } from '../config.js'
import { cookieUtils } from './utils/cookies.js'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [currentChatId, setCurrentChatId] = useState(null)
  const [currentMessages, setCurrentMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Load initial state from cookies
  useEffect(() => {
    const savedSidebarState = cookieUtils.loadSidebarState()
    const savedChatHistory = cookieUtils.loadChatHistory()
    
    setIsSidebarOpen(savedSidebarState)
    setChatHistory(savedChatHistory)
    
    // If there's chat history, select the most recent chat
    if (savedChatHistory.length > 0) {
      const mostRecentChat = savedChatHistory[0]
      setCurrentChatId(mostRecentChat.id)
      const savedMessages = cookieUtils.loadCurrentChat(mostRecentChat.id)
      setCurrentMessages(savedMessages.length > 0 ? savedMessages : [
        {
          id: Date.now(),
          type: 'bot',
          content: "Hello! I'm your AI assistant powered by Nivi. How can I help you today?",
          timestamp: new Date()
        }
      ])
    } else {
      // Create initial chat
      createNewChat()
    }
  }, [])

  // Save sidebar state when it changes
  useEffect(() => {
    cookieUtils.saveSidebarState(isSidebarOpen)
  }, [isSidebarOpen])

  // Save chat history when it changes
  useEffect(() => {
    cookieUtils.saveChatHistory(chatHistory)
  }, [chatHistory])

  // Save current chat messages when they change
  useEffect(() => {
    if (currentChatId) {
      cookieUtils.saveCurrentChat(currentChatId, currentMessages)
    }
  }, [currentMessages, currentChatId])

  const createNewChat = () => {
    const newChatId = Date.now()
    const newChat = {
      id: newChatId,
      title: 'New Chat',
      timestamp: new Date()
    }
    
    setChatHistory(prev => [newChat, ...prev])
    setCurrentChatId(newChatId)
    setCurrentMessages([
      {
        id: Date.now(),
        type: 'bot',
        content: "Hello! I'm your AI assistant powered by Nivi. How can I help you today?",
        timestamp: new Date()
      }
    ])
  }

  const selectChat = (chatId) => {
    setCurrentChatId(chatId)
    const savedMessages = cookieUtils.loadCurrentChat(chatId)
    setCurrentMessages(savedMessages.length > 0 ? savedMessages : [
      {
        id: Date.now(),
        type: 'bot',
        content: "Hello! I'm your AI assistant powered by Nivi. How can I help you today?",
        timestamp: new Date()
      }
    ])
  }

  const deleteChat = (chatId) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId))
    
    // Remove the chat from current chats cookie
    const currentChats = cookieUtils.getCookie('ai_current_chats') || {}
    delete currentChats[chatId]
    cookieUtils.setCookie('ai_current_chats', currentChats, 30)
    
    // If we're deleting the current chat, create a new one
    if (currentChatId === chatId) {
      createNewChat()
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
      timestamp: new Date()
    }

    const updatedMessages = [...currentMessages, userMessage]
    setCurrentMessages(updatedMessages)
    setIsLoading(true)

    // Update chat title with first user message if it's a new chat
    if (currentMessages.length === 1) {
      updateChatTitle(currentChatId, message.trim())
    }

    try {
      const response = await fetchGeminiResponse(message.trim())
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response,
        timestamp: new Date()
      }

      setCurrentMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm sorry, I encountered an error. Please try again or check your API key configuration.",
        timestamp: new Date()
      }
      setCurrentMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchGeminiResponse = async (message) => {
    // Check for creator questions
    const creatorKeywords = ['who made you', 'who created you', 'who is your creator', 'who built you', 'who developed you']
    const isCreatorQuestion = creatorKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    )

    if (isCreatorQuestion) {
      return `${config.CREATOR_NAME} is my creator! I was built with love and care by ${config.CREATOR_NAME} using the Gemini API. How can I assist you today?`
    }

    // Get API key from config
    const API_KEY = config.GEMINI_API_KEY
    
    if (API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      return "Please configure your Gemini API key in the config.js file. Replace 'YOUR_GEMINI_API_KEY_HERE' with your actual API key from Google AI Studio."
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

  // Make toggleSidebar available globally for mobile header
  useEffect(() => {
    window.toggleSidebar = toggleSidebar
    return () => {
      delete window.toggleSidebar
    }
  }, [isSidebarOpen])

  const getCurrentChatTitle = () => {
    const currentChat = chatHistory.find(chat => chat.id === currentChatId)
    return currentChat?.title || 'New Chat'
  }

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
        />
      </div>
    </ThemeProvider>
  )
}

export default App
