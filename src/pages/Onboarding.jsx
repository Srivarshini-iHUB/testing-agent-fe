import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useUser } from '../contexts/UserContext'
import GoogleSignIn from '../components/auth/GoogleSignIn'
import GoogleSignInDebug from '../components/auth/GoogleSignInDebug'
import ConfigDebug from '../components/auth/ConfigDebug'

const Onboarding = () => {
  const { isDark } = useTheme()
  const { updateUser, signInWithGoogle, isAuthenticated, isLoading } = useUser()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isSigningIn, setIsSigningIn] = useState(false)

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleGoogleLoginSuccess = (user) => {
    console.log('Google sign-in successful:', user);
    setIsSigningIn(false);
    // User is already updated in the context, just navigate
    navigate('/NewProjectPopup');
  }

  const handleGoogleLoginError = (error) => {
    console.error('Google sign-in error:', error);
    setIsSigningIn(false);
    alert(`Google sign-in failed: ${error}`);
  }

  // Redirect authenticated users away from onboarding
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/NewProjectPopup');
    }
  }, [isAuthenticated, navigate]);

  const handleEmailLogin = (e) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      alert('Please fill in all required fields')
      return
    }

    // Simulate login
    const userName = formData.email.split('@')[0]
    updateUser({
      name: userName,
      email: formData.email,
      initials: userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      provider: 'email'
    })

    alert('Logged in successfully!')
    setTimeout(() => {
      navigate('/NewProjectPopup')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-indigo-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">

        {/* Left Panel */}
        <div className="lg:w-2/5 bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-8 lg:p-12 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-8">
            <i className="fas fa-robot text-5xl"></i>
            <h1 className="text-3xl font-bold">Testing Agents Platform</h1>
          </div>
          <h2 className="text-3xl font-bold mb-6">Comprehensive Testing with AI Agents</h2>
          <p className="text-lg mb-8 opacity-90 leading-relaxed">
            Join thousands of developers who trust Testing Agents for automated quality assurance.
          </p>
          <div className="space-y-4 text-base">
            {[
              ['fas fa-check-circle', '9 specialized testing agents'],
              ['fas fa-bolt', 'AI-powered test generation'],
              ['fas fa-shield-alt', 'Security-focused testing'],
              ['fas fa-chart-line', 'Detailed analytics & reports']
            ].map(([icon, text], i) => (
              <div key={i} className="flex items-start gap-3">
                <i className={`${icon} text-xl mt-1`}></i>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Login Only */}
        <div className="lg:w-3/5 p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Sign in to continue your testing journey
              </p>
            </div>

            {/* Google Login */}
            <GoogleSignIn
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
              variant="outline"
              size="large"
              className="w-full mb-6"
            />
            
            {/* Loading State */}
            {(isLoading || isSigningIn) && (
              <div className="w-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-3 rounded-lg font-semibold flex items-center justify-center gap-3 mb-6">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                Signing in...
              </div>
            )}

            {/* Divider */}
            {/* <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or continue with email
                </span>
              </div>
            </div> */}

            {/* Email Login Form */}
            {/* <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 rounded border-gray-300" />
                  <span className="text-gray-600 dark:text-gray-300">Remember me</span>
                </label>
                <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-all shadow-lg"
              >
                Sign In
              </button>
            </form> */}

            {/* Additional Info */}
            <div className="mt-6 ">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                New to Testing Agents?{' '}
                <a href="#" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                  Contact us for access
                </a>
              </p>
            </div>

            {/* Demo Account Info */}
            {/* <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                <i className="fas fa-info-circle mr-2"></i>
                <strong>Demo Account:</strong> test@example.com / password123
              </p>
            </div> */}

            {/* Debug Section - Remove in production */}
            {/* <div className="mt-6 space-y-4">
              <details className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <summary className="p-3 cursor-pointer text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  🔧 Configuration Debug
                </summary>
                <div className="p-4 border-t border-yellow-200 dark:border-yellow-800">
                  <ConfigDebug />
                </div>
              </details>
              
              <details className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <summary className="p-3 cursor-pointer text-sm font-medium text-blue-800 dark:text-blue-200">
                  🧪 Google Sign-In Debug
                </summary>
                <div className="p-4 border-t border-blue-200 dark:border-blue-800">
                  <GoogleSignInDebug />
                </div>
              </details>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Onboarding
