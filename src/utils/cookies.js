// Cookie utilities for managing chat history
export const cookieUtils = {
  // Set a cookie with expiration
  setCookie: (name, value, days = 30) => {
    const expires = new Date()
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
    document.cookie = `${name}=${JSON.stringify(value)};expires=${expires.toUTCString()};path=/`
  },

  // Get a cookie value
  getCookie: (name) => {
    const nameEQ = name + "="
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) {
        try {
          return JSON.parse(c.substring(nameEQ.length, c.length))
        } catch (e) {
          return null
        }
      }
    }
    return null
  },

  // Delete a cookie
  deleteCookie: (name) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
  },

  // Save chat history to cookies
  saveChatHistory: (chatHistory) => {
    cookieUtils.setCookie('ai_chat_history', chatHistory, 30)
  },

  // Load chat history from cookies
  loadChatHistory: () => {
    const history = cookieUtils.getCookie('ai_chat_history')
    return history || []
  },

  // Save current chat messages
  saveCurrentChat: (chatId, messages) => {
    const currentChats = cookieUtils.getCookie('ai_current_chats') || {}
    currentChats[chatId] = messages
    cookieUtils.setCookie('ai_current_chats', currentChats, 30)
  },

  // Load current chat messages
  loadCurrentChat: (chatId) => {
    const currentChats = cookieUtils.getCookie('ai_current_chats') || {}
    return currentChats[chatId] || []
  },

  // Save sidebar state
  saveSidebarState: (isOpen) => {
    cookieUtils.setCookie('ai_sidebar_open', isOpen, 30)
  },

  // Load sidebar state
  loadSidebarState: () => {
    const state = cookieUtils.getCookie('ai_sidebar_open')
    return state !== null ? state : true // Default to open
  },

  // Clear all chat data
  clearAllData: () => {
    cookieUtils.deleteCookie('ai_chat_history')
    cookieUtils.deleteCookie('ai_current_chats')
    cookieUtils.deleteCookie('ai_sidebar_open')
    cookieUtils.deleteCookie('theme')
  },

  // Debug function to check cookie status
  debugCookies: () => {
    console.log('=== Cookie Debug Info ===')
    console.log('Chat History:', cookieUtils.getCookie('ai_chat_history'))
    console.log('Current Chats:', cookieUtils.getCookie('ai_current_chats'))
    console.log('Sidebar State:', cookieUtils.getCookie('ai_sidebar_open'))
    console.log('All Cookies:', document.cookie)
    console.log('========================')
  }
}
