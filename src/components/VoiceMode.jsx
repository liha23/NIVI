import React, { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff, Waves, X } from 'lucide-react'

const VoiceMode = ({ isOpen, onClose, onSendMessage, isLoading, currentTheme }) => {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [callStatus, setCallStatus] = useState('connecting') // connecting, active, ended
  
  const recognitionRef = useRef(null)
  const synthesisRef = useRef(null)

  // Initialize audio context and speech recognition
  useEffect(() => {
    if (isOpen) {
      initializeVoiceMode()
    }
    
    return () => {
      cleanupVoiceMode()
    }
  }, [isOpen])

  const initializeVoiceMode = async () => {
    try {
      // Check browser compatibility
      if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.')
        onClose()
        return
      }

      if (!('speechSynthesis' in window)) {
        alert('Speech synthesis is not supported in your browser. Please use Chrome, Edge, or Safari.')
        onClose()
        return
      }

      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false // Changed to false to prevent repetition
      recognitionRef.current.interimResults = false // Changed to false for cleaner results
      recognitionRef.current.lang = 'en-US'
      recognitionRef.current.maxAlternatives = 1

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        if (transcript && transcript.trim()) {
          setTranscript(transcript.trim())
          // Auto-send when user stops speaking
          setTimeout(() => {
            handleVoiceMessage(transcript.trim())
          }, 500) // Reduced delay
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        if (event.error === 'not-allowed') {
          alert('Please allow microphone access to use voice mode.')
        }
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }

      // Start the call and immediately start listening
      setCallStatus('active')
      startListening()
      
    } catch (error) {
      console.error('Error initializing voice mode:', error)
      alert('Failed to initialize voice mode. Please try again.')
      onClose()
    }
  }

  const cleanupVoiceMode = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    if (synthesisRef.current) {
      window.speechSynthesis.cancel()
    }
    setIsListening(false)
    setIsSpeaking(false)
    setIsThinking(false)
    setTranscript('')
    setAiResponse('')
  }

  const handleVoiceMessage = async (message) => {
    if (!message.trim() || isLoading) return
    
    setIsListening(false)
    setIsThinking(true)
    setTranscript('')
    
    // Send message to parent component
    const response = await onSendMessage(message)
    
    setIsThinking(false)
    
    if (response && !isMuted) {
      speakResponse(response)
    } else if (response && isMuted) {
      // If muted, resume listening after response
      setTimeout(() => {
        if (callStatus === 'active') {
          startListening()
        }
      }, 500)
    }
  }

  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()
      
      // Clean the text for voice mode
      let cleanedText = text
        .replace(/\*/g, '') // Remove all asterisks
        .replace(/Gemini/gi, 'NIVII') // Replace Gemini with NIVII
        .replace(/Google/gi, 'NIVII') // Replace Google with NIVII
        .replace(/Google AI/gi, 'NIVII AI') // Replace Google AI with NIVII AI
        .replace(/Google's/gi, 'NIVII\'s') // Replace Google's with NIVII's
        .replace(/Google Assistant/gi, 'NIVII Assistant') // Replace Google Assistant with NIVII Assistant
        .replace(/\s+/g, ' ') // Remove extra spaces
        .trim()
      
      const utterance = new SpeechSynthesisUtterance(cleanedText)
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 0.8
      
      // Try to use a pleasant voice
      const voices = window.speechSynthesis.getVoices()
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Samantha') || 
        voice.name.includes('Alex')
      )
      if (preferredVoice) {
        utterance.voice = preferredVoice
      }
      
      utterance.onstart = () => {
        setIsSpeaking(true)
        setAiResponse(cleanedText) // Show cleaned text in UI
      }
      
      utterance.onend = () => {
        setIsSpeaking(false)
        setAiResponse('')
        // Resume listening after AI finishes speaking
        if (callStatus === 'active') {
          setTimeout(() => {
            startListening()
          }, 500) // Small delay to ensure smooth transition
        }
      }
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error)
        setIsSpeaking(false)
        setAiResponse('')
      }
      
      synthesisRef.current = utterance
      window.speechSynthesis.speak(utterance)
    }
  }

  const startListening = () => {
    if (recognitionRef.current && callStatus === 'active') {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (!isMuted) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const endCall = () => {
    setCallStatus('ended')
    cleanupVoiceMode()
    setTimeout(() => {
      onClose()
    }, 1000)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 z-50 backdrop-blur-sm"
        onClick={endCall}
      />
      
      {/* Voice Call Interface */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl w-full max-w-sm md:max-w-md overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-dark-700">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-sunset-pink to-sunset-purple rounded-full flex items-center justify-center">
                <Waves className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-semibold text-white">Voice Call</h2>
                <p className="text-xs md:text-sm text-gray-400">
                  {callStatus === 'connecting' && 'Connecting...'}
                  {callStatus === 'active' && 'Active'}
                  {callStatus === 'ended' && 'Call ended'}
                </p>
              </div>
            </div>
            <button
              onClick={endCall}
              className="p-2 rounded-lg hover:bg-dark-800 text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} className="md:w-5 md:h-5" />
            </button>
          </div>

          {/* Call Status */}
          <div className="p-4 md:p-6 text-center">
            {callStatus === 'connecting' && (
              <div className="space-y-4">
                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto bg-gradient-to-r from-sunset-pink to-sunset-purple rounded-full flex items-center justify-center animate-pulse">
                  <Waves className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <p className="text-sm md:text-base text-white">Initializing voice call...</p>
              </div>
            )}

            {callStatus === 'active' && (
              <div className="space-y-4 md:space-y-6">
                {/* AI Speaking Indicator */}
                {isSpeaking && (
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex justify-center">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-6 md:w-2 md:h-8 bg-sunset-pink rounded-full wave-animation"></div>
                        <div className="w-1.5 h-10 md:w-2 md:h-12 bg-sunset-purple rounded-full wave-animation"></div>
                        <div className="w-1.5 h-4 md:w-2 md:h-6 bg-sunset-orange rounded-full wave-animation"></div>
                        <div className="w-1.5 h-8 md:w-2 md:h-10 bg-sunset-pink rounded-full wave-animation"></div>
                        <div className="w-1.5 h-5 md:w-2 md:h-7 bg-sunset-purple rounded-full wave-animation"></div>
                      </div>
                    </div>
                    <p className="text-xs md:text-sm text-gray-400">AI is speaking...</p>
                    {aiResponse && (
                      <div className="bg-dark-800 rounded-lg p-2 md:p-3 max-h-16 md:max-h-20 overflow-y-auto">
                        <p className="text-xs md:text-sm text-gray-300">{aiResponse}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Thinking Indicator */}
                {isThinking && (
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex justify-center">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-sunset-orange to-sunset-yellow rounded-full flex items-center justify-center animate-pulse">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-3 md:w-2 md:h-4 bg-white rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-3 md:w-2 md:h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1.5 h-3 md:w-2 md:h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs md:text-sm text-gray-400">AI is thinking...</p>
                  </div>
                )}

                {/* User Listening Indicator */}
                {isListening && !isSpeaking && !isThinking && (
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex justify-center">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center voice-pulse">
                        <Mic className="w-6 h-6 md:w-8 md:h-8 text-white" />
                      </div>
                    </div>
                    <p className="text-xs md:text-sm text-gray-400">Listening...</p>
                    {transcript && (
                      <div className="bg-dark-800 rounded-lg p-2 md:p-3">
                        <p className="text-xs md:text-sm text-gray-300">{transcript}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Idle State */}
                {!isListening && !isSpeaking && !isThinking && (
                  <div className="space-y-3 md:space-y-4">
                    <div className="w-12 h-12 md:w-16 md:h-16 mx-auto bg-gradient-to-r from-sunset-pink to-sunset-purple rounded-full flex items-center justify-center">
                      <Mic className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    </div>
                    <p className="text-sm md:text-base text-white">Ready to listen</p>
                    <button
                      onClick={startListening}
                      className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-sunset-pink to-sunset-purple text-white rounded-lg hover:shadow-lg transition-all text-sm md:text-base"
                    >
                      Resume Listening
                    </button>
                  </div>
                )}

                {/* Control Buttons */}
                <div className="flex justify-center space-x-3 md:space-x-4">
                  <button
                    onClick={toggleMute}
                    className={`p-2 md:p-3 rounded-full transition-all ${
                      isMuted 
                        ? 'bg-red-500 text-white' 
                        : 'bg-dark-700 text-gray-400 hover:text-white hover:bg-dark-600'
                    }`}
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX size={16} className="md:w-5 md:h-5" /> : <Volume2 size={16} className="md:w-5 md:h-5" />}
                  </button>
                  
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`p-2 md:p-3 rounded-full transition-all ${
                      isListening 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gradient-to-r from-sunset-pink to-sunset-purple text-white'
                    }`}
                    title={isListening ? 'Stop listening' : 'Start listening'}
                  >
                    {isListening ? <MicOff size={16} className="md:w-5 md:h-5" /> : <Mic size={16} className="md:w-5 md:h-5" />}
                  </button>
                </div>
              </div>
            )}

            {callStatus === 'ended' && (
              <div className="space-y-3 md:space-y-4">
                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto bg-red-500 rounded-full flex items-center justify-center">
                  <PhoneOff className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <p className="text-sm md:text-base text-white">Call ended</p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="p-3 md:p-4 bg-dark-800 border-t border-dark-700">
            <p className="text-xs text-gray-400 text-center">
              {callStatus === 'active' 
                ? 'Speak naturally. The AI will respond automatically.' 
                : 'Initializing voice call...'
              }
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default VoiceMode
