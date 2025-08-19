import React from 'react'
import { 
  MessageSquare, 
  Plus, 
  Search, 
  BookOpen, 
  Trash2, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Star
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

     return (
     <>
               {/* Toggle Button when sidebar is closed */}
        {!isOpen && (
          <button
            onClick={onToggle}
            className="fixed bottom-4 left-4 z-50 px-3 py-2 rounded-lg bg-dark-800 border border-dark-600 text-gray-300 hover:text-white hover:bg-dark-700 transition-all duration-200 flex items-center gap-2 md:flex-row flex-col"
            title="Open sidebar"
          >
            <ChevronRight size={16} />
            <span className="text-xs md:text-sm font-medium">Chats</span>
          </button>
        )}

       

               {/* Sidebar */}
        <div className={`fixed left-0 top-0 h-full bg-dark-900 border-r border-dark-700 transition-all duration-300 ease-in-out z-30 ${
          isOpen ? 'w-80 md:w-80 w-full translate-x-0' : 'w-0 -translate-x-full overflow-hidden'
        }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
                     <div className="p-4 border-b border-dark-700">
                              <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-2">
                     <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                       <Star className="w-4 h-4 text-white" />
                     </div>
                     <h2 className="text-lg font-semibold text-white">AI Chat</h2>
                   </div>
               <button
                 onClick={onToggle}
                 className="p-1 rounded hover:bg-dark-800 text-gray-400 hover:text-white"
               >
                 <ChevronLeft size={16} />
               </button>
             </div>
            
            {/* New Chat Button */}
            <button
              onClick={onNewChat}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <Plus size={16} />
              New Chat
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-dark-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search chats..."
                className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Chats</h3>
              <div className="space-y-1">
                {chatHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No chat history yet</p>
                    <p className="text-xs">Start a new conversation!</p>
                  </div>
                ) : (
                  chatHistory.map((chat) => (
                    <div
                      key={chat.id}
                      className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                        currentChatId === chat.id
                          ? 'bg-primary-600 text-white'
                          : 'hover:bg-dark-800 text-gray-300 hover:text-white'
                      }`}
                      onClick={() => onSelectChat(chat.id)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <MessageSquare size={16} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {truncateText(chat.title || 'New Chat')}
                          </p>
                          <p className="text-xs opacity-70 truncate">
                            {formatDate(chat.timestamp)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteChat(chat.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500 hover:text-white transition-all"
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
           <div className="p-4 border-t border-dark-700">
             <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-800 cursor-pointer transition-colors">
               <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                 <Star className="w-5 h-5 text-white" />
               </div>
               <div className="flex-1">
                 <p className="text-sm font-medium text-white">Nivi</p>
                 <p className="text-xs text-gray-400">Free Tier</p>
               </div>
               <button
                 onClick={toggleSettings}
                 className="p-1 rounded hover:bg-dark-700 text-gray-400 hover:text-white transition-colors"
                 title="Settings(soon)"
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
