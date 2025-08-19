import React from 'react'
import { Bot } from 'lucide-react'

const TypingIndicator = () => {
  return (
    <div className="flex justify-start chat-message">
      <div className="flex flex-row items-start space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-primary-500 to-primary-600">
          <Bot className="w-5 h-5 text-white" />
        </div>
        
        {/* Typing Indicator */}
        <div className="flex flex-col items-start">
          <div className="px-4 py-3 rounded-2xl bg-dark-800 text-white border border-dark-700">
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TypingIndicator
