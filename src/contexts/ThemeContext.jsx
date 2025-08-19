import React, { createContext, useContext, useState, useEffect } from 'react'
import { config } from '../../config.js'
import { cookieUtils } from '../utils/cookies.js'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(config.DEFAULT_THEME)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Load theme from cookies on mount
  useEffect(() => {
    const savedTheme = cookieUtils.getCookie('theme')
    if (savedTheme && config.THEMES[savedTheme]) {
      setCurrentTheme(savedTheme)
    }
  }, [])

  // Apply theme to document
  useEffect(() => {
    const theme = config.THEMES[currentTheme]
    if (theme) {
      document.documentElement.style.setProperty('--color-primary', theme.primary)
      document.documentElement.style.setProperty('--color-background', theme.background)
      document.documentElement.style.setProperty('--color-surface', theme.surface)
      document.documentElement.style.setProperty('--color-text', theme.text)
      document.documentElement.style.setProperty('--color-text-secondary', theme.textSecondary)
      
      // Save to cookies
      cookieUtils.setCookie('theme', currentTheme)
    }
  }, [currentTheme])

  const changeTheme = (themeName) => {
    if (config.THEMES[themeName]) {
      setCurrentTheme(themeName)
    }
  }

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen)
  }

  const value = {
    currentTheme,
    themes: config.THEMES,
    changeTheme,
    isSettingsOpen,
    toggleSettings
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
