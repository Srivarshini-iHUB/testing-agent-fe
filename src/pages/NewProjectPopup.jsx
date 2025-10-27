import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useUser } from '../contexts/UserContext'

const NewProject = () => {
  const { isDark } = useTheme()
  const { updateProject, user } = useUser()
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState(1)
  const [githubConnected, setGithubConnected] = useState(false)
  const [githubUser, setGithubUser] = useState(null)
  const [selectedRepo, setSelectedRepo] = useState(null)
  const [repositories, setRepositories] = useState([])
  
  const [formData, setFormData] = useState({
    repoUrl: '',
    projectName: '',
    projectDesc: '',
    frdFile: null,
    userStoryFile: null,
    projectURL: '',
    postmanFile: null
  })

  const [fileNames, setFileNames] = useState({
    frd: '',
    userStory: '',
    postman: ''
  })

  // Mock GitHub repos (replace with actual GitHub API call)
  const mockGithubRepos = [
    { id: 1, name: 'ecommerce-app', full_name: 'ajay/ecommerce-app', description: 'E-commerce platform with React', private: false },
    { id: 2, name: 'social-media', full_name: 'ajay/social-media', description: 'Social networking application', private: false },
    { id: 3, name: 'banking-dashboard', full_name: 'ajay/banking-dashboard', description: 'Financial dashboard', private: true },
    { id: 4, name: 'healthcare-portal', full_name: 'ajay/healthcare-portal', description: 'Healthcare management system', private: false },
  ]

  const handleGithubConnect = () => {
    // Simulate GitHub OAuth flow
    alert('Redirecting to GitHub for authentication...')
    setTimeout(() => {
      setGithubConnected(true)
      setGithubUser({
        name: user.name,
        username: 'ajay-kumar',
        avatar: 'https://github.com/identicons/ajay.png'
      })
      setRepositories(mockGithubRepos)
    }, 1500)
  }

  const handleRepoSelect = (repo) => {
    setSelectedRepo(repo)
    setFormData(prev => ({
      ...prev,
      repoUrl: `https://github.com/${repo.full_name}`,
      projectName: repo.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }))
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

  const validateGithubStep = () => {
    if (!githubConnected || !selectedRepo) {
      alert('Please connect GitHub and select a repository')
      return false
    }
    return true
  }

  const validateProjectForm = () => {
    if (!formData.projectName) {
      alert('Please enter your project name')
      return false
    }
    return true
  }

  const validateRequiredFiles = () => {
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

  const handleNextStep = () => {
    if (currentStep === 1 && validateGithubStep()) {
      setCurrentStep(2)
    } else if (currentStep === 2 && validateProjectForm()) {
      setCurrentStep(3)
    } else if (currentStep === 3 && validateRequiredFiles()) {
      setCurrentStep(4)
    }
  }

  const handleClose = () => {
    if (window.confirm('Discard changes?')) {
      navigate('/dashboard')
    }
  }

  const handleStartTesting = () => {
    if (!formData.postmanFile) {
      if (!window.confirm('You haven\'t uploaded a Postman collection. Continue without API testing?')) {
        return
      }
    }

    updateProject({
      name: formData.projectName,
      repository: formData.repoUrl,
      projectDesc: formData.projectDesc,
      frdDocument: fileNames.frd,
      userStories: fileNames.userStory,
      postmanCollection: fileNames.postman || 'Not provided',
      githubConnected: true,
      githubRepo: selectedRepo?.full_name,
      createdAt: new Date().toISOString()
    })

    alert('Project created successfully! Redirecting to dashboard...')
    setTimeout(() => navigate('/dashboard'), 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-indigo-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        
        {/* Left Panel */}
        <div className="lg:w-2/5 bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-6 lg:p-8 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-6">
            <i className="fas fa-robot text-4xl"></i>
            <h1 className="text-2xl font-bold">Testing Agents</h1>
          </div>
          <h2 className="text-2xl font-bold mb-4">Set Up Your Testing Project</h2>
          <p className="text-base mb-6 opacity-90 leading-relaxed">
            Connect your GitHub repository and configure AI-powered testing agents.
          </p>
          <div className="space-y-3 text-sm">
            {[
              ['fab fa-github', 'Direct GitHub integration'],
              ['fas fa-code-branch', 'Repository access'],
              ['fas fa-robot', '9 AI testing agents'],
              ['fas fa-chart-line', 'Automated reports']
            ].map(([icon, text], i) => (
              <div key={i} className="flex items-center gap-2">
                <i className={`${icon} text-lg`}></i>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:w-3/5 p-6 lg:p-8 overflow-y-auto relative max-h-[90vh]">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 z-10"
          >
            <i className="fas fa-times"></i>
          </button>

          <div className="max-w-md mx-auto">
            {/* Step Progress - 4 Steps */}
            <div className="relative flex justify-between mb-8">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
              <div
                className="absolute top-5 left-0 h-0.5 bg-emerald-500 transition-all duration-500"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              ></div>

              {[1, 2, 3, 4].map(step => (
                <div key={step} className="flex flex-col items-center z-10 bg-white dark:bg-gray-800 px-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-3 transition-all duration-300 ${
                    currentStep >= step
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
                  }`}>
                    {currentStep > step ? <i className="fas fa-check text-xs"></i> : step}
                  </div>
                  <div className={`mt-1 text-xs font-semibold text-center ${
                    currentStep === step
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : currentStep > step
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-400'
                  }`}>
                    {step === 1 ? 'GitHub' : step === 2 ? 'Details' : step === 3 ? 'Docs' : 'API'}
                  </div>
                </div>
              ))}
            </div>

            {/* Step 1: GitHub Connection & Repo Selection */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Connect GitHub</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                  Connect your GitHub account and select a repository to test
                </p>

                {!githubConnected ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fab fa-github text-4xl text-gray-600 dark:text-gray-400"></i>
                    </div>
                    <button
                      onClick={handleGithubConnect}
                      className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm shadow-lg"
                    >
                      <i className="fab fa-github text-xl"></i>
                      Connect with GitHub
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                      We'll access your repositories to run automated tests
                    </p>
                  </div>
                ) : (
                  <div>
                    {/* GitHub User Info */}
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        <i className="fab fa-github text-white text-xl"></i>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">Connected as {githubUser.username}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Access granted to repositories</p>
                      </div>
                      <i className="fas fa-check-circle text-green-600 text-xl"></i>
                    </div>

                    {/* Repository Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Select Repository <span className="text-rose-500">*</span>
                      </label>
                      <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                        {repositories.map((repo) => (
                          <button
                            key={repo.id}
                            onClick={() => handleRepoSelect(repo)}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                              selectedRepo?.id === repo.id
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <i className={`fas fa-code-branch text-sm ${
                                    selectedRepo?.id === repo.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'
                                  }`}></i>
                                  <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                    {repo.full_name}
                                  </p>
                                  {repo.private && (
                                    <span className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded">
                                      Private
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                  {repo.description || 'No description'}
                                </p>
                              </div>
                              {selectedRepo?.id === repo.id && (
                                <i className="fas fa-check-circle text-indigo-600 dark:text-indigo-400"></i>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleNextStep}
                    disabled={!selectedRepo}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Project Details */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Project Information</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                  Configure your project details
                </p>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3 mb-4 text-xs">
                  <i className="fab fa-github mr-1"></i>
                  Repository: <span className="font-semibold">{selectedRepo?.full_name}</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Project Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.projectName}
                      onChange={handleInputChange('projectName')}
                      placeholder="My Awesome Project"
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Project Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.projectDesc}
                      onChange={handleInputChange('projectDesc')}
                      placeholder="Brief description..."
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Project URL <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={formData.projectURL}
                      onChange={handleInputChange('projectURL')}
                      placeholder="https://myproject.com"
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-between gap-3 mt-6">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-5 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex items-center gap-2 text-sm"
                  >
                    <i className="fas fa-arrow-left"></i> Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 text-sm shadow-lg"
                  >
                    Next <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Required Documents */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Upload Documents</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                  Upload your FRD and User Stories documents
                </p>

                {[
                  ['frd', 'Functional Requirements (FRD)', '.pdf,.doc,.docx'],
                  ['userStory', 'User Stories', '.pdf,.doc,.docx,.txt']
                ].map(([key, label, accept]) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      {label} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input type="file" id={key} accept={accept} onChange={handleFileChange(`${key}File`, key)} className="hidden" />
                      <label
                        htmlFor={key}
                        className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex flex-col items-center justify-center text-center"
                      >
                        <i className="fas fa-cloud-upload-alt text-2xl text-gray-400 mb-1"></i>
                        <p className="text-gray-700 dark:text-gray-300 font-medium text-sm">Click to upload</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {accept.split(',').map(a => a.toUpperCase().replace('.', '')).join(', ')}
                        </p>
                      </label>
                    </div>
                    {fileNames[key] && (
                      <div className="mt-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-2 flex items-center gap-2">
                        <i className="fas fa-check-circle text-emerald-600 text-sm"></i>
                        <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{fileNames[key]}</span>
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex justify-between gap-3 mt-6">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-5 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex items-center gap-2 text-sm"
                  >
                    <i className="fas fa-arrow-left"></i> Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 text-sm shadow-lg"
                  >
                    Next <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: API Configuration */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">API Configuration</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                  Upload Postman Collection (optional)
                </p>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Postman Collection
                  </label>
                  <div className="relative">
                    <input type="file" id="postman" accept=".json" onChange={handleFileChange('postmanFile', 'postman')} className="hidden" />
                    <label
                      htmlFor="postman"
                      className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex flex-col items-center justify-center text-center"
                    >
                      <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                      <p className="text-gray-700 dark:text-gray-300 font-medium text-sm mb-1">Upload Postman Collection</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">JSON format</p>
                    </label>
                  </div>
                  {fileNames.postman && (
                    <div className="mt-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-2 flex items-center gap-2">
                      <i className="fas fa-check-circle text-emerald-600 text-sm"></i>
                      <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{fileNames.postman}</span>
                    </div>
                  )}
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500 p-3 rounded-r-lg">
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    <i className="fas fa-info-circle text-indigo-600 dark:text-indigo-400 mr-1"></i>
                    Skip this and configure API testing later
                  </p>
                </div>

                <div className="flex justify-between gap-3 mt-6">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-5 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex items-center gap-2 text-sm"
                  >
                    <i className="fas fa-arrow-left"></i> Back
                  </button>
                  <button
                    onClick={handleStartTesting}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-semibold transition-all flex items-center gap-2 text-sm shadow-lg"
                  >
                    Create Project <i className="fas fa-rocket"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewProject
