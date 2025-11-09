'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useAuth from '@/hooks/useAuth'

// Disable static generation for this page
export const dynamic = 'force-dynamic'

export default function SignupPage() {
  const router = useRouter()
  const { signup, isAuthenticated, loading: authLoading } = useAuth()

  const [formData, setFormData] = useState({ 
    name: '',
    email: '', 
    password: '', 
    confirmPassword: '',
    role: 'Developer',
    agreeToTerms: false
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({ level: 0, label: '', color: '' })
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

  // Password strength calculator
  const calculatePasswordStrength = (password) => {
    const length = password.length
    if (length === 0) return { level: 0, label: '', color: '' }
    if (length < 4) return { level: 1, label: 'Weak', color: 'bg-red-500' }
    if (length < 7) return { level: 2, label: 'Medium', color: 'bg-orange-500' }
    return { level: 3, label: 'Strong', color: 'bg-green-500' }
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    setFormData({ ...formData, [name]: newValue })
    
    // Real-time validation
    const errors = { ...formErrors }
    
    if (name === 'name' && value) {
      if (value.length < 2) {
        errors.name = 'Name must be at least 2 characters'
      } else {
        delete errors.name
      }
    }
    
    if (name === 'email' && value) {
      if (!validateEmail(value)) {
        errors.email = 'Please enter a valid email'
      } else {
        delete errors.email
      }
    }
    
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value))
      if (value && value.length < 7) {
        errors.password = 'Password must be at least 7 characters'
      } else {
        delete errors.password
      }
      
      // Check if confirm password matches
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords must match'
      } else {
        delete errors.confirmPassword
      }
    }
    
    if (name === 'confirmPassword' && value) {
      if (value !== formData.password) {
        errors.confirmPassword = 'Passwords must match'
      } else {
        delete errors.confirmPassword
      }
    }
    
    setFormErrors(errors)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate all fields
    const errors = {}
    
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters'
    }
    
    if (!formData.email) {
      errors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email'
    }
    
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 7) {
      errors.password = 'Password must be at least 7 characters'
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords must match'
    }
    
    if (!formData.agreeToTerms) {
      errors.agreeToTerms = 'You must agree to the Terms & Conditions'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setIsSubmitting(true)
    setFormErrors({})

    const result = await signup({ 
      email: formData.email, 
      password: formData.password,
      name: formData.name,
      role: formData.role
    })
    
    if (result.success) {
      // Show success and redirect
      router.push('/dashboard')
    } else {
      setFormErrors({ submit: result.error || 'Failed to create account. Try again.' })
    }
    
    setIsSubmitting(false)
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
              Create Account
            </h1>
            <p className="text-gray-600">
              Join your team on TaskMuse
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-xl">👤</span>
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`block w-full pl-12 pr-4 py-3 border ${formErrors.name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all text-gray-900`}
                  placeholder="John Doe"
                />
                {formData.name && !formErrors.name && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <span className="text-green-500 text-xl">✓</span>
                  </div>
                )}
              </div>
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600 animate-fade-in">{formErrors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
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
                  className={`block w-full pl-12 pr-4 py-3 border ${formErrors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all text-gray-900`}
                  placeholder="you@example.com"
                />
                {formData.email && !formErrors.email && validateEmail(formData.email) && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <span className="text-green-500 text-xl">✓</span>
                  </div>
                )}
              </div>
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600 animate-fade-in">{formErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-xl">🔒</span>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-12 pr-12 py-3 border ${formErrors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all text-gray-900`}
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
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.level / 3) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600">{passwordStrength.label}</span>
                  </div>
                </div>
              )}
              
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600 animate-fade-in">{formErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-xl">🔒</span>
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full pl-12 pr-12 py-3 border ${formErrors.confirmPassword ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all text-gray-900`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <div className="absolute inset-y-0 right-12 pr-4 flex items-center">
                    <span className="text-green-500 text-xl">✓</span>
                  </div>
                )}
              </div>
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 animate-fade-in">{formErrors.confirmPassword}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                Your Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
              >
                <option value="Developer">Developer</option>
                <option value="Designer">Designer</option>
                <option value="PM">Product Manager</option>
                <option value="Manager">Manager</option>
                <option value="QA">QA Engineer</option>
                <option value="DevOps">DevOps</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Terms & Conditions */}
            <div>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                    Terms & Conditions
                  </a>
                  {' '}<span className="text-red-500">*</span>
                </span>
              </label>
              {formErrors.agreeToTerms && (
                <p className="mt-1 text-sm text-red-600 animate-fade-in">{formErrors.agreeToTerms}</p>
              )}
            </div>

            {/* Submit Error */}
            {formErrors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{formErrors.submit}</p>
              </div>
            )}

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
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Login Link */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a
                  href="/login"
                  className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Login
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Hero (Same as login) */}
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
