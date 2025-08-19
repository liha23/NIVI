import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, ChevronLeft, ChevronRight, Plus, Mic, MicOff, Volume2, Phone, LogOut } from 'lucide-react'
import ChatMessage from './ChatMessage'
import TypingIndicator from './TypingIndicator'
import { useTheme } from '../contexts/ThemeContext'
import VoiceMode from './VoiceMode'

const ChatArea = ({ 
  messages, 
  onSendMessage, 
  isLoading, 
  isSidebarOpen,
  currentChatTitle,
  onToggleSidebar,
  user,
  onLogout
}) => {
  const { currentTheme } = useTheme()
  const [inputMessage, setInputMessage] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isVoiceModeOpen, setIsVoiceModeOpen] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
    onSendMessage(inputMessage.trim())
    setInputMessage('')
  }

  const handleVoiceMessage = async (message) => {
    if (!message.trim() || isLoading) return
    return await onSendMessage(message.trim())
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Voice recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'
      recognitionRef.current.maxAlternatives = 1

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        if (transcript) {
          setInputMessage(prev => prev + ' ' + transcript.trim())
          setIsListening(false)
          setIsRecording(false)
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        setIsRecording(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
        setIsRecording(false)
      }
    }
  }, [])

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser')
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

  return (
    <div className={`flex flex-col h-screen transition-all duration-300 relative ${
      isSidebarOpen ? 'ml-0 md:ml-80' : 'ml-0'
    }`} style={{ height: '100vh' }}>
      

                          {/* Header */}
       <header className="bg-dark-900 border-b border-dark-700 px-4 md:px-6 py-3 md:py-4 flex-shrink-0">
         <div className="flex items-center justify-between relative">
           {/* Left Side - Mobile Toggle */}
           <div className="flex items-center">
             <button
               onClick={onToggleSidebar}
               className="md:hidden w-8 h-8 rounded-lg bg-gradient-to-r from-sunset-pink to-sunset-purple text-white hover:from-sunset-orange hover:to-sunset-yellow transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-sunset-pink/30 flex items-center justify-center"
               title="Toggle sidebar"
             >
               <ChevronRight size={16} />
             </button>
             {/* Desktop spacer to balance layout */}
             <div className="hidden md:block w-32"></div>
           </div>
           
           {/* Centered Logo and Title */}
           <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-2 md:space-x-3">
             <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-sunset-pink to-sunset-purple rounded-lg flex items-center justify-center shadow-lg shadow-sunset-pink/30">
               <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
             </div>
             <div className="text-center">
               <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-sunset-pink to-sunset-purple bg-clip-text text-transparent">Gupsup AI</h1>
             </div>
           </div>
           
                     {/* Right Side - Welcome and Logout */}
          <div className="flex items-center gap-3">
            <div className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2">
              <p className="text-sm text-gray-300">
                Welcome, <span className="text-sunset-pink font-medium">{user?.username}</span>
              </p>
            </div>
            <button
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
           

         </div>
       </header>

             {/* Chat Messages */}
       <div className="flex-1 overflow-y-auto bg-dark-950 min-h-0">
         <div className="max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-6">
                    {messages.length === 0 ? (
                         <div className="flex flex-col items-center justify-center h-full text-center px-4">
               <h2 className="text-xl md:text-2xl font-bold text-white mb-6 md:mb-8">What can I help with?</h2>
             </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && <TypingIndicator />}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

             {/* Input Area */}
       <div className="bg-dark-900 border-t border-dark-700 px-4 md:px-6 py-3 md:py-4 flex-shrink-0">
         <div className="max-w-4xl mx-auto">
                     <div className={`flex items-center space-x-2 md:space-x-3 rounded-xl px-3 md:px-4 py-2.5 md:py-3 border transition-all duration-300 backdrop-blur-sm ${
                       isRecording 
                         ? 'bg-sunset-red/20 border-sunset-red/50 shadow-lg shadow-sunset-red/30' 
                         : 'bg-dark-800/50 border-sunset-purple/30 shadow-lg shadow-sunset-purple/10'
                     }`}>
             {/* Plus Icon */}
             <button 
               className="p-1.5 md:p-2 text-gray-400 hover:text-white transition-colors relative group"
               title="Coming Soon!"
             >
               <Plus size={18} className="md:w-5 md:h-5" />
               {/* Tooltip */}
               <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-dark-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                 Coming Soon!
                 <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-dark-700"></div>
               </div>
             </button>
             
             {/* Input Field */}
             <div className="flex-1">
               <textarea
                 ref={inputRef}
                 value={inputMessage}
                 onChange={(e) => setInputMessage(e.target.value)}
                 onKeyPress={handleKeyPress}
                 placeholder="Ask anything"
                 className="w-full bg-transparent border-none outline-none text-white placeholder-gray-400 resize-none text-sm md:text-base"
                 rows="1"
                 style={{ minHeight: '20px', maxHeight: '120px' }}
                 disabled={isLoading}
               />
             </div>
             
             {/* Voice Input Button */}
             <button
               onClick={toggleVoiceInput}
               disabled={isLoading}
               className={`p-1.5 md:p-2 rounded-lg transition-colors ${
                 isRecording 
                   ? 'bg-red-500 text-white' 
                   : 'text-gray-400 hover:text-white hover:bg-dark-700'
               }`}
               title={isRecording ? 'Stop recording' : 'Start voice input'}
             >
               {isRecording ? <MicOff size={18} className="md:w-5 md:h-5" /> : <Mic size={18} className="md:w-5 md:h-5" />}
             </button>
             
             {/* Voice Call Button */}
             <button
               onClick={() => setIsVoiceModeOpen(true)}
               disabled={isLoading}
               className="p-1.5 md:p-2 rounded-lg transition-colors text-gray-400 hover:text-white hover:bg-dark-700"
               title="Voice Call Mode"
             >
               <Phone size={18} className="md:w-5 md:h-5" />
             </button>
             
             {/* Send Button */}
             <button
               onClick={handleSendMessage}
               disabled={!inputMessage.trim() || isLoading}
               className={`p-1.5 md:p-2 rounded-lg transition-all duration-300 ${
                 inputMessage.trim() && !isLoading
                   ? 'bg-gradient-to-r from-sunset-pink to-sunset-purple text-white hover:shadow-lg hover:shadow-sunset-pink/30'
                   : 'bg-dark-700 text-gray-500 cursor-not-allowed'
               }`}
             >
               <Send size={18} className="md:w-5 md:h-5" />
             </button>
           </div>
          
          {/* Voice Recording Indicator */}
          {isRecording && (
            <div className="relative mt-3 p-3 rounded-xl border-2 border-transparent bg-gradient-to-r from-sunset-pink/20 via-sunset-purple/20 to-sunset-orange/20 animate-pulse">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-sunset-pink/0 via-sunset-purple/30 to-sunset-orange/0 animate-pulse"></div>
              <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-sunset-pink via-sunset-purple to-sunset-orange bg-[length:200%_100%] animate-gradient-x"></div>
              <div className="relative flex items-center justify-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-1 h-4 bg-sunset-pink rounded-full animate-pulse"></div>
                  <div className="w-1 h-6 bg-sunset-purple rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-3 bg-sunset-orange rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-white font-medium">Listening...</span>
              </div>
            </div>
          )}
          
                     <p className="text-xs text-gray-500 mt-2 text-center px-2">
             Press Enter to send, Shift+Enter for new line
           </p>
        </div>
      </div>
      

      
      {/* Voice Mode */}
      <VoiceMode 
        isOpen={isVoiceModeOpen}
        onClose={() => setIsVoiceModeOpen(false)}
        onSendMessage={handleVoiceMessage}
        isLoading={isLoading}
        currentTheme={currentTheme}
      />
    </div>
  )
}

export default ChatArea
