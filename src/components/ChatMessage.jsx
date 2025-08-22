import React, { useState, useEffect, useRef } from 'react'
import { Bot, User, Volume2, VolumeX, Copy, Check, FileText, Heart, MessageCircle, Bookmark, MoreHorizontal, ThumbsUp, ThumbsDown, Star, Zap, RotateCcw } from 'lucide-react'

const ChatMessage = ({ message, onReply, onBookmark, onReaction, onMessageLike, onMessageDislike, onRegenerateAnswer }) => {
  const isBot = message.type === 'bot'
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechSynthesis, setSpeechSynthesis] = useState(null)
  const [copiedCode, setCopiedCode] = useState(null)
  const [showReactions, setShowReactions] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [reactions, setReactions] = useState(message.reactions || {})
  const [isBookmarked, setIsBookmarked] = useState(message.isBookmarked || false)
  const [isLiked, setIsLiked] = useState(message.isLiked || false)
  const [isDisliked, setIsDisliked] = useState(message.isDisliked || false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [responseTime, setResponseTime] = useState(message.responseTime || null)
  const messageRef = useRef(null)

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (messageRef.current && !messageRef.current.contains(event.target)) {
        setShowReactions(false)
        setShowOptions(false)
      }
    }

    if (showReactions || showOptions) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showReactions, showOptions])

  // Update local state when message props change
  useEffect(() => {
    setReactions(message.reactions || {})
    setIsBookmarked(message.isBookmarked || false)
    setIsLiked(message.isLiked || false)
    setIsDisliked(message.isDisliked || false)
    setResponseTime(message.responseTime || null)
  }, [message.reactions, message.isBookmarked, message.isLiked, message.isDisliked, message.responseTime])

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      if (speechSynthesis) {
        window.speechSynthesis.cancel()
      }

      // Remove asterisks and replace Google/Gemini with Gupsup for cleaner speech
      const cleanText = text
        .replace(/\*/g, '')
        .replace(/Google/gi, 'Gupsup')
        .replace(/Gemini/gi, 'Gupsup')
        .replace(/\bGupsup\b/g, 'Gupsup') // Keep Gupsup as is for better pronunciation

      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.rate = 1.0 // Normal speed (1x)
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      // Set voice (prefer female voice for bot, male for user)
      const voices = window.speechSynthesis.getVoices()
      const preferredVoice = voices.find(voice => 
        isBot 
          ? voice.name.includes('female') || voice.name.includes('Samantha') || voice.name.includes('Google UK English Female')
          : voice.name.includes('male') || voice.name.includes('Alex') || voice.name.includes('Google UK English Male')
      )
      
      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      utterance.onstart = () => {
        setIsSpeaking(true)
        setSpeechSynthesis(utterance)
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        setSpeechSynthesis(null)
      }

      utterance.onerror = () => {
        setIsSpeaking(false)
        setSpeechSynthesis(null)
      }

      window.speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setSpeechSynthesis(null)
    }
  }

  const copyToClipboard = async (text, codeIndex) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(codeIndex)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const handleReaction = (reactionType) => {
    console.log('Reaction clicked:', reactionType, 'for message:', message.id)
    const newReactions = { ...reactions }
    if (newReactions[reactionType]) {
      newReactions[reactionType]++
    } else {
      newReactions[reactionType] = 1
    }
    setReactions(newReactions)
    setShowReactions(false)
    if (onReaction) {
      onReaction(message.id, reactionType)
    }
    // Show visual feedback
    alert(`Added ${reactionType} reaction!`)
  }

  const handleBookmark = () => {
    console.log('Bookmark clicked for message:', message.id)
    const newBookmarkState = !isBookmarked
    setIsBookmarked(newBookmarkState)
    if (onBookmark) {
      onBookmark(message.id, newBookmarkState)
    }
    setShowOptions(false)
    // Show visual feedback
    alert(newBookmarkState ? 'Message bookmarked!' : 'Bookmark removed!')
  }

  const handleReply = () => {
    console.log('Reply clicked for message:', message.id)
    if (onReply) {
      onReply(message)
    }
    setShowOptions(false)
    // Show visual feedback
    alert('Reply mode activated! Focus on input field.')
  }

  const handleLike = () => {
    console.log('Like clicked for message:', message.id)
    const newLikeState = !isLiked
    setIsLiked(newLikeState)
    if (isDisliked) {
      setIsDisliked(false)
    }
    if (onMessageLike) {
      onMessageLike(message.id, newLikeState)
    }
    // Removed visual feedback alert
  }

  const handleDislike = () => {
    console.log('Dislike clicked for message:', message.id)
    const newDislikeState = !isDisliked
    setIsDisliked(newDislikeState)
    if (isLiked) {
      setIsLiked(false)
    }
    if (onMessageDislike) {
      onMessageDislike(message.id, newDislikeState)
    }
    // Removed visual feedback alert
  }

  const handleRegenerate = async () => {
    console.log('Regenerate clicked for message:', message.id)
    setIsRegenerating(true)
    if (onRegenerateAnswer) {
      await onRegenerateAnswer(message.id)
    }
    setIsRegenerating(false)
    // Removed visual feedback alert
  }

  const formatResponseTime = (timeMs) => {
    if (!timeMs) return null
    if (timeMs < 1000) return `${timeMs}ms`
    if (timeMs < 60000) return `${(timeMs / 1000).toFixed(1)}s`
    return `${Math.floor(timeMs / 60000)}m ${Math.floor((timeMs % 60000) / 1000)}s`
  }

  const reactionEmojis = [
    { type: 'like', emoji: '👍', icon: ThumbsUp },
    { type: 'love', emoji: '❤️', icon: Heart },
    { type: 'star', emoji: '⭐', icon: Star },
    { type: 'dislike', emoji: '👎', icon: ThumbsDown },
    { type: 'zap', emoji: '⚡', icon: Zap }
  ]

  const formatMessageContent = (content, files = []) => {
    // Replace Google and Gemini with Gupsup in display
    const processedContent = content
      .replace(/Google/gi, 'Gupsup')
      .replace(/Gemini/gi, 'Gupsup')

    // Split content by code blocks (```language or ```)
    const parts = processedContent.split(/(```[\s\S]*?```)/g)
    
    return parts.map((part, index) => {
      // Check if this part is a code block
      if (part.startsWith('```') && part.endsWith('```')) {
        // Extract language and code
        const lines = part.split('\n')
        const firstLine = lines[0].replace('```', '').trim()
        const language = firstLine || 'text'
        const code = lines.slice(1, -1).join('\n')
        
        return (
          <div key={index} className="my-3 rounded-lg overflow-hidden border border-dark-600">
            {/* Code header */}
            <div className="flex items-center justify-between bg-dark-700 px-3 py-2 border-b border-dark-600">
              <span className="text-xs font-medium text-gray-300 uppercase">{language}</span>
              <button
                onClick={() => copyToClipboard(code, index)}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-dark-600 hover:bg-dark-500 text-gray-300 hover:text-white rounded transition-colors"
                title="Copy code"
              >
                {copiedCode === index ? (
                  <>
                    <Check size={12} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    Copy
                  </>
                )}
              </button>
            </div>
            {/* Code content */}
            <pre className="bg-dark-800 p-3 overflow-x-auto">
              <code className="text-sm text-gray-100 font-mono whitespace-pre">
                {code}
              </code>
            </pre>
          </div>
        )
      } else {
        // Regular text content
        return (
          <span key={index} className="whitespace-pre-wrap break-words">
            {part}
          </span>
        )
      }
    })
  }

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} chat-message group`} ref={messageRef}>
      <div className={`flex max-w-[85%] md:max-w-[80%] ${isBot ? 'flex-row' : 'flex-row-reverse'} items-start space-x-2 md:space-x-3`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center ${
          isBot 
            ? 'bg-gradient-to-r from-primary-500 to-primary-600' 
            : 'bg-gradient-to-r from-gray-500 to-gray-600'
        }`}>
          {isBot ? (
            <Bot className="w-4 h-4 md:w-5 md:h-5 text-white" />
          ) : (
            <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
          )}
        </div>
        
        {/* Message Content */}
        <div className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
          <div className={`px-3 py-2 md:px-4 md:py-3 rounded-2xl relative ${
            isBot 
              ? 'bg-dark-800 text-white border border-dark-700' 
              : 'bg-primary-600 text-white'
          } ${isSpeaking ? 'neon-highlight' : ''}`}>
            {/* Neon border animation container */}
            {isSpeaking && (
              <div className="absolute inset-0 rounded-2xl neon-border-animation"></div>
            )}
            
            <div className="flex items-start justify-between gap-2 md:gap-3 relative z-10">
              <div className="flex-1 text-sm md:text-base">
                {formatMessageContent(message.content, message.files)}
                
                {/* Display attached files */}
                {message.files && message.files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.files.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-dark-700 rounded">
                        {file.preview ? (
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="w-8 h-8 object-cover rounded"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-dark-600 rounded flex items-center justify-center">
                            <FileText className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <span className="text-xs text-white flex-1 truncate">{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Action Buttons - Always visible */}
              <div className="flex items-center gap-1">
                {/* Speak Button */}
                <button
                  onClick={() => isSpeaking ? stopSpeaking() : speakText(message.content)}
                  className={`p-1.5 rounded-lg transition-all duration-200 ${
                    isSpeaking
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-dark-700 text-gray-300 hover:bg-dark-600 hover:text-white'
                  }`}
                  title={isSpeaking ? 'Stop speaking' : 'Speak this message'}
                >
                  {isSpeaking ? (
                    <VolumeX size={14} />
                  ) : (
                    <Volume2 size={14} />
                  )}
                </button>

                {/* Reaction Button - Modern icon */}
                <button
                  onClick={() => setShowReactions(!showReactions)}
                  className={`p-1.5 rounded-lg transition-all duration-200 ${
                    showReactions 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-dark-700 text-gray-300 hover:bg-dark-600 hover:text-white'
                  }`}
                  title="Add reaction"
                >
                  <Zap size={14} />
                </button>

                {/* More Options Button */}
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className={`p-1.5 rounded-lg transition-all duration-200 ${
                    showOptions 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-dark-700 text-gray-300 hover:bg-dark-600 hover:text-white'
                  }`}
                  title="More options"
                >
                  <MoreHorizontal size={14} />
                </button>
              </div>
            </div>

            {/* AI-specific buttons for bot messages */}
            {isBot && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-dark-600">
                {/* Like Button */}
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all duration-200 ${
                    isLiked
                      ? 'bg-green-500 text-white'
                      : 'bg-dark-700 text-gray-300 hover:bg-dark-600 hover:text-white'
                  }`}
                  title="Like this response"
                >
                  <ThumbsUp size={12} />
                  <span className="text-xs">Like</span>
                </button>

                {/* Dislike Button */}
                <button
                  onClick={handleDislike}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all duration-200 ${
                    isDisliked
                      ? 'bg-red-500 text-white'
                      : 'bg-dark-700 text-gray-300 hover:bg-dark-600 hover:text-white'
                  }`}
                  title="Dislike this response"
                >
                  <ThumbsDown size={12} />
                  <span className="text-xs">Dislike</span>
                </button>

                {/* Regenerate Button */}
                <button
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all duration-200 ${
                    isRegenerating
                      ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                  title="Regenerate answer"
                >
                  <RotateCcw size={12} className={isRegenerating ? 'animate-spin' : ''} />
                  <span className="text-xs">{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
                </button>

                {/* Response Time */}
                {responseTime && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-dark-700 rounded-lg">
                    <span className="text-xs text-gray-400">⏱️ {formatResponseTime(responseTime)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Reactions Display */}
            {Object.keys(reactions).length > 0 && (
              <div className="flex items-center gap-1 mt-2">
                {Object.entries(reactions).map(([type, count]) => {
                  const reaction = reactionEmojis.find(r => r.type === type)
                  return reaction ? (
                    <span key={type} className="flex items-center gap-1 px-2 py-1 bg-dark-700 rounded-full text-xs">
                      <span>{reaction.emoji}</span>
                      <span className="text-gray-300">{count}</span>
                    </span>
                  ) : null
                })}
              </div>
            )}

            {/* Reply Thread Indicator */}
            {message.replies && message.replies.length > 0 && (
              <div className="mt-2 text-xs text-gray-400">
                {message.replies.length} reply{message.replies.length !== 1 ? 'ies' : ''}
              </div>
            )}
          </div>

          {/* Reaction Picker */}
          {showReactions && (
            <div className="absolute bottom-full right-0 mb-2 bg-dark-800 border border-dark-600 rounded-lg p-2 shadow-xl z-20">
              <div className="flex items-center gap-1">
                {reactionEmojis.map((reaction) => (
                  <button
                    key={reaction.type}
                    onClick={() => handleReaction(reaction.type)}
                    className="p-2 hover:bg-dark-700 rounded-lg transition-all duration-200 hover:scale-110"
                    title={reaction.type}
                  >
                    <span className="text-xl">{reaction.emoji}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Options Menu */}
          {showOptions && (
            <div className="absolute bottom-full right-0 mb-2 bg-dark-800 border border-dark-600 rounded-lg p-1 shadow-lg z-20 min-w-[120px]">
              <button
                onClick={handleReply}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-dark-700 rounded transition-colors"
              >
                <MessageCircle size={14} />
                Reply
              </button>
              <button
                onClick={handleBookmark}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors ${
                  isBookmarked 
                    ? 'text-yellow-400 hover:bg-dark-700' 
                    : 'text-gray-300 hover:bg-dark-700'
                }`}
              >
                <Bookmark size={14} />
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </button>
            </div>
          )}
          
          {/* Timestamp */}
          <span className="text-xs text-gray-500 mt-1 px-1">
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ChatMessage
