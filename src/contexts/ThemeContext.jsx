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

  // Apply theme to document with modern CSS variables
  useEffect(() => {
    const theme = config.THEMES[currentTheme]
    if (theme) {
      const root = document.documentElement
      
      // Apply theme colors
      root.style.setProperty('--color-primary', theme.primary)
      root.style.setProperty('--color-primary-hover', theme.primary + 'dd')
      root.style.setProperty('--color-secondary', theme.secondary)
      root.style.setProperty('--color-background', theme.background)
      root.style.setProperty('--color-surface', theme.surface)
      root.style.setProperty('--color-surface-hover', theme.surfaceHover)
      root.style.setProperty('--color-border', theme.border)
      root.style.setProperty('--color-text', theme.text)
      root.style.setProperty('--color-text-secondary', theme.textSecondary)
      root.style.setProperty('--color-text-muted', theme.textMuted)
      root.style.setProperty('--color-accent', theme.accent)
      root.style.setProperty('--color-success', theme.success)
      root.style.setProperty('--color-warning', theme.warning)
      root.style.setProperty('--color-error', theme.error)
      
      // Generate gradients
      root.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`)
      root.style.setProperty('--gradient-accent', `linear-gradient(135deg, ${theme.secondary} 0%, ${theme.primary} 100%)`)
      root.style.setProperty('--gradient-surface', `linear-gradient(135deg, ${theme.surface} 0%, ${theme.surfaceHover} 100%)`)
      
      // Add theme class to body for additional styling
      document.body.className = `theme-${currentTheme}`
      
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

  const getCurrentThemeData = () => {
    return config.THEMES[currentTheme]
  }

  const value = {
    currentTheme,
    themes: config.THEMES,
    changeTheme,
    isSettingsOpen,
    toggleSettings,
    getCurrentThemeData
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
