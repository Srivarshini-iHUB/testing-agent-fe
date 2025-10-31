import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useUser } from '../contexts/UserContext'
import GoogleSignIn from '../components/auth/GoogleSignIn'
import GoogleSignInDebug from '../components/auth/GoogleSignInDebug'
import ConfigDebug from '../components/auth/ConfigDebug'
import { projectApi } from '../api/projectApi'

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

  const handleGoogleLoginSuccess = async (user) => {
    try {
      setIsSigningIn(false);
      // Decide destination based on whether the user already has any projects
      const userId = user?.user_id || user?.id || JSON.parse(localStorage.getItem('user') || '{}')?.user_id;
      if (!userId) {
        // Fallback to onboarding if we cannot identify the user id
        navigate('/NewProjectPopup');
        return;
      }
      const projects = await projectApi.getProjects({ userId });
      if (Array.isArray(projects) && projects.length > 0) {
        navigate('/dashboard');
      } else {
        navigate('/NewProjectPopup');
      }
    } catch (e) {
      console.error('Post-login routing error:', e);
      navigate('/NewProjectPopup');
    }
  }

  const handleGoogleLoginError = (error) => {
    console.error('Google sign-in error:', error);
    setIsSigningIn(false);
    alert(`Google sign-in failed: ${error}`);
  }

  // Redirect authenticated users: if they have projects -> dashboard, else -> new project
  useEffect(() => {
    const decideRoute = async () => {
      if (!isAuthenticated) return;
      try {
        const stored = JSON.parse(localStorage.getItem('user') || 'null');
        const userId = stored?.user_id || stored?.id;
        if (!userId) {
          navigate('/NewProjectPopup');
          return;
        }
        const projects = await projectApi.getProjects({ userId });
        if (Array.isArray(projects) && projects.length > 0) {
          window.location.reload();
          navigate('/dashboard');
        } else {
          navigate('/NewProjectPopup');
        }
      } catch (err) {
        console.error('Auto routing failed:', err);
        navigate('/NewProjectPopup');
      }
    };
    decideRoute();
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

            <button
              onClick={() => navigate('/NewProjectPopup')}
              className="w-full bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 py-3 rounded-lg font-semibold flex items-center justify-center gap-3 transition-all shadow-sm mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Test - SignIn
            </button>
            
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
