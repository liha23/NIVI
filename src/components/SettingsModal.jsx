import React, { useState } from 'react'
import { 
  X, 
  Palette, 
  Moon, 
  Sun, 
  Zap, 
  Crown, 
  Database, 
  Trash2,
  Monitor,
  Smartphone,
  Volume2,
  VolumeX,
  Globe,
  Shield,
  Download,
  Upload,
  Sparkles,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Settings as SettingsIcon,
  Brain
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { cookieUtils } from '../utils/cookies.js'
import { getMemoryStats, clearMemoryData } from '../utils/memoryUtils'

const SettingsModal = () => {
  const { currentTheme, themes, changeTheme, toggleSettings } = useTheme()
  const [activeTab, setActiveTab] = useState('appearance')
  const [settings, setSettings] = useState({
    fontSize: 'medium',
    voiceSpeed: 1.0,
    autoSpeech: false,
    soundEffects: true,
    animations: true,
    compactMode: false,
    showTimestamps: true,
    language: 'en'
  })
  
  const [memoryStats, setMemoryStats] = useState(null)

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'voice', label: 'Voice & Audio', icon: Volume2 },
    { id: 'behavior', label: 'Behavior', icon: SettingsIcon },
    { id: 'data', label: 'Data & Privacy', icon: Shield }
  ]

  const themeData = [
    { key: 'midnight', icon: Moon, gradient: 'from-neutral-900 to-neutral-950' },
    { key: 'aurora', icon: Sparkles, gradient: 'from-indigo-900 to-purple-900' },
    { key: 'ocean', icon: Zap, gradient: 'from-blue-900 to-cyan-900' },
    { key: 'forest', icon: Globe, gradient: 'from-green-900 to-emerald-900' },
    { key: 'sunset', icon: Sun, gradient: 'from-orange-900 to-pink-900' }
  ]

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    // Save to localStorage or cookies
    cookieUtils.setCookie(`setting_${key}`, value)
  }

  // Load memory stats on component mount
  React.useEffect(() => {
    const stats = getMemoryStats()
    setMemoryStats(stats)
  }, [])

  const handleClearMemory = () => {
    if (confirm('Are you sure you want to clear all AI memory data? This will reset the AI\'s ability to remember previous conversations. This action cannot be undone.')) {
      clearMemoryData()
      setMemoryStats(getMemoryStats())
      alert('AI memory data cleared successfully!')
    }
  }

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all chat data? This action cannot be undone.')) {
      localStorage.clear()
      location.reload()
    }
  }

  const exportData = () => {
    const data = {
      chats: JSON.parse(localStorage.getItem('chatHistory') || '[]'),
      settings: settings,
      theme: currentTheme
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nivii-ai-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm z-50"
        onClick={toggleSettings}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-neutral-900/95 backdrop-blur-xl border border-neutral-800 rounded-2xl shadow-strong w-full max-w-4xl max-h-[90vh] overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-accent-purple rounded-xl flex items-center justify-center">
                <SettingsIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gradient-primary">Settings</h2>
                <p className="text-sm text-neutral-400">Customize your NIVII AI experience</p>
              </div>
            </div>
            <button
              onClick={toggleSettings}
              className="p-2.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 transition-all duration-200"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex h-[calc(90vh-100px)]">
            {/* Sidebar */}
            <div className="w-64 border-r border-neutral-800/50 p-4 bg-neutral-900/50">
              <nav className="space-y-2">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      activeTab === id
                        ? 'bg-gradient-to-r from-brand-500/20 to-brand-600/20 border border-brand-500/30 text-brand-100'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'appearance' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-200 mb-4 flex items-center gap-2">
                      <Palette size={20} />
                      Themes
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {themeData.map(({ key, icon: Icon, gradient }) => {
                        const theme = themes[key]
                        const isActive = currentTheme === key
                        
                        return (
                          <button
                            key={key}
                            onClick={() => changeTheme(key)}
                            className={`relative p-4 rounded-xl border-2 transition-all duration-300 group ${
                              isActive 
                                ? 'border-brand-500 bg-brand-500/10 shadow-glow' 
                                : 'border-neutral-700 bg-neutral-800/30 hover:border-neutral-600 hover:bg-neutral-800/50'
                            }`}
                          >
                            <div className={`w-full h-16 bg-gradient-to-br ${gradient} rounded-lg mb-3 flex items-center justify-center`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            
                            <div className="text-left">
                              <p className={`font-semibold text-sm ${
                                isActive ? 'text-brand-100' : 'text-neutral-200'
                              }`}>
                                {theme.name}
                              </p>
                              <p className="text-xs text-neutral-500 mt-1">
                                {theme.description}
                              </p>
                            </div>
                            
                            {isActive && (
                              <div className="absolute top-3 right-3 w-3 h-3 bg-brand-500 rounded-full animate-pulse-soft" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-neutral-200 mb-4 flex items-center gap-2">
                      <Eye size={20} />
                      Display Options
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-xl border border-neutral-700/50">
                        <div>
                          <h4 className="font-medium text-neutral-200">Font Size</h4>
                          <p className="text-sm text-neutral-500">Adjust text size for better readability</p>
                        </div>
                        <select
                          value={settings.fontSize}
                          onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                          className="bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-neutral-200 focus:border-brand-500 focus:outline-none"
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-xl border border-neutral-700/50">
                        <div>
                          <h4 className="font-medium text-neutral-200">Animations</h4>
                          <p className="text-sm text-neutral-500">Enable smooth transitions and effects</p>
                        </div>
                        <button
                          onClick={() => handleSettingChange('animations', !settings.animations)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            settings.animations ? 'bg-brand-500' : 'bg-neutral-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            settings.animations ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-xl border border-neutral-700/50">
                        <div>
                          <h4 className="font-medium text-neutral-200">Show Timestamps</h4>
                          <p className="text-sm text-neutral-500">Display message timestamps</p>
                        </div>
                        <button
                          onClick={() => handleSettingChange('showTimestamps', !settings.showTimestamps)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            settings.showTimestamps ? 'bg-brand-500' : 'bg-neutral-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            settings.showTimestamps ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'voice' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-200 mb-4 flex items-center gap-2">
                      <Volume2 size={20} />
                      Voice Settings
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-neutral-800/30 rounded-xl border border-neutral-700/50">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-neutral-200">Speech Speed</h4>
                          <span className="text-sm text-neutral-400">{settings.voiceSpeed}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={settings.voiceSpeed}
                          onChange={(e) => handleSettingChange('voiceSpeed', parseFloat(e.target.value))}
                          className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-neutral-500 mt-1">
                          <span>Slow</span>
                          <span>Normal</span>
                          <span>Fast</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-xl border border-neutral-700/50">
                        <div>
                          <h4 className="font-medium text-neutral-200">Auto Speech</h4>
                          <p className="text-sm text-neutral-500">Automatically read bot responses</p>
                        </div>
                        <button
                          onClick={() => handleSettingChange('autoSpeech', !settings.autoSpeech)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            settings.autoSpeech ? 'bg-brand-500' : 'bg-neutral-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            settings.autoSpeech ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-xl border border-neutral-700/50">
                        <div>
                          <h4 className="font-medium text-neutral-200">Sound Effects</h4>
                          <p className="text-sm text-neutral-500">Play sounds for interactions</p>
                        </div>
                        <button
                          onClick={() => handleSettingChange('soundEffects', !settings.soundEffects)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            settings.soundEffects ? 'bg-brand-500' : 'bg-neutral-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            settings.soundEffects ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'behavior' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-200 mb-4 flex items-center gap-2">
                      <SettingsIcon size={20} />
                      Chat Behavior
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-xl border border-neutral-700/50">
                        <div>
                          <h4 className="font-medium text-neutral-200">Compact Mode</h4>
                          <p className="text-sm text-neutral-500">Reduce spacing for more content</p>
                        </div>
                        <button
                          onClick={() => handleSettingChange('compactMode', !settings.compactMode)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            settings.compactMode ? 'bg-brand-500' : 'bg-neutral-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            settings.compactMode ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>

                      <div className="p-4 bg-neutral-800/30 rounded-xl border border-neutral-700/50">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-neutral-200">Language</h4>
                        </div>
                        <select
                          value={settings.language}
                          onChange={(e) => handleSettingChange('language', e.target.value)}
                          className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-neutral-200 focus:border-brand-500 focus:outline-none"
                        >
                          <option value="en">English</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                          <option value="de">Deutsch</option>
                          <option value="ja">日本語</option>
                          <option value="ko">한국어</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-200 mb-4 flex items-center gap-2">
                      <Database size={20} />
                      Data Management
                    </h3>
                    <div className="space-y-4">
                      <button
                        onClick={exportData}
                        className="w-full flex items-center justify-between p-4 bg-neutral-800/30 rounded-xl border border-neutral-700/50 hover:bg-neutral-800/50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <Download size={20} className="text-brand-400" />
                          <div className="text-left">
                            <h4 className="font-medium text-neutral-200">Export Data</h4>
                            <p className="text-sm text-neutral-500">Download your chats and settings</p>
                          </div>
                        </div>
                        <div className="text-brand-400 group-hover:translate-x-1 transition-transform">→</div>
                      </button>

                      {/* Memory Management Section */}
                      <div className="p-4 bg-gradient-to-r from-brand-500/10 to-accent-purple/10 border border-brand-500/30 rounded-xl">
                        <div className="flex items-center gap-3 mb-4">
                          <Brain size={20} className="text-brand-400" />
                          <h4 className="font-medium text-brand-200">AI Memory Management</h4>
                        </div>
                        <p className="text-sm text-neutral-400 mb-4">
                          The AI can remember previous conversations to provide better contextual responses.
                        </p>
                        
                        {memoryStats && (
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-neutral-800/30 rounded-lg p-3">
                              <div className="text-xs text-neutral-500 mb-1">Memory Summaries</div>
                              <div className="text-lg font-semibold text-brand-400">{memoryStats.totalSummaries}</div>
                            </div>
                            <div className="bg-neutral-800/30 rounded-lg p-3">
                              <div className="text-xs text-neutral-500 mb-1">Total Sessions</div>
                              <div className="text-lg font-semibold text-brand-400">{memoryStats.totalSessions}</div>
                            </div>
                          </div>
                        )}
                        
                        <button
                          onClick={handleClearMemory}
                          className="w-full flex items-center justify-center gap-2 p-3 bg-error-500/20 border border-error-500/30 rounded-lg text-error-400 hover:bg-error-500/30 transition-colors"
                        >
                          <Trash2 size={16} />
                          Clear AI Memory
                        </button>
                      </div>

                      <div className="p-4 bg-error-500/10 border border-error-500/30 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                          <Trash2 size={20} className="text-error-400" />
                          <h4 className="font-medium text-error-200">Danger Zone</h4>
                        </div>
                        <p className="text-sm text-error-300 mb-4">
                          This will permanently delete all your chat history, settings, and bookmarks. This action cannot be undone.
                        </p>
                        <button
                          onClick={clearAllData}
                          className="w-full py-2 px-4 bg-error-500 hover:bg-error-600 text-white rounded-lg transition-colors font-medium"
                        >
                          Clear All Data
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-neutral-200 mb-4 flex items-center gap-2">
                      <Shield size={20} />
                      Privacy & Security
                    </h3>
                    <div className="p-4 bg-neutral-800/30 rounded-xl border border-neutral-700/50">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-accent-emerald rounded-full"></div>
                          <span className="text-sm text-neutral-300">All conversations are stored locally</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-accent-emerald rounded-full"></div>
                          <span className="text-sm text-neutral-300">No data is sent to third parties</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-accent-emerald rounded-full"></div>
                          <span className="text-sm text-neutral-300">End-to-end encryption for API calls</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SettingsModal
