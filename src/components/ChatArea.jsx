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
  Zap, 
  Settings,
  Maximize2,
  Minimize2,
  MoreVertical,
  Star,
  Share2
} from 'lucide-react'
import ChatMessage from './ChatMessage'
import TypingIndicator from './TypingIndicator'
import QuickPrompts from './QuickPrompts'
import { useTheme } from '../contexts/ThemeContext'
import VoiceMode from './VoiceMode'
import FileUploadModal from './FileUploadModal'
import { exportUtils } from '../utils/exportUtils'

const ChatArea = ({ 
  messages, 
  onSendMessage, 
  isLoading, 
  isSidebarOpen,
  currentChatTitle,
  currentChatId,
  onToggleSidebar,
  user,
  onMessageReaction,
  onMessageBookmark,
  onMessageReply,
  onMessageLike,
  onMessageDislike,
  onRegenerateAnswer,
  memoryStats,
  onShowAuth,
  isAuthenticated
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
  const [showShareCopied, setShowShareCopied] = useState(false)
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
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleShareChat = async () => {
    if (!currentChatId) return
    
    try {
      const shareLink = exportUtils.generateShareLink(currentChatId, messages)
      await exportUtils.copyToClipboard(shareLink)
      setShowShareCopied(true)
      setTimeout(() => setShowShareCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy share link:', error)
    }
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
      
      {/* Premium Header with Glassmorphism */}
      <header className="relative backdrop-blur-2xl px-6 py-4 flex-shrink-0 shadow-medium" style={{ 
        background: `linear-gradient(to bottom right, var(--color-surface), var(--color-surface))`,
        borderBottom: `1px solid var(--color-border)`
      }}>
        {/* Animated Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 via-accent-purple/5 to-brand-500/5 opacity-50 animate-gradient-x" />
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative flex items-center justify-between">
          {/* Left Side - Sidebar Toggle & Status */}
          <div className="flex items-center gap-3">
            {/* Premium Sidebar Toggle Button */}
            <button
              onClick={onToggleSidebar}
              className="relative p-2.5 rounded-xl bg-gradient-to-br from-brand-500/20 via-accent-purple/15 to-brand-600/20 hover:from-brand-500/30 hover:via-accent-purple/25 hover:to-brand-600/30 text-brand-400 hover:text-brand-300 transition-all duration-300 backdrop-blur-sm border border-brand-500/40 hover:border-brand-500/60 shadow-glow hover:shadow-glow-hover hover:scale-105 active:scale-95 overflow-hidden group"
              title="Toggle sidebar"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <ChevronRight size={18} className={`relative z-10 transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Premium Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 backdrop-blur-sm rounded-xl" style={{
              background: `linear-gradient(to bottom right, var(--color-surface-hover), var(--color-surface))`,
              border: `1px solid var(--color-border)`
            }}>
              <div className="relative">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="text-xs font-medium bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">Online</span>
            </div>
            
            {/* Premium Memory Indicator */}
            {memoryStats && memoryStats.totalSummaries > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-br from-brand-500/10 to-accent-purple/10 backdrop-blur-sm rounded-xl border border-brand-500/30">
                <Star size={14} className="text-brand-400" />
                <span className="text-xs font-medium text-brand-400">
                  {memoryStats.totalSummaries} memories
                </span>
              </div>
            )}
          </div>
          
          {/* Center - Premium Logo & Chat Title */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3">
            <div className="relative group">
              {/* Logo glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-br from-brand-500 via-accent-purple to-brand-600 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-soft"></div>
              
              {/* Premium Logo */}
              <div className="relative w-10 h-10 bg-gradient-to-br from-brand-500 via-accent-purple to-brand-600 rounded-xl flex items-center justify-center shadow-glow-accent overflow-hidden">
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <Sparkles className="w-5 h-5 text-white relative z-10" />
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-lg font-bold bg-gradient-to-r from-brand-400 via-accent-purple to-accent-cyan bg-clip-text text-transparent">
                NIVII AI
              </h1>
              {currentChatTitle && (
                <p className="text-xs truncate max-w-48" style={{ color: 'var(--color-text-secondary)' }}>
                  {currentChatTitle}
                </p>
              )}
            </div>
          </div>
          
          {/* Right Side - Premium User Info or Login Button */}
          <div className="flex items-center gap-2">
            {/* Share Button */}
            <button
              onClick={handleShareChat}
              disabled={!currentChatId}
              className="relative p-2 rounded-xl bg-gradient-to-br from-brand-500/10 to-accent-purple/10 hover:from-brand-500/20 hover:to-accent-purple/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
              style={{ border: `1px solid var(--color-border)` }}
              title="Share chat"
            >
              <Share2 size={18} style={{ color: 'var(--color-text)' }} />
              {showShareCopied && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-green-500 text-white text-xs rounded whitespace-nowrap">
                  Link copied!
                </div>
              )}
            </button>
            
            {/* User Info if authenticated (but not for guest users) */}
            {isAuthenticated && !user?.isGuest ? (
              <div className="flex items-center gap-2 px-3 py-1.5 backdrop-blur-sm rounded-xl hover:border-brand-500/30 transition-all duration-300" style={{
                background: `linear-gradient(to bottom right, var(--color-surface-hover), var(--color-surface))`,
                border: `1px solid var(--color-border)`
              }}>
                <div className="w-7 h-7 bg-gradient-to-br from-brand-500 via-accent-purple to-brand-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-glow">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium hidden sm:block" style={{ color: 'var(--color-text)' }}>
                  {user?.username || 'User'}
                </span>
              </div>
            ) : (
              /* Login Button for guest users and unauthenticated users */
              <button
                onClick={onShowAuth}
                className="relative px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 via-accent-purple to-brand-600 hover:from-brand-600 hover:via-accent-purple hover:to-brand-700 text-white font-medium transition-all duration-300 shadow-glow hover:shadow-glow-hover hover:scale-105 active:scale-95 overflow-hidden group"
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative z-10 flex items-center gap-2">
                  <User size={16} />
                  <span className="hidden sm:inline">Login</span>
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto" style={{ 
        background: `linear-gradient(to bottom, var(--color-background), var(--color-surface))`
      }}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 || (messages.length === 1 && messages[0].content.includes("How can I help you today")) ? (
            <QuickPrompts 
              onSelectPrompt={(prompt) => {
                setInputMessage(prompt)
                textareaRef.current?.focus()
              }}
              isVisible={true}
            />
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
      <div className="flex-shrink-0 backdrop-blur-xl p-4" style={{ 
        backgroundColor: 'var(--color-surface)',
        borderTop: `1px solid var(--color-border)`
      }}>
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

          {/* Premium Input Container with Glassmorphism */}
          <div className="relative">
            {/* Gradient glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500/20 via-accent-purple/20 to-brand-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative flex items-end gap-3 p-4 backdrop-blur-2xl rounded-2xl focus-within:border-brand-500/60 focus-within:ring-2 focus-within:ring-brand-500/30 focus-within:shadow-glow transition-all duration-300 group" style={{
              background: `linear-gradient(to bottom right, var(--color-surface-hover), var(--color-surface))`,
              border: `1px solid var(--color-border)`
            }}>
              {/* Premium Attachment Button */}
              <button
                onClick={() => setIsFileUploadOpen(true)}
                className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-neutral-700/40 to-neutral-800/40 hover:from-brand-500/20 hover:to-accent-purple/20 hover:text-brand-400 transition-all duration-300 hover:border-brand-500/50 hover:shadow-glow backdrop-blur-sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  border: `1px solid var(--color-border)`
                }}
                title="Attach files"
              >
                <Paperclip size={18} />
              </button>

              {/* Enhanced Text Input */}
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask NIVII anything... ✨"
                  className="w-full bg-transparent resize-none outline-none min-h-[24px] max-h-[200px] py-1 text-[15px] leading-relaxed"
                  style={{
                    color: 'var(--color-text)',
                    caretColor: 'var(--color-text)'
                  }}
                  rows={1}
                  disabled={isLoading}
                />
              </div>

              {/* Premium Action Buttons */}
              <div className="flex items-center gap-2">
                {/* AI Enhance Button */}
                <button
                  onClick={enhancePrompt}
                  disabled={!inputMessage.trim() || isEnhancing || isLoading}
                  className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-neutral-700/40 to-neutral-800/40 hover:from-accent-purple/20 hover:to-brand-500/20 hover:text-accent-purple transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:border-accent-purple/50 backdrop-blur-sm"
                  style={{
                    color: 'var(--color-text-secondary)',
                    border: `1px solid var(--color-border)`
                  }}
                  title="Enhance prompt with AI"
                >
                  <Wand2 size={18} className={isEnhancing ? 'animate-spin' : ''} />
                </button>

                {/* Voice Input Button */}
                <button
                  onClick={toggleVoiceRecognition}
                  className={`flex-shrink-0 p-2.5 rounded-xl transition-all duration-300 border backdrop-blur-sm ${
                    isRecording
                      ? 'bg-error-500/20 text-error-400 hover:bg-error-500/30 border-error-500/50'
                      : 'bg-gradient-to-br from-neutral-700/40 to-neutral-800/40 hover:from-brand-500/20 hover:to-accent-cyan/20 hover:text-brand-400 hover:border-brand-500/50'
                  }`}
                  style={!isRecording ? {
                    color: 'var(--color-text-secondary)',
                    borderColor: 'var(--color-border)'
                  } : {}}
                  title={isRecording ? 'Stop recording' : 'Start voice input'}
                >
                  {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                {/* Premium Send Button */}
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="relative flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-brand-500 via-accent-purple to-brand-600 hover:from-brand-600 hover:via-accent-purple hover:to-brand-700 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-neutral-600 disabled:to-neutral-700 shadow-glow hover:shadow-glow-hover hover:scale-105 active:scale-95 overflow-hidden group"
                  title="Send message (Enter)"
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <Send size={18} className="relative z-10" />
                </button>
              </div>
            </div>

            {/* Enhanced Stats Bar */}
            <div className="flex justify-between items-center mt-2 px-2">
              <div className="flex items-center gap-3 text-xs text-neutral-500">
                {inputMessage.length > 0 && (
                  <>
                    <span className={`transition-colors duration-200 ${
                      inputMessage.length > 1000 
                        ? 'text-warning-400 font-medium' 
                        : inputMessage.length > 800 
                        ? 'text-warning-500/70' 
                        : 'text-neutral-500'
                    }`}>
                      {inputMessage.length} / 1000 chars
                    </span>
                    <span className="text-neutral-600">•</span>
                    <span className="text-neutral-500">
                      {inputMessage.trim().split(/\s+/).filter(word => word.length > 0).length} words
                    </span>
                  </>
                )}
              </div>
              
              <div className="text-xs text-neutral-500 hidden sm:flex items-center gap-1">
                <span>Press</span>
                <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-neutral-300 font-mono text-xs">Enter</kbd>
                <span>to send,</span>
                <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-neutral-300 font-mono text-xs">Shift+Enter</kbd>
                <span>for new line</span>
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
