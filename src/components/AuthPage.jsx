import React, { useState } from 'react'
import Login from './Login'
import Register from './Register'

const AuthPage = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true)

  const handleSwitchToRegister = () => {
    setIsLogin(false)
  }

  const handleSwitchToLogin = () => {
    setIsLogin(true)
  }

  const handleAuthSuccess = (authData) => {
    onAuthSuccess(authData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 relative overflow-hidden">
      {/* Premium Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-accent-purple/5" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-3xl animate-pulse-soft" />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
      
      <div className="relative z-10">
        {isLogin ? (
          <Login 
            onSwitchToRegister={handleSwitchToRegister}
            onLogin={handleAuthSuccess}
          />
        ) : (
          <Register 
            onSwitchToLogin={handleSwitchToLogin}
            onRegister={handleAuthSuccess}
          />
        )}
      </div>
    </div>
  )
}

export default AuthPage
