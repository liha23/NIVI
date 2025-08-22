export const keyboardShortcuts = {
  shortcuts: new Map(),
  
  // Register a keyboard shortcut
  register: (key, callback, description = '') => {
    keyboardShortcuts.shortcuts.set(key, { callback, description })
  },
  
  // Unregister a keyboard shortcut
  unregister: (key) => {
    keyboardShortcuts.shortcuts.delete(key)
  },
  
  // Handle keydown events
  handleKeyDown: (event) => {
    // Don't trigger shortcuts when typing in input fields
    if (event.target.tagName === 'INPUT' || 
        event.target.tagName === 'TEXTAREA' || 
        event.target.contentEditable === 'true') {
      return
    }
    
    const key = keyboardShortcuts.getKeyString(event)
    const shortcut = keyboardShortcuts.shortcuts.get(key)
    
    if (shortcut) {
      event.preventDefault()
      shortcut.callback(event)
    }
  },
  
  // Convert event to key string
  getKeyString: (event) => {
    const modifiers = []
    
    if (event.ctrlKey || event.metaKey) modifiers.push('Ctrl')
    if (event.shiftKey) modifiers.push('Shift')
    if (event.altKey) modifiers.push('Alt')
    
    const key = event.key.toUpperCase()
    
    if (modifiers.length > 0) {
      return `${modifiers.join('+')}+${key}`
    }
    
    return key
  },
  
  // Initialize default shortcuts
  initialize: (appFunctions) => {
    // Navigation shortcuts
    keyboardShortcuts.register('Ctrl+N', () => {
      appFunctions.createNewChat()
    }, 'Create new chat')
    
    keyboardShortcuts.register('Ctrl+O', () => {
      appFunctions.toggleSidebar()
    }, 'Toggle sidebar')
    
    keyboardShortcuts.register('Escape', () => {
      appFunctions.closeModals()
    }, 'Close modals')
    
    // Chat shortcuts
    keyboardShortcuts.register('Ctrl+F', () => {
      appFunctions.openSearch()
    }, 'Search in chat')
    
    keyboardShortcuts.register('Ctrl+S', () => {
      appFunctions.saveChat()
    }, 'Save chat')
    
    keyboardShortcuts.register('Ctrl+E', () => {
      appFunctions.exportChat()
    }, 'Export chat')
    
    // Message shortcuts
    keyboardShortcuts.register('Ctrl+Enter', () => {
      appFunctions.sendMessage()
    }, 'Send message')
    
    keyboardShortcuts.register('Ctrl+Up', () => {
      appFunctions.previousMessage()
    }, 'Previous message')
    
    keyboardShortcuts.register('Ctrl+Down', () => {
      appFunctions.nextMessage()
    }, 'Next message')
    
    // Theme shortcuts
    keyboardShortcuts.register('Ctrl+T', () => {
      appFunctions.toggleTheme()
    }, 'Toggle theme')
    
    // Voice shortcuts
    keyboardShortcuts.register('Ctrl+V', () => {
      appFunctions.toggleVoiceMode()
    }, 'Toggle voice mode')
    
    // Settings shortcuts
    keyboardShortcuts.register('Ctrl+,', () => {
      appFunctions.openSettings()
    }, 'Open settings')
    
    // Help shortcuts
    keyboardShortcuts.register('F1', () => {
      appFunctions.showHelp()
    }, 'Show help')
    
    // Add event listener
    document.addEventListener('keydown', keyboardShortcuts.handleKeyDown)
  },
  
  // Get all registered shortcuts
  getShortcuts: () => {
    const shortcuts = []
    keyboardShortcuts.shortcuts.forEach((value, key) => {
      shortcuts.push({
        key,
        description: value.description
      })
    })
    return shortcuts.sort((a, b) => a.key.localeCompare(b.key))
  },
  
  // Cleanup
  cleanup: () => {
    document.removeEventListener('keydown', keyboardShortcuts.handleKeyDown)
    keyboardShortcuts.shortcuts.clear()
  }
}
