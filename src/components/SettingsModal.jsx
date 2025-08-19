import React from 'react'
import { X, Palette, Moon, Sun, Zap, Crown, Database, Trash2 } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { cookieUtils } from '../utils/cookies.js'

const SettingsModal = ({ isOpen, onClose }) => {
  const { currentTheme, themes, changeTheme } = useTheme()

  if (!isOpen) return null

  const themeIcons = {
    dark: Moon,
    light: Sun,
    blue: Zap,
    purple: Crown
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4">
        <div className="bg-dark-900 border border-dark-700 rounded-xl shadow-2xl w-full max-w-sm md:max-w-md max-h-[90vh] md:max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-dark-700">
            <div className="flex items-center gap-2 md:gap-3">
              <Palette className="w-4 h-4 md:w-5 md:h-5 text-primary-500" />
              <h2 className="text-base md:text-lg font-semibold text-white">Settings(soon)</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 md:p-2 rounded-lg hover:bg-dark-800 text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} className="md:w-5 md:h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Theme Selection */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3 md:mb-4">Choose Theme</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                {Object.entries(themes).map(([key, theme]) => {
                  const Icon = themeIcons[key]
                  const isActive = currentTheme === key
                  
                  return (
                    <button
                      key={key}
                      onClick={() => changeTheme(key)}
                      className={`relative p-4 rounded-lg border-2 transition-all ${
                        isActive 
                          ? 'border-primary-500 bg-primary-500 bg-opacity-10' 
                          : 'border-dark-600 bg-dark-800 hover:border-dark-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isActive ? 'bg-primary-500' : 'bg-dark-700'
                        }`}>
                          <Icon className={`w-4 h-4 ${
                            isActive ? 'text-white' : 'text-gray-400'
                          }`} />
                        </div>
                        <div className="text-left">
                          <p className={`text-sm font-medium ${
                            isActive ? 'text-white' : 'text-gray-300'
                          }`}>
                            {theme.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {theme.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute top-2 right-2 w-3 h-3 bg-primary-500 rounded-full" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Theme Preview */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">Preview</h3>
              <div 
                className="p-4 rounded-lg border border-dark-600"
                style={{
                  backgroundColor: themes[currentTheme]?.surface,
                  color: themes[currentTheme]?.text
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: themes[currentTheme]?.primary }}
                  >
                    <span className="text-white text-sm font-semibold">N</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Nivi</p>
                    <p className="text-xs" style={{ color: themes[currentTheme]?.textSecondary }}>
                      Creator
                    </p>
                  </div>
                </div>
                <p className="text-sm" style={{ color: themes[currentTheme]?.textSecondary }}>
                  This is how your chat interface will look with the {themes[currentTheme]?.name.toLowerCase()} theme.
                </p>
              </div>
            </div>

            {/* Data Management */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">Data Management</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    cookieUtils.debugCookies()
                    alert('Check browser console for cookie debug info!')
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Database size={16} />
                  Debug Cookies
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all chat data? This cannot be undone.')) {
                      cookieUtils.clearAllData()
                      alert('All data cleared! Please refresh the page.')
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SettingsModal
