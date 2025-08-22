import React, { useState } from 'react'
import { ChevronDown, Sparkles, Zap, Brain, Crown } from 'lucide-react'
import { config } from '../../config.js'

const ModelSelector = ({ selectedModel, onModelChange }) => {
  const [isOpen, setIsOpen] = useState(false)

  const getModelIcon = (modelType) => {
    switch (modelType) {
      case 'gemini':
        return <Sparkles className="w-4 h-4" />
      case 'openrouter':
        return <Zap className="w-4 h-4" />
      default:
        return <Crown className="w-4 h-4" />
    }
  }

  const getModelColor = (modelType) => {
    switch (modelType) {
      case 'gemini':
        return 'text-blue-400'
      case 'openrouter':
        return 'text-green-400'
      default:
        return 'text-gray-400'
    }
  }

  const currentModel = config.MODELS[selectedModel]

  return (
    <div className="relative">
      {/* Model Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white hover:bg-dark-700 transition-all duration-200"
      >
        <div className={`${getModelColor(currentModel.type)}`}>
          {getModelIcon(currentModel.type)}
        </div>
        <span className="text-sm font-medium">{currentModel.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-dark-800 border border-dark-600 rounded-lg shadow-xl z-50">
          <div className="p-2">
            <div className="text-xs text-gray-400 px-3 py-2 border-b border-dark-600">
              Choose AI Model
            </div>
            
            {Object.entries(config.MODELS).map(([key, model]) => (
              <button
                key={key}
                onClick={() => {
                  onModelChange(key)
                  setIsOpen(false)
                }}
                className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all duration-200 text-left ${
                  selectedModel === key
                    ? 'bg-gradient-to-r from-sunset-pink/20 to-sunset-purple/20 border border-sunset-pink/30'
                    : 'hover:bg-dark-700'
                }`}
              >
                <div className={`${getModelColor(model.type)} mt-0.5`}>
                  {getModelIcon(model.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {model.name}
                    </span>
                    {selectedModel === key && (
                      <span className="text-xs bg-sunset-pink text-white px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {model.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default ModelSelector
