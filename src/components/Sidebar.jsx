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
  Sparkles,
  Clock,
  Archive,
  Filter,
  MoreHorizontal,
  Bot,
  Star,
  Zap,
  BarChart3,
  Download,
  LogOut
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
  currentChatId,
  onSearchMessages,
  onShowAnalytics,
  onExportChat,
  onLogout,
  user
}) => {
  const { toggleSettings, isSettingsOpen, getCurrentThemeData } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all') // all, today, week, month
  
  const formatDate = (date) => {
    if (!date) return 'Just now'
    
    const now = new Date()
    const chatDate = new Date(date)
    
    // Check if the date is valid
    if (isNaN(chatDate.getTime())) {
      return 'Just now'
    }
    
    const diffTime = Math.abs(now - chatDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays - 1}d ago`
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)}w ago`
    return `${Math.ceil(diffDays / 30)}m ago`
  }

  const truncateText = (text, maxLength = 32) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  // Filter chats based on search query and filter type
  const filteredChats = chatHistory.filter(chat => {
    const matchesSearch = chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (chat.lastMessage && chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
    
    if (!matchesSearch) return false
    
    if (filterType === 'all') return true
    
    const now = new Date()
    const chatDate = new Date(chat.lastActivity || chat.createdAt)
    const diffDays = Math.ceil((now - chatDate) / (1000 * 60 * 60 * 24))
    
    switch (filterType) {
      case 'today':
        return diffDays <= 1
      case 'week':
        return diffDays <= 7
      case 'month':
        return diffDays <= 30
      default:
        return true
    }
  })

  const groupChatsByDate = (chats) => {
    const groups = {
      today: [],
      yesterday: [],
      week: [],
      month: [],
      older: []
    }

    chats.forEach(chat => {
      const now = new Date()
      const chatDate = new Date(chat.lastActivity || chat.createdAt)
      const diffDays = Math.ceil((now - chatDate) / (1000 * 60 * 60 * 24))

      if (diffDays === 1) groups.today.push(chat)
      else if (diffDays === 2) groups.yesterday.push(chat)
      else if (diffDays <= 7) groups.week.push(chat)
      else if (diffDays <= 30) groups.month.push(chat)
      else groups.older.push(chat)
    })

    return groups
  }

  const chatGroups = groupChatsByDate(filteredChats)

  const ChatGroup = ({ title, chats, icon: Icon }) => {
    if (chats.length === 0) return null

    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wide">
          <Icon size={12} />
          {title}
          <span className="ml-auto text-neutral-500">({chats.length})</span>
        </div>
        <div className="space-y-1">
          {chats.map((chat) => (
            <ChatItem key={chat.id} chat={chat} />
          ))}
        </div>
      </div>
    )
  }

  const ChatItem = ({ chat }) => {
    const isActive = currentChatId === chat.id
    
    return (
      <div
        className={`group relative flex items-center gap-3 px-3 py-3 mx-2 rounded-xl cursor-pointer transition-all duration-200 ${
          isActive 
            ? 'bg-gradient-to-r from-brand-500/20 to-brand-600/20 border border-brand-500/30 shadow-lg' 
            : 'hover:bg-neutral-800/50 hover:border-neutral-700 border border-transparent'
        }`}
        onClick={() => onSelectChat(chat.id)}
      >
        <div className={`flex-shrink-0 w-2 h-2 rounded-full ${
          isActive ? 'bg-brand-400' : 'bg-neutral-600'
        }`} />
        
        <div className="flex-1 min-w-0">
          <div className={`font-medium text-sm truncate ${
            isActive ? 'text-brand-100' : 'text-neutral-200 group-hover:text-neutral-100'
          }`}>
            {truncateText(chat.title)}
          </div>
          {chat.lastMessage && (
            <div className={`text-xs truncate mt-0.5 ${
              isActive ? 'text-brand-200/70' : 'text-neutral-400 group-hover:text-neutral-300'
            }`}>
              {truncateText(chat.lastMessage, 40)}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 flex items-center gap-1">
          <span className={`text-xs ${
            isActive ? 'text-brand-200/70' : 'text-neutral-500'
          }`}>
            {formatDate(chat.lastActivity || chat.createdAt)}
          </span>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDeleteChat(chat.id)
            }}
            className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all duration-200 ${
              isActive 
                ? 'hover:bg-brand-500/20 text-brand-200 hover:text-brand-100' 
                : 'hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200'
            }`}
            title="Delete chat"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm z-20 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-screen bg-neutral-900/95 backdrop-blur-xl border-r border-neutral-800 transition-all duration-300 ease-in-out z-30 ${
        isOpen ? 'w-full md:w-80 translate-x-0' : 'w-0 -translate-x-full overflow-hidden'
      }`}>
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0 p-6 border-b border-neutral-800/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-accent-purple rounded-xl flex items-center justify-center shadow-glow">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gradient-primary">NIVII AI</h2>
                  <p className="text-xs text-neutral-400">Intelligent Assistant</p>
                </div>
              </div>
              <button
                onClick={onToggle}
                className="p-2.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 transition-all duration-200 group"
              >
                <ChevronLeft size={18} className="group-hover:scale-110 transition-transform duration-200" />
              </button>
            </div>
            
            {/* New Chat Button */}
            <button
              onClick={(e) => {
                e.preventDefault()
                console.log('New chat button clicked')
                onNewChat()
              }}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-xl transition-all duration-200 font-medium shadow-medium hover:shadow-strong hover:scale-[1.02] group"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-200" />
              New Conversation
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex-shrink-0 p-4 space-y-4 border-b border-neutral-800/50">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-800/50 border border-neutral-700/50 rounded-lg text-neutral-100 placeholder-neutral-400 focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all duration-200"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 p-1 bg-neutral-800/30 rounded-lg">
              {[
                { key: 'all', label: 'All', icon: Archive },
                { key: 'today', label: 'Today', icon: Clock },
                { key: 'week', label: 'Week', icon: Filter }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setFilterType(key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                    filterType === key
                      ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                      : 'text-neutral-400 hover:text-neutral-300 hover:bg-neutral-700/30'
                  }`}
                >
                  <Icon size={12} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto py-4">
            {filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-16 h-16 bg-neutral-800/50 rounded-2xl flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-neutral-500" />
                </div>
                <h3 className="text-neutral-300 font-medium mb-2">No conversations found</h3>
                <p className="text-sm text-neutral-500 mb-4">
                  {searchQuery ? 'Try adjusting your search terms' : 'Start a new conversation to get started'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={onNewChat}
                    className="btn btn-secondary btn-sm"
                  >
                    Start chatting
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <ChatGroup title="Today" chats={chatGroups.today} icon={Clock} />
                <ChatGroup title="Yesterday" chats={chatGroups.yesterday} icon={Clock} />
                <ChatGroup title="This Week" chats={chatGroups.week} icon={Filter} />
                <ChatGroup title="This Month" chats={chatGroups.month} icon={Archive} />
                <ChatGroup title="Older" chats={chatGroups.older} icon={Archive} />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 p-4 border-t border-neutral-800/50">
            {/* Action Icons */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <button
                onClick={onSearchMessages}
                className="p-2.5 rounded-lg bg-neutral-800/30 hover:bg-neutral-700/50 text-neutral-400 hover:text-neutral-100 transition-all duration-200 backdrop-blur-sm group"
                title="Search messages"
              >
                <Search size={18} className="group-hover:scale-110 transition-transform duration-200" />
              </button>
              
              <button
                onClick={onShowAnalytics}
                className="p-2.5 rounded-lg bg-neutral-800/30 hover:bg-neutral-700/50 text-neutral-400 hover:text-neutral-100 transition-all duration-200 backdrop-blur-sm group"
                title="Analytics"
              >
                <BarChart3 size={18} className="group-hover:scale-110 transition-transform duration-200" />
              </button>
              
              <button
                onClick={onExportChat}
                className="p-2.5 rounded-lg bg-neutral-800/30 hover:bg-neutral-700/50 text-neutral-400 hover:text-neutral-100 transition-all duration-200 backdrop-blur-sm group"
                title="Export chat"
              >
                <Download size={18} className="group-hover:scale-110 transition-transform duration-200" />
              </button>
              
              <button
                onClick={toggleSettings}
                className="p-2.5 rounded-lg bg-blue-800/20 hover:bg-blue-700/30 text-blue-400 hover:text-blue-300 transition-all duration-200 backdrop-blur-sm group border border-blue-500/30"
                title="Settings"
              >
                <Settings size={18} className="group-hover:rotate-90 transition-transform duration-200" />
              </button>
              
              <button
                onClick={onLogout}
                className="p-2.5 rounded-lg bg-red-800/20 hover:bg-red-700/30 text-red-400 hover:text-red-300 transition-all duration-200 backdrop-blur-sm group border border-red-500/30"
                title="Logout"
              >
                <LogOut size={18} className="group-hover:scale-110 transition-transform duration-200" />
              </button>
            </div>

            {/* User Info and Settings */}
            <div className="flex items-center gap-3">
              {user && (
                <div className="flex items-center gap-2 px-3 py-2 bg-neutral-800/30 rounded-lg border border-neutral-700/50 flex-1">
                  <div className="w-6 h-6 bg-gradient-to-br from-brand-500 to-accent-purple rounded-lg flex items-center justify-center text-white text-xs font-bold">
                    {user.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm text-neutral-200 truncate">
                    {user.username}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && <SettingsModal />}
    </>
  )
}

export default Sidebar
