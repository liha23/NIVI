import React, { useState, useRef, useEffect } from 'react'
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Mic, 
  MicOff, 
  Volume2, 
  Phone, 
  LogOut, 
  Paperclip, 
  FileText, 
  Image,
  File,
  X,
  Wand2, 
  Search, 
  BarChart3, 
  Download, 
  Zap, 
  Settings,
  Maximize2,
  Minimize2,
  MoreVertical,
  Star
} from 'lucide-react'
import ChatMessage from './ChatMessage'
import TypingIndicator from './TypingIndicator'
import { useTheme } from '../contexts/ThemeContext'
import VoiceMode from './VoiceMode'
import FileUploadModal from './FileUploadModal'

const ChatArea = ({ 
  messages, 
  onSendMessage, 
  isLoading, 
  isSidebarOpen,
  currentChatTitle,
  onToggleSidebar,
  user,
  onLogout,
  onExportChat,
  onShowAnalytics,
  onSearchMessages,
  onMessageReaction,
  onMessageBookmark,
  onMessageReply,
  onMessageLike,
  onMessageDislike,
  onRegenerateAnswer
}) => {
  const { currentTheme, getCurrentThemeData } = useTheme()
  const [inputMessage, setInputMessage] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isVoiceModeOpen, setIsVoiceModeOpen] = useState(false)
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState([])
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)
  const textareaRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [inputMessage])

  // Stop all speech when component unmounts or when switching chats
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const handleSendMessage = () => {
    if (!inputMessage.trim() || isLoading) return
    console.log('Sending message with attached files:', attachedFiles)
    onSendMessage(inputMessage.trim(), attachedFiles)
    setInputMessage('')
    setAttachedFiles([])
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleVoiceMessage = async (message) => {
    if (!message.trim() || isLoading) return
    return await onSendMessage(message.trim())
  }

  const handleFileUpload = (files) => {
    console.log('Files uploaded:', files)
    console.log('Current attached files before:', attachedFiles)
    setAttachedFiles(prev => {
      const newFiles = [...prev, ...files]
      console.log('New attached files:', newFiles)
      return newFiles
    })
    setIsFileUploadOpen(false)
  }

  const removeAttachedFile = (fileId) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId))
  }

  const getFileIcon = (file) => {
    if (!file || !file.type) {
      return <File size={16} className="text-neutral-400" />
    }
    
    if (file.type.startsWith('image/')) {
      return <Image size={16} className="text-blue-400" />
    } else if (file.type === 'application/pdf') {
      return <FileText size={16} className="text-red-400" />
    } else if (file.type.includes('document') || file.type === 'text/plain') {
      return <FileText size={16} className="text-green-400" />
    } else {
      return <File size={16} className="text-neutral-400" />
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const enhancePrompt = async () => {
    if (!inputMessage.trim() || isEnhancing) return
    
    setIsEnhancing(true)
    try {
      const enhancementRequest = `Please enhance this prompt to make it more detailed, clear, and effective. Return only the enhanced prompt without any explanations or additional text: "${inputMessage.trim()}"`
      const enhancedPrompt = await onSendMessage(enhancementRequest, [], true)
      
      if (enhancedPrompt && enhancedPrompt.trim()) {
        setInputMessage(enhancedPrompt.trim())
      }
    } catch (error) {
      console.error('Failed to enhance prompt:', error)
    } finally {
      setIsEnhancing(false)
    }
  }

  const setupVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = 'en-US'

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInputMessage(transcript)
    }

    recognitionRef.current.onend = () => {
      setIsListening(false)
      setIsRecording(false)
    }

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      setIsRecording(false)
    }
  }

  useEffect(() => {
    setupVoiceRecognition()
  }, [])

  const toggleVoiceRecognition = () => {
    if (!recognitionRef.current) {
      setupVoiceRecognition()
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      setIsRecording(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
      setIsRecording(true)
    }
  }

  const themeData = getCurrentThemeData()

  return (
    <div className={`flex flex-col h-screen transition-all duration-300 relative ${
      isSidebarOpen ? 'ml-0 md:ml-80' : 'ml-0'
    }`}>
      
      {/* Modern Header */}
      <header className="relative bg-neutral-900/95 backdrop-blur-xl border-b border-neutral-800/50 px-6 py-4 flex-shrink-0">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-500/5 to-transparent opacity-50" />
        
        <div className="relative flex items-center justify-between">
          {/* Left Side - Sidebar Toggle & Status */}
          <div className="flex items-center gap-4">
            {/* Sidebar Toggle Button - Always visible and prominent */}
            <button
              onClick={onToggleSidebar}
              className="p-2.5 rounded-xl bg-gradient-to-r from-brand-500/20 to-accent-purple/20 hover:from-brand-500/30 hover:to-accent-purple/30 text-brand-400 hover:text-brand-300 transition-all duration-200 backdrop-blur-sm border border-brand-500/30 hover:border-brand-500/50 shadow-glow"
              title="Toggle sidebar"
            >
              <ChevronRight size={18} className={`transition-transform duration-200 ${isSidebarOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-neutral-800/30 rounded-lg border border-neutral-700/50">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-neutral-400">Online</span>
            </div>
          </div>
          
          {/* Center - Chat Title */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-accent-purple rounded-xl flex items-center justify-center shadow-glow">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-lg font-bold text-gradient-primary">NIVII AI</h1>
              {currentChatTitle && (
                <p className="text-xs text-neutral-400 truncate max-w-48">
                  {currentChatTitle}
                </p>
              )}
            </div>
          </div>
          
          {/* Right Side - Actions & User */}
          <div className="flex items-center gap-2">
            {/* Quick Actions */}
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={onSearchMessages}
                className="p-2 rounded-lg bg-neutral-800/50 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-100 transition-all duration-200 backdrop-blur-sm"
                title="Search messages (Ctrl+F)"
              >
                <Search size={16} />
              </button>
              
              <button
                onClick={onShowAnalytics}
                className="p-2 rounded-lg bg-neutral-800/50 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-100 transition-all duration-200 backdrop-blur-sm"
                title="Analytics"
              >
                <BarChart3 size={16} />
              </button>
              
              <button
                onClick={onExportChat}
                className="p-2 rounded-lg bg-neutral-800/50 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-100 transition-all duration-200 backdrop-blur-sm"
                title="Export chat"
              >
                <Download size={16} />
              </button>

              {/* Debug: Inspect JWT Button */}
              <button
                onClick={() => {
                  if (window.inspectJWTToken) {
                    window.inspectJWTToken()
                  } else {
                    console.log('JWT Inspector not available')
                  }
                }}
                className="p-2 rounded-lg bg-blue-800/50 hover:bg-blue-700 text-blue-400 hover:text-blue-100 transition-all duration-200 backdrop-blur-sm"
                title="Inspect JWT token (Debug)"
              >
                <Settings size={16} />
              </button>

              {/* Debug: Clear Auth Button */}
              <button
                onClick={() => {
                  localStorage.removeItem('token')
                  localStorage.removeItem('user')
                  window.location.reload()
                }}
                className="p-2 rounded-lg bg-red-800/50 hover:bg-red-700 text-red-400 hover:text-red-100 transition-all duration-200 backdrop-blur-sm"
                title="Clear auth data (Debug)"
              >
                <LogOut size={16} />
              </button>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-2 ml-2">
              {user && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800/30 rounded-lg border border-neutral-700/50">
                  <div className="w-6 h-6 bg-gradient-to-br from-brand-500 to-accent-purple rounded-lg flex items-center justify-center text-white text-xs font-bold">
                    {user.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm text-neutral-200 hidden sm:block">
                    {user.username}
                  </span>
                </div>
              )}
              
              <button
                onClick={onLogout}
                className="p-2 rounded-lg bg-neutral-800/50 hover:bg-error-500/20 text-neutral-400 hover:text-error-400 transition-all duration-200 backdrop-blur-sm"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-neutral-950 to-neutral-900">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-brand-500 to-accent-purple rounded-3xl flex items-center justify-center shadow-glow-lg animate-float">
                  <Zap className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent-emerald rounded-full border-4 border-neutral-900 animate-bounce-subtle" />
              </div>
              
              <h2 className="text-2xl font-bold text-gradient-primary mb-3">
                Welcome to NIVII AI
              </h2>
              <p className="text-neutral-400 text-lg mb-8 max-w-md">
                Your intelligent assistant is ready to help. Start a conversation by typing a message below.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                {[
                  { icon: Sparkles, title: "Creative Writing", desc: "Help with stories, poems, and content" },
                  { icon: Search, title: "Research & Analysis", desc: "Deep insights and information gathering" },
                  { icon: Bot, title: "Problem Solving", desc: "Step-by-step solutions and guidance" },
                  { icon: Star, title: "Learning Support", desc: "Explanations and educational content" }
                ].map(({ icon: Icon, title, desc }, index) => (
                  <div
                    key={index}
                    className="p-4 bg-neutral-800/30 border border-neutral-700/50 rounded-xl hover:border-brand-500/30 hover:bg-neutral-800/50 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-500/20 to-accent-purple/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <Icon className="w-4 h-4 text-brand-400" />
                      </div>
                      <h3 className="font-medium text-neutral-200">{title}</h3>
                    </div>
                    <p className="text-sm text-neutral-500">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id || index}
                  message={message}
                  onReaction={onMessageReaction}
                  onBookmark={onMessageBookmark}
                  onReply={onMessageReply}
                  onLike={onMessageLike}
                  onDislike={onMessageDislike}
                  onRegenerate={message.isBot ? onRegenerateAnswer : undefined}
                />
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-2xl p-4 max-w-xs backdrop-blur-sm">
                    <TypingIndicator />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Modern Input Area */}
      <div className="flex-shrink-0 bg-neutral-900/95 backdrop-blur-xl border-t border-neutral-800/50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Attached Files */}
          {attachedFiles.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-neutral-400 mb-2 font-medium">
                Attached Files ({attachedFiles.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {attachedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-2 px-3 py-2 bg-neutral-800/50 border border-neutral-700/50 rounded-lg hover:bg-neutral-700/50 transition-colors"
                  >
                    {file.preview ? (
                      <img 
                        src={file.preview} 
                        alt={file.name}
                        className="w-4 h-4 rounded object-cover"
                      />
                    ) : (
                      getFileIcon(file)
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm text-neutral-300 truncate max-w-32">
                        {file.name}
                      </span>
                      {file.size && (
                        <span className="text-xs text-neutral-500">
                          {formatFileSize(file.size)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeAttachedFile(file.id)}
                      className="text-neutral-400 hover:text-error-400 transition-colors ml-1"
                      title="Remove file"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input Container */}
          <div className="relative">
            <div className="flex items-end gap-3 p-3 bg-neutral-800/50 border border-neutral-700/50 rounded-2xl focus-within:border-brand-500/50 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all duration-200 backdrop-blur-sm">
              {/* Attachment Button */}
              <button
                onClick={() => setIsFileUploadOpen(true)}
                className="flex-shrink-0 p-2 rounded-xl bg-neutral-700/50 hover:bg-neutral-600 text-neutral-400 hover:text-neutral-100 transition-all duration-200"
                title="Attach files"
              >
                <Paperclip size={18} />
              </button>

              {/* Text Input */}
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask NIVII anything..."
                  className="w-full bg-transparent text-neutral-100 placeholder-neutral-400 resize-none outline-none min-h-[24px] max-h-[200px] py-1"
                  rows={1}
                  disabled={isLoading}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Enhance Button */}
                <button
                  onClick={enhancePrompt}
                  disabled={!inputMessage.trim() || isEnhancing || isLoading}
                  className="flex-shrink-0 p-2 rounded-xl bg-neutral-700/50 hover:bg-neutral-600 text-neutral-400 hover:text-brand-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Enhance prompt with AI"
                >
                  <Wand2 size={18} className={isEnhancing ? 'animate-spin' : ''} />
                </button>

                {/* Voice Input Button */}
                <button
                  onClick={toggleVoiceRecognition}
                  className={`flex-shrink-0 p-2 rounded-xl transition-all duration-200 ${
                    isRecording
                      ? 'bg-error-500/20 text-error-400 hover:bg-error-500/30'
                      : 'bg-neutral-700/50 hover:bg-neutral-600 text-neutral-400 hover:text-brand-400'
                  }`}
                  title={isRecording ? 'Stop recording' : 'Start voice input'}
                >
                  {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                {/* Send Button */}
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="flex-shrink-0 p-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-neutral-600 disabled:to-neutral-600 shadow-medium hover:shadow-strong hover:scale-105"
                  title="Send message (Enter)"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>

            {/* Character Counter */}
            <div className="flex justify-between items-center mt-2 px-2">
              <div className="text-xs text-neutral-500">
                {inputMessage.length > 0 && (
                  <span className={inputMessage.length > 1000 ? 'text-warning-400' : ''}>
                    {inputMessage.length}/1000
                  </span>
                )}
              </div>
              
              <div className="text-xs text-neutral-500">
                Press <kbd className="px-1 py-0.5 bg-neutral-700 rounded text-neutral-300">Enter</kbd> to send, 
                <kbd className="px-1 py-0.5 bg-neutral-700 rounded text-neutral-300 ml-1">Shift+Enter</kbd> for new line
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isVoiceModeOpen && (
        <VoiceMode
          onClose={() => setIsVoiceModeOpen(false)}
          onSendMessage={handleVoiceMessage}
          isLoading={isLoading}
        />
      )}

      {isFileUploadOpen && (
        <FileUploadModal
          isOpen={isFileUploadOpen}
          onClose={() => setIsFileUploadOpen(false)}
          onFileUpload={handleFileUpload}
        />
      )}
    </div>
  )
}

export default ChatArea
