import React, { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Sparkles, ArrowRight, Zap, Shield, UserCheck, CheckCircle } from 'lucide-react'
import { frontendConfig } from '../config.js'

const Register = ({ onSwitchToLogin, onRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields')
      return false
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long')
      return false
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const apiUrl = `${frontendConfig.getApiUrl()}/api/auth/register`
      console.log('Attempting registration to:', apiUrl)
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('user', JSON.stringify(data.data.user))
        onRegister(data.data)
      } else {
        setError(data.message || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError(`Network error: ${error.message}. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' }
    
    let strength = 0
    if (password.length >= 6) strength++
    if (password.match(/[a-z]/)) strength++
    if (password.match(/[A-Z]/)) strength++
    if (password.match(/[0-9]/)) strength++
    if (password.match(/[^a-zA-Z0-9]/)) strength++

    const levels = [
      { strength: 0, label: '', color: '' },
      { strength: 1, label: 'Very Weak', color: 'bg-error-500' },
      { strength: 2, label: 'Weak', color: 'bg-warning-500' },
      { strength: 3, label: 'Fair', color: 'bg-warning-400' },
      { strength: 4, label: 'Good', color: 'bg-success-500' },
      { strength: 5, label: 'Strong', color: 'bg-success-400' }
    ]

    return levels[Math.min(strength, 5)]
  }

  const passwordStrength = getPasswordStrength(formData.password)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="w-full h-full bg-gradient-to-br from-brand-500 to-accent-purple rounded-3xl flex items-center justify-center shadow-glow-lg animate-float">
              <UserCheck className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent-emerald rounded-full border-4 border-neutral-900 animate-bounce-subtle" />
          </div>
          <h1 className="text-3xl font-bold text-gradient-primary mb-2">
            Join NIVII AI
          </h1>
          <p className="text-neutral-400 text-lg">Create your account to get started</p>
        </div>

        {/* Registration Form */}
        <div className="card-glass p-8 shadow-strong">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-error-500/10 border border-error-500/30 rounded-xl animate-fade-in">
                <p className="text-error-300 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-neutral-200">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  className="input pl-12 h-12 text-base"
                  required
                  disabled={isLoading}
                />
                {formData.username.length >= 3 && (
                  <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-success-400 w-5 h-5" />
                )}
              </div>
              {formData.username && formData.username.length < 3 && (
                <p className="text-xs text-warning-400">Username must be at least 3 characters</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-neutral-200">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="input pl-12 h-12 text-base"
                  required
                  disabled={isLoading}
                />
                {formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                  <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-success-400 w-5 h-5" />
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-neutral-200">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className="input pl-12 pr-12 h-12 text-base"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-neutral-700 rounded-full h-2">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength.strength <= 2 ? 'text-error-400' :
                      passwordStrength.strength === 3 ? 'text-warning-400' :
                      'text-success-400'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500 space-y-1">
                    <p className="flex items-center gap-2">
                      <span className={formData.password.length >= 6 ? 'text-success-400' : 'text-neutral-500'}>
                        ✓ At least 6 characters
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-neutral-200">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="input pl-12 pr-12 h-12 text-base"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-error-400">Passwords do not match</p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password && (
                <p className="text-xs text-success-400 flex items-center gap-1">
                  <CheckCircle size={12} />
                  Passwords match
                </p>
              )}
            </div>

            {/* Terms and Privacy */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                required
                className="w-4 h-4 bg-neutral-700 border border-neutral-600 rounded focus:ring-brand-500 focus:ring-2 text-brand-500 mt-0.5"
              />
              <label htmlFor="terms" className="text-sm text-neutral-300 leading-relaxed">
                I agree to the{' '}
                <button type="button" className="text-brand-400 hover:text-brand-300 transition-colors">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="text-brand-400 hover:text-brand-300 transition-colors">
                  Privacy Policy
                </button>
              </label>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading || !formData.username || !formData.email || !formData.password || !formData.confirmPassword || formData.password !== formData.confirmPassword}
              className="w-full btn btn-primary h-12 text-base font-semibold shadow-medium hover:shadow-strong disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating account...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className="text-neutral-400">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-brand-400 hover:text-brand-300 font-semibold transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-brand-500/20 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-brand-400" />
            </div>
            <span className="text-xs text-neutral-500 font-medium">Secure</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-accent-purple/20 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-accent-purple" />
            </div>
            <span className="text-xs text-neutral-500 font-medium">Fast</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-accent-emerald/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent-emerald" />
            </div>
            <span className="text-xs text-neutral-500 font-medium">Smart</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
