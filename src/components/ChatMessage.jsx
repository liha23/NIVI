import React, { useState } from 'react'
import { Bot, User, Volume2, VolumeX } from 'lucide-react'

const ChatMessage = ({ message }) => {
  const isBot = message.type === 'bot'
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechSynthesis, setSpeechSynthesis] = useState(null)
  const [currentWordIndex, setCurrentWordIndex] = useState(-1)
  const [words, setWords] = useState([])

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      if (speechSynthesis) {
        window.speechSynthesis.cancel()
      }

      // Remove asterisks and replace Google/Gemini with NIVI for cleaner speech
      const cleanText = text
        .replace(/\*/g, '')
        .replace(/Google/gi, 'NIVI')
        .replace(/Gemini/gi, 'NIVI')
        .replace(/\bNIVI\b/g, 'Nivi') // Convert NIVI to Nivi for better pronunciation
      
      // Split text into words for highlighting
      const wordArray = cleanText.split(/\s+/).filter(word => word.length > 0)
      setWords(wordArray)
      setCurrentWordIndex(-1)

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

      // Calculate word timing for highlighting
      const wordCount = wordArray.length
      const estimatedDuration = cleanText.length * 50 // Rough estimate: 50ms per character for 1x speed
      const wordInterval = estimatedDuration / wordCount

      utterance.onstart = () => {
        setIsSpeaking(true)
        setSpeechSynthesis(utterance)
        setCurrentWordIndex(0)
        
        // Start word-by-word highlighting
        let wordIndex = 0
        const highlightInterval = setInterval(() => {
          if (wordIndex < wordCount) {
            setCurrentWordIndex(wordIndex)
            wordIndex++
          } else {
            clearInterval(highlightInterval)
          }
        }, wordInterval)
        
        // Store interval for cleanup
        utterance.highlightInterval = highlightInterval
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        setSpeechSynthesis(null)
        setCurrentWordIndex(-1)
        if (utterance.highlightInterval) {
          clearInterval(utterance.highlightInterval)
        }
      }

      utterance.onerror = () => {
        setIsSpeaking(false)
        setSpeechSynthesis(null)
        setCurrentWordIndex(-1)
        if (utterance.highlightInterval) {
          clearInterval(utterance.highlightInterval)
        }
      }

      window.speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setSpeechSynthesis(null)
      setCurrentWordIndex(-1)
      if (speechSynthesis && speechSynthesis.highlightInterval) {
        clearInterval(speechSynthesis.highlightInterval)
      }
    }
  }

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} chat-message`}>
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
          <div className={`px-3 py-2 md:px-4 md:py-3 rounded-2xl ${
            isBot 
              ? 'bg-dark-800 text-white border border-dark-700' 
              : 'bg-primary-600 text-white'
          }`}>
            <div className="flex items-start justify-between gap-2 md:gap-3">
              <div className="whitespace-pre-wrap break-words flex-1 text-sm md:text-base">
                {isSpeaking && words.length > 0 ? (
                  <div>
                    {words.map((word, index) => (
                      <span
                        key={index}
                        className={`transition-all duration-200 ${
                          index === currentWordIndex
                            ? 'bg-yellow-400 text-black px-1 rounded font-semibold'
                            : ''
                        }`}
                      >
                        {word}
                        {index < words.length - 1 ? ' ' : ''}
                      </span>
                    ))}
                  </div>
                ) : (
                  // Replace Google and Gemini with NIVI in display
                  message.content
                    .replace(/Google/gi, 'NIVI')
                    .replace(/Gemini/gi, 'NIVI')
                )}
              </div>
              
              {/* Speak Button */}
              <button
                onClick={() => isSpeaking ? stopSpeaking() : speakText(message.content)}
                className={`flex-shrink-0 p-1 md:p-1.5 rounded-lg transition-all duration-200 ${
                  isSpeaking
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-600 bg-opacity-50 text-gray-300 hover:bg-gray-500 hover:text-white'
                }`}
                title={isSpeaking ? 'Stop speaking' : 'Speak this message'}
              >
                {isSpeaking ? (
                  <VolumeX size={12} className="md:w-3.5 md:h-3.5" />
                ) : (
                  <Volume2 size={12} className="md:w-3.5 md:h-3.5" />
                )}
              </button>
            </div>
          </div>
          
          {/* Timestamp */}
          <span className="text-xs text-gray-500 mt-1 px-1">
            {message.timestamp.toLocaleTimeString([], { 
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
