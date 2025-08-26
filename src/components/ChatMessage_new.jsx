import React, { useState, useEffect, useRef } from 'react'
import { 
  Bot, 
  User, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  FileText, 
  Heart, 
  MessageCircle, 
  Bookmark, 
  MoreHorizontal, 
  ThumbsUp, 
  ThumbsDown, 
  Star, 
  Zap, 
  RotateCcw,
  Sparkles,
  Clock,
  Share2,
  Edit3,
  Code,
  Image
} from 'lucide-react'

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
  const [copiedText, setCopiedText] = useState(false)
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
      if (speechSynthesis) {
        window.speechSynthesis.cancel()
      }

      const cleanText = text
        .replace(/\*/g, '')
        .replace(/Google/gi, 'NIVI')
        .replace(/Gemini/gi, 'NIVI')
        .replace(/\bNIVI\b/g, 'NIVI')

      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
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

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(true)
      setTimeout(() => setCopiedText(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const copyCodeBlock = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error('Failed to copy code: ', err)
    }
  }

  const handleReaction = (emoji) => {
    const newReactions = { ...reactions }
    if (newReactions[emoji]) {
      newReactions[emoji]++
    } else {
      newReactions[emoji] = 1
    }
    setReactions(newReactions)
    onReaction && onReaction(message.id, emoji)
    setShowReactions(false)
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    setIsDisliked(false)
    onMessageLike && onMessageLike(message.id, !isLiked)
  }

  const handleDislike = () => {
    setIsDisliked(!isDisliked)
    setIsLiked(false)
    onMessageDislike && onMessageDislike(message.id, !isDisliked)
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    onBookmark && onBookmark(message.id, !isBookmarked)
  }

  const handleRegenerate = async () => {
    if (onRegenerateAnswer && isBot) {
      setIsRegenerating(true)
      try {
        await onRegenerateAnswer(message.id)
      } catch (error) {
        console.error('Error regenerating answer:', error)
      } finally {
        setIsRegenerating(false)
      }
    }
  }

  const formatMessage = (text) => {
    if (!text) return ''
    
    return text.split('\n').map((line, index) => {
      if (line.trim().startsWith('```')) {
        return null // Handle code blocks separately
      }
      
      // Handle bold text
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      
      // Handle italic text
      line = line.replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      // Handle links
      line = line.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-brand-400 hover:text-brand-300 underline">$1</a>'
      )
      
      return (
        <p key={index} className={line.trim() === '' ? 'h-4' : 'mb-2 last:mb-0'}>
          <span dangerouslySetInnerHTML={{ __html: line }} />
        </p>
      )
    }).filter(Boolean)
  }

  const extractCodeBlocks = (text) => {
    const codeBlocks = []
    const regex = /```(\w+)?\n([\s\S]*?)```/g
    let match
    
    while ((match = regex.exec(text)) !== null) {
      codeBlocks.push({
        language: match[1] || 'text',
        code: match[2].trim()
      })
    }
    
    return codeBlocks
  }

  const renderCodeBlock = (code, language, index) => (
    <div key={index} className="my-4 bg-neutral-900 border border-neutral-700 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-800/50 border-b border-neutral-700">
        <div className="flex items-center gap-2">
          <Code size={14} className="text-neutral-400" />
          <span className="text-xs font-medium text-neutral-300 uppercase tracking-wide">
            {language}
          </span>
        </div>
        <button
          onClick={() => copyCodeBlock(code)}
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-neutral-400 hover:text-neutral-200 bg-neutral-700/50 hover:bg-neutral-600 rounded-md transition-colors"
        >
          {copiedCode ? <Check size={12} /> : <Copy size={12} />}
          {copiedCode ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm text-neutral-200 font-mono leading-relaxed">
          {code}
        </code>
      </pre>
    </div>
  )

  const messageWithoutCode = message.content?.replace(/```[\s\S]*?```/g, '') || ''
  const codeBlocks = extractCodeBlocks(message.content || '')

  return (
    <div
      ref={messageRef}
      className={`group flex gap-4 p-4 rounded-2xl transition-all duration-200 hover:bg-neutral-800/30 ${
        isBot ? 'bg-neutral-900/50' : 'bg-gradient-to-r from-brand-500/10 to-transparent'
      } animate-fade-in-up`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-medium ${
          isBot 
            ? 'bg-gradient-to-br from-brand-500 to-accent-purple' 
            : 'bg-gradient-to-br from-neutral-600 to-neutral-700'
        }`}>
          {isBot ? (
            <Zap className="w-5 h-5 text-white" />
          ) : (
            <User className="w-5 h-5 text-white" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-neutral-200">
            {isBot ? 'NIVI AI' : 'You'}
          </span>
          {isBot && (
            <span className="px-2 py-0.5 bg-brand-500/20 text-brand-300 text-xs font-medium rounded-md border border-brand-500/30">
              AI Assistant
            </span>
          )}
          <span className="text-xs text-neutral-500">
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          {responseTime && (
            <div className="flex items-center gap-1 text-xs text-neutral-500">
              <Clock size={10} />
              {responseTime}ms
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className="prose prose-neutral max-w-none">
          <div className="text-neutral-200 leading-relaxed">
            {formatMessage(messageWithoutCode)}
          </div>
          
          {/* Code Blocks */}
          {codeBlocks.map((block, index) => 
            renderCodeBlock(block.code, block.language, index)
          )}
        </div>

        {/* Reactions */}
        {Object.keys(reactions).length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            {Object.entries(reactions).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="flex items-center gap-1 px-2 py-1 bg-neutral-700/30 hover:bg-neutral-600/30 rounded-lg text-sm transition-colors"
              >
                <span>{emoji}</span>
                <span className="text-neutral-400">{count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex items-center gap-1">
            {/* Speech Button */}
            <button
              onClick={() => isSpeaking ? stopSpeaking() : speakText(message.content)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isSpeaking
                  ? 'bg-brand-500/20 text-brand-400 hover:bg-brand-500/30'
                  : 'bg-neutral-700/30 hover:bg-neutral-600/50 text-neutral-400 hover:text-neutral-200'
              }`}
              title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
            >
              {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            {/* Copy Button */}
            <button
              onClick={() => copyToClipboard(message.content)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                copiedText
                  ? 'bg-success-500/20 text-success-400'
                  : 'bg-neutral-700/30 hover:bg-neutral-600/50 text-neutral-400 hover:text-neutral-200'
              }`}
              title="Copy message"
            >
              {copiedText ? <Check size={16} /> : <Copy size={16} />}
            </button>

            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isLiked
                  ? 'bg-success-500/20 text-success-400'
                  : 'bg-neutral-700/30 hover:bg-neutral-600/50 text-neutral-400 hover:text-neutral-200'
              }`}
              title="Like message"
            >
              <ThumbsUp size={16} />
            </button>

            {/* Dislike Button */}
            <button
              onClick={handleDislike}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isDisliked
                  ? 'bg-error-500/20 text-error-400'
                  : 'bg-neutral-700/30 hover:bg-neutral-600/50 text-neutral-400 hover:text-neutral-200'
              }`}
              title="Dislike message"
            >
              <ThumbsDown size={16} />
            </button>

            {/* Bookmark Button */}
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isBookmarked
                  ? 'bg-warning-500/20 text-warning-400'
                  : 'bg-neutral-700/30 hover:bg-neutral-600/50 text-neutral-400 hover:text-neutral-200'
              }`}
              title="Bookmark message"
            >
              <Bookmark size={16} />
            </button>
          </div>

          <div className="flex items-center gap-1">
            {/* Reply Button */}
            <button
              onClick={() => onReply && onReply(message)}
              className="p-2 rounded-lg bg-neutral-700/30 hover:bg-neutral-600/50 text-neutral-400 hover:text-neutral-200 transition-all duration-200"
              title="Reply to message"
            >
              <MessageCircle size={16} />
            </button>

            {/* Regenerate Button (Bot only) */}
            {isBot && onRegenerateAnswer && (
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isRegenerating
                    ? 'bg-brand-500/20 text-brand-400'
                    : 'bg-neutral-700/30 hover:bg-neutral-600/50 text-neutral-400 hover:text-neutral-200'
                }`}
                title="Regenerate response"
              >
                <RotateCcw size={16} className={isRegenerating ? 'animate-spin' : ''} />
              </button>
            )}

            {/* Reactions Button */}
            <div className="relative">
              <button
                onClick={() => setShowReactions(!showReactions)}
                className="p-2 rounded-lg bg-neutral-700/30 hover:bg-neutral-600/50 text-neutral-400 hover:text-neutral-200 transition-all duration-200"
                title="Add reaction"
              >
                <Sparkles size={16} />
              </button>

              {/* Reactions Menu */}
              {showReactions && (
                <div className="absolute bottom-full mb-2 left-0 bg-neutral-800 border border-neutral-700 rounded-xl p-2 shadow-strong backdrop-blur-xl z-10">
                  <div className="flex gap-1">
                    {['👍', '👎', '❤️', '😂', '😮', '😢', '😡', '🎉'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(emoji)}
                        className="p-2 hover:bg-neutral-700 rounded-lg transition-colors text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatMessage
