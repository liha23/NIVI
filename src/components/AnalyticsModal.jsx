import React, { useState, useEffect } from 'react'
import { X, BarChart3, Clock, MessageSquare, TrendingUp, Activity, Target, Users, Zap } from 'lucide-react'
import { analyticsUtils } from '../utils/analyticsUtils'

const AnalyticsModal = ({ isOpen, onClose, messages, chatHistory = [] }) => {
  const [analytics, setAnalytics] = useState(null)
  const [timeRange, setTimeRange] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen && messages) {
      setIsLoading(true)
      const insights = analyticsUtils.generateInsights(messages, chatHistory)
      setAnalytics(insights)
      setIsLoading(false)
    }
  }, [isOpen, messages, chatHistory])

  if (!isOpen) return null

  const formatTime = (ms) => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    if (ms < 60000) return `${Math.round(ms / 1000)}s`
    return `${Math.round(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getEngagementColor = (level) => {
    switch (level) {
      case 'high': return 'text-green-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'text-primary-500' }) => (
    <div className="bg-dark-800 rounded-lg p-4 border border-dark-700">
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-5 h-5 ${color}`} />
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )

  const InsightCard = ({ insight, type = 'info' }) => {
    const colors = {
      info: 'border-blue-500 bg-blue-500 bg-opacity-10',
      success: 'border-green-500 bg-green-500 bg-opacity-10',
      warning: 'border-yellow-500 bg-yellow-500 bg-opacity-10',
      error: 'border-red-500 bg-red-500 bg-opacity-10'
    }
    
    return (
      <div className={`p-3 rounded-lg border ${colors[type]}`}>
        <p className="text-sm text-white">{insight}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-dark-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-dark-900 border border-dark-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-700">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-white">Chat Analytics</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-dark-800 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {analytics && (
              <div className="space-y-6">
                {/* Overview Stats */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      icon={MessageSquare}
                      title="Total Messages"
                      value={analytics.stats.totalMessages}
                      subtitle={`${analytics.stats.userMessages} user, ${analytics.stats.botMessages} AI`}
                    />
                    <StatCard
                      icon={Target}
                      title="Total Words"
                      value={formatNumber(analytics.stats.totalWords)}
                      subtitle={`${formatNumber(analytics.stats.userWords)} user, ${formatNumber(analytics.stats.botWords)} AI`}
                    />
                    <StatCard
                      icon={Activity}
                      title="Engagement"
                      value={analytics.engagement.activityLevel}
                      subtitle={`${analytics.engagement.recentMessages} recent messages`}
                      color={getEngagementColor(analytics.engagement.activityLevel)}
                    />
                    <StatCard
                      icon={TrendingUp}
                      title="Response Ratio"
                      value={analytics.stats.conversationRatio.toFixed(1)}
                      subtitle="AI responses per user message"
                    />
                  </div>
                </div>

                {/* Response Times */}
                {analytics.responseTimes && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Response Times</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <StatCard
                        icon={Clock}
                        title="Average"
                        value={formatTime(analytics.responseTimes.average)}
                        subtitle={`${analytics.responseTimes.total} responses`}
                      />
                      <StatCard
                        icon={Zap}
                        title="Fastest"
                        value={formatTime(analytics.responseTimes.minimum)}
                        subtitle="Best performance"
                        color="text-green-500"
                      />
                      <StatCard
                        icon={Clock}
                        title="Slowest"
                        value={formatTime(analytics.responseTimes.maximum)}
                        subtitle="Peak load time"
                        color="text-red-500"
                      />
                    </div>
                  </div>
                )}

                {/* Message Length Analysis */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Message Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatCard
                      icon={Users}
                      title="Avg User Message"
                      value={`${analytics.stats.avgUserMessageLength} words`}
                      subtitle="Typical user input length"
                    />
                    <StatCard
                      icon={MessageSquare}
                      title="Avg AI Response"
                      value={`${analytics.stats.avgBotMessageLength} words`}
                      subtitle="Typical AI response length"
                    />
                  </div>
                </div>

                {/* Topic Analysis */}
                {analytics.topics.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Conversation Topics</h3>
                    <div className="space-y-3">
                      {analytics.topics.map((topic, index) => (
                        <div key={topic.topic} className="bg-dark-800 rounded-lg p-4 border border-dark-700">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-white capitalize">{topic.topic}</h4>
                            <span className="text-sm text-gray-400">{topic.score} mentions</span>
                          </div>
                          <div className="w-full bg-dark-700 rounded-full h-2">
                            <div 
                              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${(topic.score / analytics.topics[0].score) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Insights */}
                {analytics.insights.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">AI Insights</h3>
                    <div className="space-y-3">
                      {analytics.insights.map((insight, index) => (
                        <InsightCard 
                          key={index} 
                          insight={insight}
                          type={insight.includes('Fast') || insight.includes('High') ? 'success' : 
                                insight.includes('Slow') || insight.includes('Low') ? 'warning' : 'info'}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Engagement Details */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Engagement Details</h3>
                  <div className="bg-dark-800 rounded-lg p-4 border border-dark-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Recent Activity</p>
                        <p className="text-lg font-semibold text-white">
                          {analytics.engagement.recentMessages} messages
                        </p>
                        <p className="text-xs text-gray-500">Last 24 hours</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Engagement Rate</p>
                        <p className="text-lg font-semibold text-white">
                          {(analytics.engagement.engagementRate * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500">Recent vs total</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Activity Level</p>
                        <p className={`text-lg font-semibold capitalize ${getEngagementColor(analytics.engagement.activityLevel)}`}>
                          {analytics.engagement.activityLevel}
                        </p>
                        <p className="text-xs text-gray-500">Based on recent activity</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default AnalyticsModal
