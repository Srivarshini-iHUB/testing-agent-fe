import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useUser } from '../contexts/UserContext'

const Onboarding = () => {
  const { isDark } = useTheme()
  const { updateUser, updateProject } = useUser()
  const navigate = useNavigate()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    githubConnected: false,
    repoUrl: '',
    frdFile: null,
    userStoryFile: null,
    figmaUrl: '',
    figmaToken: '',
    postmanFile: null
  })

  const [fileNames, setFileNames] = useState({
    frd: '',
    userStory: '',
    postman: ''
  })

  const handleGitHubLogin = () => {
    // Simulate GitHub OAuth - In production, redirect to GitHub
    alert('Redirecting to GitHub for authentication...')
    setTimeout(() => {
      setFormData(prev => ({ ...prev, githubConnected: true }))
      setCurrentStep(2)
    }, 1500)
  }

  const handleSkipLogin = () => {
    setCurrentStep(2)
  }

  const handleFileChange = (field, displayField) => (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0]
      setFormData(prev => ({ ...prev, [field]: file }))
      setFileNames(prev => ({ ...prev, [displayField]: file.name }))
    }
  }

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const validateProjectForm = () => {
    if (!formData.repoUrl) {
      alert('Please enter your GitHub repository URL')
      return false
    }
    if (!formData.frdFile) {
      alert('Please upload your Functional Requirements Document')
      return false
    }
    if (!formData.userStoryFile) {
      alert('Please upload your User Stories document')
      return false
    }
    return true
  }

  const handleNextToSetup = () => {
    if (validateProjectForm()) {
      setCurrentStep(3)
    }
  }

  const handleStartTesting = () => {
    if (!formData.postmanFile) {
      if (!window.confirm('You haven\'t uploaded a Postman collection. Do you want to continue without API testing configuration?')) {
        return
      }
    }

    // Save project data to context
    updateProject({
      name: formData.repoUrl.split('/').pop() || 'New Project',
      repository: formData.repoUrl,
      frdDocument: fileNames.frd,
      userStories: fileNames.userStory,
      postmanCollection: fileNames.postman || 'Not provided',
      figmaUrl: formData.figmaUrl,
      figmaToken: formData.figmaToken ? '***********' : '',
      createdAt: new Date().toISOString()
    })

    alert('Starting your testing journey! Redirecting to the testing dashboard...')
    setTimeout(() => {
      navigate('/')
    }, 1500)
  }

  const getStepClass = (step) => {
    if (step < currentStep) return 'completed'
    if (step === currentStep) return 'active'
    return ''
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-indigo-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* Left Panel */}
        <div className="lg:w-2/5 bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-8 lg:p-12 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-8">
            <i className="fas fa-robot text-5xl"></i>
            <h1 className="text-3xl font-bold">Testing Agents Platform</h1>
          </div>

          <h2 className="text-3xl font-bold mb-6">Comprehensive Testing with AI Agents</h2>
          <p className="text-lg mb-8 opacity-90 leading-relaxed">
            Upload your project and leverage our suite of specialized testing agents to ensure quality, security, and performance.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <i className="fas fa-check-circle text-2xl mt-1"></i>
              <div className="text-lg">9 specialized testing agents for complete coverage</div>
            </div>
            <div className="flex items-start gap-4">
              <i className="fas fa-bolt text-2xl mt-1"></i>
              <div className="text-lg">AI-powered test case generation and execution</div>
            </div>
            <div className="flex items-start gap-4">
              <i className="fas fa-shield-alt text-2xl mt-1"></i>
              <div className="text-lg">Security-focused testing with vulnerability detection</div>
            </div>
            <div className="flex items-start gap-4">
              <i className="fas fa-chart-line text-2xl mt-1"></i>
              <div className="text-lg">Detailed reports with actionable insights</div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:w-3/5 p-8 lg:p-12 overflow-y-auto max-h-[90vh]">
          {/* Steps Progress */}
          <div className="relative flex justify-between mb-12">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 z-0"></div>
            <div 
              className="absolute top-5 left-0 h-1 bg-emerald-500 z-0 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            ></div>

            {/* Step 1 */}
            <div className="flex flex-col items-center z-10">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-4 transition-all duration-300 ${
                currentStep >= 1 
                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
              }`}>
                {currentStep > 1 ? <i className="fas fa-check"></i> : '1'}
              </div>
              <div className={`mt-2 text-sm font-semibold ${
                currentStep === 1 
                  ? 'text-indigo-600 dark:text-indigo-400' 
                  : currentStep > 1 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-gray-400'
              }`}>
                GitHub Login
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center z-10">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-4 transition-all duration-300 ${
                currentStep >= 2 
                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
              }`}>
                {currentStep > 2 ? <i className="fas fa-check"></i> : '2'}
              </div>
              <div className={`mt-2 text-sm font-semibold ${
                currentStep === 2 
                  ? 'text-indigo-600 dark:text-indigo-400' 
                  : currentStep > 2 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-gray-400'
              }`}>
                Project Details
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center z-10">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-4 transition-all duration-300 ${
                currentStep >= 3 
                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
              }`}>
                3
              </div>
              <div className={`mt-2 text-sm font-semibold ${
                currentStep === 3 
                  ? 'text-indigo-600 dark:text-indigo-400' 
                  : 'text-gray-400'
              }`}>
                Testing Setup
              </div>
            </div>
          </div>

          {/* Step 1: GitHub Login */}
          {currentStep === 1 && (
            <div className="animate-fadeIn">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Sign in with GitHub</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                Connect your GitHub account to access your repositories and start testing
              </p>

              <div className="bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-600 p-4 rounded-r-lg mb-6">
                <p className="text-gray-700 dark:text-gray-300">
                  <i className="fas fa-info-circle text-indigo-600 mr-2"></i>
                  We only request read access to your repositories to analyze your project code. No write permissions are requested.
                </p>
              </div>

              <button
                onClick={handleGitHubLogin}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 px-6 rounded-lg font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <i className="fab fa-github text-2xl"></i>
                Sign in with GitHub
              </button>

              <div className="mt-6">
                <button
                  onClick={handleSkipLogin}
                  className="w-full border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 py-3 px-6 rounded-lg font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Continue without GitHub
                  <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Project Details */}
          {currentStep === 2 && (
            <div className="animate-fadeIn">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Project Information</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                Provide details about your project to configure the testing environment
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    GitHub Repository URL <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={formData.repoUrl}
                    onChange={handleInputChange('repoUrl')}
                    placeholder="https://github.com/username/repository"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Functional Requirements Document (FRD) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="frd"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange('frdFile', 'frd')}
                      className="hidden"
                    />
                    <label
                      htmlFor="frd"
                      className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex flex-col items-center justify-center text-center"
                    >
                      <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-3"></i>
                      <p className="text-gray-700 dark:text-gray-300 font-medium">
                        Click to upload FRD
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        PDF, DOC, DOCX (Max 10MB)
                      </p>
                    </label>
                  </div>
                  {fileNames.frd && (
                    <div className="mt-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 flex items-center gap-2">
                      <i className="fas fa-check-circle text-emerald-600"></i>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{fileNames.frd}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    User Stories <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="userStory"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileChange('userStoryFile', 'userStory')}
                      className="hidden"
                    />
                    <label
                      htmlFor="userStory"
                      className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex flex-col items-center justify-center text-center"
                    >
                      <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-3"></i>
                      <p className="text-gray-700 dark:text-gray-300 font-medium">
                        Click to upload User Stories
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        PDF, DOC, DOCX, TXT (Max 10MB)
                      </p>
                    </label>
                  </div>
                  {fileNames.userStory && (
                    <div className="mt-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 flex items-center gap-2">
                      <i className="fas fa-check-circle text-emerald-600"></i>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{fileNames.userStory}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Figma Design URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.figmaUrl}
                    onChange={handleInputChange('figmaUrl')}
                    placeholder="https://www.figma.com/file/..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Figma Access Token (Optional)
                  </label>
                  <input
                    type="password"
                    value={formData.figmaToken}
                    onChange={handleInputChange('figmaToken')}
                    placeholder="Enter your Figma access token"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-8 gap-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex items-center gap-2"
                >
                  <i className="fas fa-arrow-left"></i>
                  Back
                </button>
                <button
                  onClick={handleNextToSetup}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg"
                >
                  Continue to Testing Setup
                  <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Testing Setup */}
          {currentStep === 3 && (
            <div className="animate-fadeIn">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Testing Configuration</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                Upload your Postman collection to configure API testing
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Postman Collection (JSON) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="postman"
                      accept=".json"
                      onChange={handleFileChange('postmanFile', 'postman')}
                      className="hidden"
                    />
                    <label
                      htmlFor="postman"
                      className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex flex-col items-center justify-center text-center"
                    >
                      <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-3"></i>
                      <p className="text-gray-700 dark:text-gray-300 font-medium">
                        Click to upload Postman Collection
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        JSON format only
                      </p>
                    </label>
                  </div>
                  {fileNames.postman && (
                    <div className="mt-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 flex items-center gap-2">
                      <i className="fas fa-check-circle text-emerald-600"></i>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{fileNames.postman}</span>
                    </div>
                  )}
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg">
                  <p className="text-gray-700 dark:text-gray-300">
                    <i className="fas fa-lightbulb text-amber-500 mr-2"></i>
                    Don't have a Postman collection? You can generate one from your API documentation or skip this step for now.
                  </p>
                </div>
              </div>

              <div className="flex justify-between mt-8 gap-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex items-center gap-2"
                >
                  <i className="fas fa-arrow-left"></i>
                  Back
                </button>
                <button
                  onClick={handleStartTesting}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg"
                >
                  Start Testing
                  <i className="fas fa-rocket"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Onboarding
