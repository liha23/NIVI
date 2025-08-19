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
    <div className="min-h-screen bg-dark-950">
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
  )
}

export default AuthPage
