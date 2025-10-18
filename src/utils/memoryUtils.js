/**
 * Memory Management Utilities for AI Chat
 * Provides enhanced conversation memory and context management
 */

// Configuration for memory management
const MEMORY_CONFIG = {
  MAX_CONTEXT_MESSAGES: 20, // Maximum messages to include in context
  MAX_SUMMARY_MESSAGES: 50, // When to create a summary
  SUMMARY_THRESHOLD: 30, // Messages before creating summary
  CONTEXT_WINDOW_SIZE: 10, // Recent messages to always include
  RELEVANCE_THRESHOLD: 0.3, // Minimum relevance score for context inclusion
  MAX_MEMORY_SIZE: 1000, // Maximum total memory entries
  PERSISTENCE_KEY: 'nivi_chat_memory'
}

/**
 * Calculate relevance score between two messages
 * @param {Object} message1 - First message
 * @param {Object} message2 - Second message
 * @returns {number} Relevance score between 0 and 1
 */
function calculateRelevance(message1, message2) {
  if (!message1 || !message2) return 0
  
  const content1 = message1.content?.toLowerCase() || ''
  const content2 = message2.content?.toLowerCase() || ''
  
  // Extract keywords from messages
  const keywords1 = extractKeywords(content1)
  const keywords2 = extractKeywords(content2)
  
  // Calculate keyword overlap
  const commonKeywords = keywords1.filter(keyword => keywords2.includes(keyword))
  const totalKeywords = new Set([...keywords1, ...keywords2]).size
  
  if (totalKeywords === 0) return 0
  
  const keywordScore = commonKeywords.length / totalKeywords
  
  // Calculate content similarity
  const contentSimilarity = calculateTextSimilarity(content1, content2)
  
  // Weighted combination
  return (keywordScore * 0.6) + (contentSimilarity * 0.4)
}

/**
 * Extract keywords from text content
 * @param {string} text - Text to extract keywords from
 * @returns {Array} Array of keywords
 */
function extractKeywords(text) {
  // Remove common stop words and extract meaningful words
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
  ])
  
  return text
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word.toLowerCase()))
    .map(word => word.toLowerCase())
}

/**
 * Calculate text similarity using simple cosine similarity
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @returns {number} Similarity score between 0 and 1
 */
function calculateTextSimilarity(text1, text2) {
  const words1 = text1.split(/\s+/)
  const words2 = text2.split(/\s+/)
  
  const allWords = new Set([...words1, ...words2])
  const vector1 = Array.from(allWords).map(word => words1.filter(w => w === word).length)
  const vector2 = Array.from(allWords).map(word => words2.filter(w => w === word).length)
  
  // Calculate cosine similarity
  const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0)
  const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0))
  const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0))
  
  if (magnitude1 === 0 || magnitude2 === 0) return 0
  
  return dotProduct / (magnitude1 * magnitude2)
}

/**
 * Create a summary of conversation history
 * @param {Array} messages - Array of messages to summarize
 * @returns {Object} Summary object with key topics and context
 */
function createConversationSummary(messages) {
  const userMessages = messages.filter(msg => msg.type === 'user')
  const botMessages = messages.filter(msg => msg.type === 'bot')
  
  // Extract key topics from user messages
  const topics = new Set()
  userMessages.forEach(msg => {
    const keywords = extractKeywords(msg.content)
    keywords.forEach(keyword => {
      if (keyword.length > 3) { // Only include meaningful keywords
        topics.add(keyword)
      }
    })
  })
  
  // Extract important context from recent messages
  const recentContext = messages.slice(-5).map(msg => ({
    type: msg.type,
    content: msg.content.substring(0, 100), // First 100 characters
    timestamp: msg.timestamp
  }))
  
  return {
    totalMessages: messages.length,
    userMessages: userMessages.length,
    botMessages: botMessages.length,
    topics: Array.from(topics).slice(0, 10), // Top 10 topics
    recentContext,
    createdAt: new Date().toISOString(),
    lastMessageTime: messages[messages.length - 1]?.timestamp
  }
}

/**
 * Select relevant messages for context based on current message
 * @param {Array} allMessages - All available messages
 * @param {Object} currentMessage - Current user message
 * @returns {Array} Selected messages for context
 */
function selectRelevantContext(allMessages, currentMessage) {
  if (allMessages.length <= MEMORY_CONFIG.CONTEXT_WINDOW_SIZE) {
    return allMessages
  }
  
  // Always include recent messages
  const recentMessages = allMessages.slice(-MEMORY_CONFIG.CONTEXT_WINDOW_SIZE)
  
  // Calculate relevance scores for older messages
  const olderMessages = allMessages.slice(0, -MEMORY_CONFIG.CONTEXT_WINDOW_SIZE)
  const scoredMessages = olderMessages.map(msg => ({
    message: msg,
    relevance: calculateRelevance(msg, currentMessage)
  }))
  
  // Filter and sort by relevance
  const relevantMessages = scoredMessages
    .filter(item => item.relevance >= MEMORY_CONFIG.RELEVANCE_THRESHOLD)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, MEMORY_CONFIG.MAX_CONTEXT_MESSAGES - MEMORY_CONFIG.CONTEXT_WINDOW_SIZE)
    .map(item => item.message)
  
  // Combine recent and relevant messages, removing duplicates
  const allSelectedMessages = [...relevantMessages, ...recentMessages]
  
  // Remove duplicates based on message ID and timestamp
  const uniqueMessages = allSelectedMessages.filter((msg, index, self) => 
    index === self.findIndex(m => 
      m.id === msg.id && 
      m.timestamp === msg.timestamp && 
      m.content === msg.content
    )
  )
  
  return uniqueMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
}

