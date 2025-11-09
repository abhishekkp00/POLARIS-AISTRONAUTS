'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useAuth from '@/hooks/useAuth'

// Disable static generation for this page
export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, loading: authLoading, error: authError } = useAuth()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [formErrors, setFormErrors] = useState({ email: '', password: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Animation on mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, authLoading, router])

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    
    // Real-time validation
    if (name === 'email' && value && !validateEmail(value)) {
      setFormErrors({ ...formErrors, email: 'Please enter a valid email' })
    } else {
      setFormErrors({ ...formErrors, [name]: '' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate all fields
    const errors = {}
    if (!formData.email) {
      errors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email'
    }
    
    if (!formData.password) {
      errors.password = 'Password is required'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setIsSubmitting(true)
    setFormErrors({})

    const result = await login({ email: formData.email, password: formData.password })
    
    if (result.success) {
      router.push('/dashboard')
    } else {
      setFormErrors({ password: result.error || 'Email or password is incorrect' })
    }
    
    setIsSubmitting(false)
  }

  const fillDemoCredentials = (user) => {
    if (user === 'priya') {
      setFormData({ email: 'priya@taskmuse.com', password: 'password123' })
    } else if (user === 'rahul') {
      setFormData({ email: 'rahul@taskmuse.com', password: 'password123' })
    }
    setFormErrors({})
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Form */}
      <div className={`w-full lg:w-1/2 flex items-center justify-center p-8 bg-white transition-all duration-500 ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">
              Login to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-xl">✉️</span>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-12 pr-4 py-3.5 border ${formErrors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all text-gray-900`}
                  placeholder="you@example.com"
                />
              </div>
              {formErrors.email && (
                <p className="mt-2 text-sm text-red-600 animate-fade-in">{formErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-xl">🔒</span>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-12 pr-12 py-3.5 border ${formErrors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all text-gray-900`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-2 text-sm text-red-600 animate-fade-in">{formErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>

            {/* Demo Credentials */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-3 text-center font-medium">
                🎭 Demo Credentials (For Judges):
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('priya')}
                  className="px-4 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all transform hover:scale-105 active:scale-95 border border-blue-200"
                >
                  <div className="font-semibold">Priya</div>
                  <div className="text-xs text-blue-600">PM</div>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('rahul')}
                  className="px-4 py-2.5 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all transform hover:scale-105 active:scale-95 border border-purple-200"
                >
                  <div className="font-semibold">Rahul</div>
                  <div className="text-xs text-purple-600">Developer</div>
                </button>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <a
                  href="/signup"
                  className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Sign up
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Hero */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 relative overflow-hidden flex items-center justify-center p-8 lg:p-12">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute w-64 h-64 bg-white/5 rounded-full blur-2xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Content */}
        <div className={`relative z-10 text-white max-w-lg transition-all duration-700 ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-4 flex items-center">
              <span className="mr-3 text-6xl animate-bounce" style={{ animationDuration: '2s' }}>✨</span>
              TaskMuse
            </h1>
            <p className="text-3xl font-semibold mb-3 text-blue-100">
              AI-Powered Team Brain
            </p>
            <p className="text-lg text-blue-200">
              Real-time task management for distributed teams
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 rounded-lg bg-white/10 backdrop-blur-sm transform hover:scale-105 transition-all">
              <span className="text-3xl">🤖</span>
              <div>
                <h3 className="font-semibold text-lg">AI-Powered Insights</h3>
                <p className="text-blue-100 text-sm">Smart suggestions for your next steps</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-4 rounded-lg bg-white/10 backdrop-blur-sm transform hover:scale-105 transition-all" style={{ transitionDelay: '100ms' }}>
              <span className="text-3xl">📊</span>
              <div>
                <h3 className="font-semibold text-lg">Real-Time Tracking</h3>
                <p className="text-blue-100 text-sm">Live performance metrics and analytics</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-4 rounded-lg bg-white/10 backdrop-blur-sm transform hover:scale-105 transition-all" style={{ transitionDelay: '200ms' }}>
              <span className="text-3xl">👥</span>
              <div>
                <h3 className="font-semibold text-lg">Team Transparency</h3>
                <p className="text-blue-100 text-sm">Everyone knows what everyone is working on</p>
              </div>
            </div>
          </div>

          {/* Footer Badge */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-sm text-blue-100">
              Built for POLARIS Hackathon 2025 🚀
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

