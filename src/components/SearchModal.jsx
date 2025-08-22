import React, { useState, useEffect, useRef } from 'react'
import { X, Search, MessageSquare, Clock, ArrowUp, ArrowDown, FileText } from 'lucide-react'

const SearchModal = ({ isOpen, onClose, messages, chatHistory = [] }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [searchIn, setSearchIn] = useState('current') // 'current', 'all', 'files'
  const searchInputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch()
    } else {
      setSearchResults([])
      setSelectedIndex(0)
    }
  }, [searchQuery, searchIn, messages, chatHistory])

  const performSearch = () => {
    const query = searchQuery.toLowerCase()
    const results = []

    if (searchIn === 'current' || searchIn === 'all') {
      // Search in current chat messages
      messages.forEach((message, messageIndex) => {
        const content = message.content.toLowerCase()
        if (content.includes(query)) {
          const matches = findMatches(content, query)
          results.push({
            type: 'message',
            chatId: 'current',
            chatTitle: 'Current Chat',
            messageIndex,
            message,
            matches,
            preview: generatePreview(message.content, query)
          })
        }
      })
    }

    if (searchIn === 'all' && chatHistory.length > 0) {
      // Search in other chats (this would need to be implemented with actual chat loading)
      chatHistory.forEach((chat) => {
        // This is a placeholder - in a real implementation, you'd load chat messages
        if (chat.title.toLowerCase().includes(query)) {
          results.push({
            type: 'chat',
            chatId: chat.id,
            chatTitle: chat.title,
            messageIndex: -1,
            message: null,
            matches: [],
            preview: `Chat: ${chat.title}`
          })
        }
      })
    }

    setSearchResults(results)
    setSelectedIndex(0)
  }

  const findMatches = (content, query) => {
    const matches = []
    let index = content.indexOf(query)
    while (index !== -1) {
      matches.push(index)
      index = content.indexOf(query, index + 1)
    }
    return matches
  }

  const generatePreview = (content, query) => {
    const index = content.toLowerCase().indexOf(query.toLowerCase())
    if (index === -1) return content.substring(0, 100) + '...'
    
    const start = Math.max(0, index - 50)
    const end = Math.min(content.length, index + query.length + 50)
    let preview = content.substring(start, end)
    
    if (start > 0) preview = '...' + preview
    if (end < content.length) preview = preview + '...'
    
    return preview
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => 
        prev < searchResults.length - 1 ? prev + 1 : 0
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : searchResults.length - 1
      )
    } else if (e.key === 'Enter' && searchResults.length > 0) {
      e.preventDefault()
      handleResultClick(searchResults[selectedIndex])
    }
  }

  const handleResultClick = (result) => {
    if (result.type === 'message') {
      // Scroll to message in current chat
      const messageElement = document.querySelector(`[data-message-id="${result.message.id}"]`)
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        messageElement.classList.add('highlight-message')
        setTimeout(() => {
          messageElement.classList.remove('highlight-message')
        }, 2000)
      }
    } else if (result.type === 'chat') {
      // Switch to chat (this would need to be implemented)
      console.log('Switch to chat:', result.chatId)
    }
    onClose()
  }

  const highlightQuery = (text, query) => {
    if (!query) return text
    const regex = new RegExp(`(${query})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-500 text-black px-1 rounded">$1</mark>')
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-dark-900 border border-dark-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-700">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-white">Search Messages</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-dark-800 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search Input */}
          <div className="p-6 border-b border-dark-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search in messages..."
                className="w-full pl-10 pr-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
              />
            </div>

            {/* Search Options */}
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Search in:</span>
                <select
                  value={searchIn}
                  onChange={(e) => setSearchIn(e.target.value)}
                  className="bg-dark-800 border border-dark-600 rounded px-3 py-1 text-sm text-white"
                >
                  <option value="current">Current Chat</option>
                  <option value="all">All Chats</option>
                  <option value="files">Files Only</option>
                </select>
              </div>
              
              {searchResults.length > 0 && (
                <span className="text-sm text-gray-400">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto max-h-[400px]">
            {searchQuery && searchResults.length === 0 ? (
              <div className="p-6 text-center">
                <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No results found for "{searchQuery}"</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="p-2">
                {searchResults.map((result, index) => (
                  <div
                    key={`${result.chatId}-${result.messageIndex}`}
                    onClick={() => handleResultClick(result)}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      index === selectedIndex 
                        ? 'bg-primary-500 bg-opacity-20 border border-primary-500' 
                        : 'hover:bg-dark-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {result.type === 'message' ? (
                          <MessageSquare className="w-5 h-5 text-primary-500" />
                        ) : (
                          <FileText className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white">
                            {result.chatTitle}
                          </span>
                          {result.type === 'message' && (
                            <span className="text-xs text-gray-500">
                              {new Date(result.message.timestamp).toLocaleString()}
                            </span>
                          )}
                        </div>
                        
                        <p 
                          className="text-sm text-gray-300 leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: highlightQuery(result.preview, searchQuery)
                          }}
                        />
                        
                        {result.matches.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">
                              {result.matches.length} match{result.matches.length !== 1 ? 'es' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-shrink-0">
                        <ArrowUp className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Start typing to search messages</p>
                <p className="text-sm text-gray-500 mt-2">
                  Use ↑↓ arrows to navigate, Enter to select, Esc to close
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-dark-700 bg-dark-800">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-4">
                <span>↑↓ Navigate</span>
                <span>Enter Select</span>
                <span>Esc Close</span>
              </div>
              <span>
                {searchResults.length > 0 && `${selectedIndex + 1} of ${searchResults.length}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SearchModal