/**
 * Enhanced conversation history preparation with memory management
 * @param {Array} currentMessages - Current conversation messages
 * @param {Object} currentUserMessage - Current user message
 * @param {Object} memoryData - Stored memory data
 * @returns {Object} Enhanced conversation context
 */
export function prepareConversationContext(currentMessages, currentUserMessage, memoryData = null) {
  // Filter out welcome messages and system messages
  const filteredMessages = currentMessages.filter(msg => 
    msg.type !== 'bot' || !msg.content.includes("Hello! I'm your AI assistant")
  )
  
  console.log('📝 Preparing conversation context:', {
    totalMessages: filteredMessages.length,
    currentMessage: currentUserMessage.content.substring(0, 50) + '...'
  })
  
  // Check if we need to create a summary
  let summary = null
  let contextMessages = filteredMessages
  
  if (filteredMessages.length > MEMORY_CONFIG.SUMMARY_THRESHOLD) {
    // Create summary for older messages
    const oldMessages = filteredMessages.slice(0, -MEMORY_CONFIG.CONTEXT_WINDOW_SIZE)
    const recentMessages = filteredMessages.slice(-MEMORY_CONFIG.CONTEXT_WINDOW_SIZE)
    
    console.log('📊 Creating summary for', oldMessages.length, 'older messages')
    summary = createConversationSummary(oldMessages)
    contextMessages = recentMessages
  }
  
  // Select relevant context if we have memory data
  if (memoryData && memoryData.previousSummaries) {
    const relevantSummaries = memoryData.previousSummaries.filter(s => 
      s.topics.some(topic => 
        currentUserMessage.content.toLowerCase().includes(topic.toLowerCase())
      )
    )
    
    if (relevantSummaries.length > 0) {
      console.log('🔍 Found', relevantSummaries.length, 'relevant previous summaries')
      // Add relevant summary context
      summary = {
        ...summary,
        relevantSummaries: relevantSummaries.slice(0, 3) // Max 3 relevant summaries
      }
    }
  }
  
  // Select relevant messages for context
  const selectedMessages = selectRelevantContext(contextMessages, currentUserMessage)
  console.log('✅ Selected', selectedMessages.length, 'messages for context')
  
  // Convert to API format, ensuring no duplicates
  const conversationHistory = selectedMessages
    .filter((msg, index, self) => 
      // Remove duplicates based on content and timestamp
      index === self.findIndex(m => 
        m.content === msg.content && 
        m.timestamp === msg.timestamp &&
        m.type === msg.type
      )
    )
    .map(msg => ({
      role: msg.type === 'user' ? 'user' : 'model',
      parts: msg.files && msg.files.length > 0 
        ? [
            { text: msg.content },
            ...msg.files.map(file => ({
              inlineData: {
                mimeType: file.type,
                data: file.dataUrl ? file.dataUrl.split(',')[1] : null
              }
            })).filter(file => file.inlineData.data)
          ]
        : [{ text: msg.content }]
    }))
  
  console.log('🤖 Conversation history prepared:', {
    historyLength: conversationHistory.length,
    hasSummary: !!summary,
    contextSize: selectedMessages.length
  })
  
  return {
    conversationHistory,
    summary,
    contextSize: selectedMessages.length,
    totalMessages: filteredMessages.length
  }
}

/**
 * Update memory data with new conversation information
 * @param {Object} currentMemory - Current memory data
 * @param {Array} messages - Current conversation messages
 * @param {Object} summary - Conversation summary if created
 * @returns {Object} Updated memory data
 */
export function updateMemoryData(currentMemory, messages, summary) {
  const memory = currentMemory || {
    previousSummaries: [],
    lastUpdated: null,
    totalSessions: 0
  }
  
  // Add new summary if created
  if (summary) {
    memory.previousSummaries.push(summary)
    
    // Limit number of stored summaries
    if (memory.previousSummaries.length > 10) {
      memory.previousSummaries = memory.previousSummaries.slice(-10)
    }
  }
  
  memory.lastUpdated = new Date().toISOString()
  memory.totalSessions = (memory.totalSessions || 0) + 1
  
  return memory
}

/**
 * Save memory data to localStorage
 * @param {Object} memoryData - Memory data to save
 */
export function saveMemoryToStorage(memoryData) {
  try {
    localStorage.setItem(MEMORY_CONFIG.PERSISTENCE_KEY, JSON.stringify(memoryData))
  } catch (error) {
    console.warn('Failed to save memory data to localStorage:', error)
  }
}

/**
 * Load memory data from localStorage
 * @returns {Object} Loaded memory data or null
 */
export function loadMemoryFromStorage() {
  try {
    const stored = localStorage.getItem(MEMORY_CONFIG.PERSISTENCE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.warn('Failed to load memory data from localStorage:', error)
    return null
  }
}

/**
 * Clear all memory data
 */
export function clearMemoryData() {
  try {
    localStorage.removeItem(MEMORY_CONFIG.PERSISTENCE_KEY)
  } catch (error) {
    console.warn('Failed to clear memory data:', error)
  }
}

/**
 * Get memory statistics
 * @param {Object} memoryData - Memory data
 * @returns {Object} Memory statistics
 */
export function getMemoryStats(memoryData) {
  if (!memoryData) {
    return {
      totalSummaries: 0,
      totalSessions: 0,
      lastUpdated: null,
      memorySize: 0
    }
  }
  
  return {
    totalSummaries: memoryData.previousSummaries?.length || 0,
    totalSessions: memoryData.totalSessions || 0,
    lastUpdated: memoryData.lastUpdated,
    memorySize: JSON.stringify(memoryData).length
  }
}

export default {
  prepareConversationContext,
  updateMemoryData,
  saveMemoryToStorage,
  loadMemoryFromStorage,
  clearMemoryData,
  getMemoryStats,
  MEMORY_CONFIG
}
