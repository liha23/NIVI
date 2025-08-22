export const analyticsUtils = {
  // Calculate response time statistics
  calculateResponseTimes: (messages) => {
    const responseTimes = []
    
    for (let i = 0; i < messages.length - 1; i++) {
      const currentMessage = messages[i]
      const nextMessage = messages[i + 1]
      
      if (currentMessage.type === 'user' && nextMessage.type === 'bot') {
        const userTime = new Date(currentMessage.timestamp).getTime()
        const botTime = new Date(nextMessage.timestamp).getTime()
        const responseTime = botTime - userTime
        responseTimes.push(responseTime)
      }
    }
    
    if (responseTimes.length === 0) return null
    
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    const minResponseTime = Math.min(...responseTimes)
    const maxResponseTime = Math.max(...responseTimes)
    
    return {
      average: avgResponseTime,
      minimum: minResponseTime,
      maximum: maxResponseTime,
      total: responseTimes.length,
      times: responseTimes
    }
  },

  // Calculate conversation statistics
  calculateConversationStats: (messages) => {
    const userMessages = messages.filter(msg => msg.type === 'user')
    const botMessages = messages.filter(msg => msg.type === 'bot')
    
    const totalWords = messages.reduce((count, msg) => {
      return count + (msg.content?.split(/\s+/).length || 0)
    }, 0)
    
    const userWords = userMessages.reduce((count, msg) => {
      return count + (msg.content?.split(/\s+/).length || 0)
    }, 0)
    
    const botWords = botMessages.reduce((count, msg) => {
      return count + (msg.content?.split(/\s+/).length || 0)
    }, 0)
    
    const avgUserMessageLength = userMessages.length > 0 ? userWords / userMessages.length : 0
    const avgBotMessageLength = botMessages.length > 0 ? botWords / botMessages.length : 0
    
    return {
      totalMessages: messages.length,
      userMessages: userMessages.length,
      botMessages: botMessages.length,
      totalWords,
      userWords,
      botWords,
      avgUserMessageLength: Math.round(avgUserMessageLength),
      avgBotMessageLength: Math.round(avgBotMessageLength),
      conversationRatio: userMessages.length > 0 ? botMessages.length / userMessages.length : 0
    }
  },

  // Analyze conversation topics
  analyzeTopics: (messages) => {
    const content = messages.map(msg => msg.content).join(' ').toLowerCase()
    const topics = {
      coding: ['code', 'programming', 'javascript', 'python', 'html', 'css', 'function', 'variable', 'loop', 'array', 'object', 'class', 'api', 'database', 'server', 'client', 'framework', 'library', 'git', 'debug', 'error', 'bug', 'test', 'deploy'],
      writing: ['write', 'content', 'article', 'blog', 'essay', 'story', 'creative', 'narrative', 'description', 'summary', 'review', 'analysis', 'report', 'documentation'],
      research: ['research', 'study', 'analysis', 'data', 'statistics', 'survey', 'experiment', 'findings', 'conclusion', 'methodology', 'hypothesis', 'theory'],
      business: ['business', 'marketing', 'strategy', 'plan', 'project', 'management', 'team', 'leadership', 'sales', 'customer', 'product', 'service', 'revenue', 'profit', 'growth'],
      education: ['learn', 'teach', 'education', 'course', 'lesson', 'tutorial', 'explain', 'understand', 'concept', 'theory', 'practice', 'study', 'homework', 'assignment'],
      general: ['help', 'question', 'answer', 'explain', 'how', 'what', 'why', 'when', 'where', 'who', 'which']
    }
    
    const topicScores = {}
    
    Object.entries(topics).forEach(([topic, keywords]) => {
      const score = keywords.reduce((count, keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g')
        const matches = content.match(regex)
        return count + (matches ? matches.length : 0)
      }, 0)
      
      if (score > 0) {
        topicScores[topic] = score
      }
    })
    
    // Sort topics by score
    const sortedTopics = Object.entries(topicScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([topic, score]) => ({ topic, score }))
    
    return sortedTopics
  },

  // Calculate user engagement metrics
  calculateEngagement: (messages, timeSpan = 24 * 60 * 60 * 1000) => {
    const now = new Date().getTime()
    const recentMessages = messages.filter(msg => {
      const msgTime = new Date(msg.timestamp).getTime()
      return (now - msgTime) <= timeSpan
    })
    
    const userMessages = recentMessages.filter(msg => msg.type === 'user')
    const botMessages = recentMessages.filter(msg => msg.type === 'bot')
    
    return {
      recentMessages: recentMessages.length,
      recentUserMessages: userMessages.length,
      recentBotMessages: botMessages.length,
      engagementRate: messages.length > 0 ? recentMessages.length / messages.length : 0,
      activityLevel: recentMessages.length > 10 ? 'high' : recentMessages.length > 5 ? 'medium' : 'low'
    }
  },

  // Generate conversation insights
  generateInsights: (messages, chatHistory = []) => {
    const responseTimes = analyticsUtils.calculateResponseTimes(messages)
    const stats = analyticsUtils.calculateConversationStats(messages)
    const topics = analyticsUtils.analyzeTopics(messages)
    const engagement = analyticsUtils.calculateEngagement(messages)
    
    const insights = []
    
    // Response time insights
    if (responseTimes) {
      if (responseTimes.average < 5000) {
        insights.push('Fast response times indicate good AI performance')
      } else if (responseTimes.average > 15000) {
        insights.push('Slow response times suggest high server load or complex queries')
      }
    }
    
    // Conversation length insights
    if (stats.totalMessages > 50) {
      insights.push('Long conversation - consider breaking into smaller chats')
    } else if (stats.totalMessages < 5) {
      insights.push('Short conversation - try asking follow-up questions')
    }
    
    // Topic insights
    if (topics.length > 0) {
      const mainTopic = topics[0]
      insights.push(`Primary focus: ${mainTopic.topic} (${mainTopic.score} mentions)`)
    }
    
    // Engagement insights
    if (engagement.activityLevel === 'high') {
      insights.push('High engagement - user is actively participating')
    } else if (engagement.activityLevel === 'low') {
      insights.push('Low engagement - consider more interactive prompts')
    }
    
    // Word count insights
    if (stats.avgBotMessageLength > 200) {
      insights.push('Detailed AI responses - good for complex topics')
    } else if (stats.avgBotMessageLength < 50) {
      insights.push('Brief AI responses - consider asking for more detail')
    }
    
    return {
      responseTimes,
      stats,
      topics,
      engagement,
      insights
    }
  },

  // Track user behavior
  trackUserBehavior: (action, data = {}) => {
    const behavior = {
      action,
      timestamp: new Date().toISOString(),
      data,
      sessionId: sessionStorage.getItem('sessionId') || Date.now().toString()
    }
    
    // Store in localStorage for analytics
    const behaviors = JSON.parse(localStorage.getItem('userBehaviors') || '[]')
    behaviors.push(behavior)
    
    // Keep only last 1000 behaviors
    if (behaviors.length > 1000) {
      behaviors.splice(0, behaviors.length - 1000)
    }
    
    localStorage.setItem('userBehaviors', JSON.stringify(behaviors))
    
    // Store session ID
    if (!sessionStorage.getItem('sessionId')) {
      sessionStorage.setItem('sessionId', behavior.sessionId)
    }
  },

  // Get user behavior analytics
  getUserBehaviorAnalytics: () => {
    const behaviors = JSON.parse(localStorage.getItem('userBehaviors') || '[]')
    const now = new Date().getTime()
    const dayAgo = now - (24 * 60 * 60 * 1000)
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000)
    
    const recentBehaviors = behaviors.filter(b => {
      const behaviorTime = new Date(b.timestamp).getTime()
      return behaviorTime > dayAgo
    })
    
    const weeklyBehaviors = behaviors.filter(b => {
      const behaviorTime = new Date(b.timestamp).getTime()
      return behaviorTime > weekAgo
    })
    
    // Count action types
    const actionCounts = behaviors.reduce((acc, behavior) => {
      acc[behavior.action] = (acc[behavior.action] || 0) + 1
      return acc
    }, {})
    
    return {
      totalActions: behaviors.length,
      recentActions: recentBehaviors.length,
      weeklyActions: weeklyBehaviors.length,
      actionCounts,
      mostCommonAction: Object.entries(actionCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none'
    }
  }
}
