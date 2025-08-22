import React, { useState } from 'react'
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Trash2, 
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  Sparkles
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import SettingsModal from './SettingsModal'

const Sidebar = ({ 
  isOpen, 
  onToggle, 
  chatHistory, 
  onSelectChat, 
  onNewChat, 
  onDeleteChat,
  currentChatId 
}) => {
  const { toggleSettings, isSettingsOpen } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  
  const formatDate = (date) => {
    const now = new Date()
    const chatDate = new Date(date)
    const diffTime = Math.abs(now - chatDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return chatDate.toLocaleDateString()
  }

  const truncateText = (text, maxLength = 30) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  // Filter chats based on search query
  const filteredChats = chatHistory.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (chat.lastMessage && chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <>
      {/* Toggle Button when sidebar is closed - Desktop Only */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed top-4 left-4 z-50 w-10 h-10 rounded-lg bg-dark-800 hover:bg-dark-700 text-gray-400 hover:text-white transition-all duration-200 flex items-center justify-center border border-dark-600 shadow-lg hidden md:flex"
          title="Open sidebar"
        >
          <ChevronRight size={18} />
        </button>
      )}

      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-screen bg-dark-900 border-r border-dark-700 transition-all duration-300 ease-in-out z-30 ${
        isOpen ? 'w-full md:w-80 translate-x-0' : 'w-0 -translate-x-full overflow-hidden'
      }`}>
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-dark-700 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-white">Gupsup AI</h2>
              </div>
              <button
                onClick={onToggle}
                className="p-2 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-white transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
            
            {/* New Chat Button */}
            <button
              onClick={(e) => {
                e.preventDefault()
                console.log('New chat button clicked')
                onNewChat()
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all duration-200 font-medium"
            >
              <Plus size={16} />
              New Chat
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-dark-700 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto min-h-0 scrollbar-modern">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3">
                {searchQuery ? `Search Results (${filteredChats.length})` : 'Recent Chats'}
              </h3>
              <div className="space-y-2">
                {filteredChats.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare size={32} className="mx-auto mb-3 opacity-50" />
                    <p className="text-sm">
                      {searchQuery ? 'No chats found matching your search' : 'No chat history yet'}
                    </p>
                    <p className="text-xs mt-1">
                      {searchQuery ? 'Try a different search term' : 'Start a new conversation!'}
                    </p>
                  </div>
                ) : (
                  filteredChats.map((chat, index) => (
                    <div
                      key={`${chat.id}-${index}`}
                      className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        currentChatId === chat.id
                          ? 'bg-primary-500/10 border border-primary-500/20 text-white'
                          : 'hover:bg-dark-800 text-gray-300 hover:text-white'
                      }`}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log('Chat clicked:', chat.id)
                        onSelectChat(chat.id)
                        // Close sidebar on mobile after selecting chat
                        if (window.innerWidth < 768) {
                          onToggle()
                        }
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          currentChatId === chat.id 
                            ? 'bg-primary-500' 
                            : 'bg-dark-700'
                        }`}>
                          <MessageSquare size={16} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {truncateText(chat.title || 'New Chat')}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-400">
                              {formatDate(chat.timestamp)}
                            </p>
                            {chat.messageCount > 0 && (
                              <span className="text-xs bg-dark-700 px-2 py-1 rounded-full text-gray-300">
                                {chat.messageCount} msg{chat.messageCount !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          {chat.lastMessage && (
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {truncateText(chat.lastMessage, 35)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          console.log('Delete chat clicked:', chat.id)
                          if (window.confirm('Are you sure you want to delete this chat?')) {
                            onDeleteChat(chat.id)
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-200"
                        title="Delete chat"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-dark-700 flex-shrink-0">
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-800 cursor-pointer transition-colors">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">My Profile</p>
                <p className="text-xs text-gray-400">Free Tier</p>
              </div>
              <button
                onClick={toggleSettings}
                className="p-2 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-white transition-colors"
                title="Settings"
              >
                <Settings size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={toggleSettings} />
    </>
  )
}

export default Sidebar
