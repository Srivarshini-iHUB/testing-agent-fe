import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useUser } from '../contexts/UserContext'

const NewProject = () => {
  const { isDark } = useTheme()
  const { updateProject } = useUser()
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    repoUrl: '',
    projectName: '',
    projectDesc: '',
    frdFile: null,
    userStoryFile: null,
    postmanFile: null
  })

  const [fileNames, setFileNames] = useState({
    frd: '',
    userStory: '',
    postman: ''
  })

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
    if (!formData.projectName) {
      alert('Please enter your project name')
      return false
    }
    if (!formData.repoUrl) {
      alert('Please enter your GitHub repository URL')
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
    if (currentStep === 1) {
      if (validateProjectForm()) {
        setCurrentStep(2)
      }
    } else if (currentStep === 2) {
      if (validateRequiredFiles()) {
        setCurrentStep(3)
      }
    }
  }

  const handleStartTesting = () => {
    if (!formData.postmanFile) {
      if (!window.confirm('You haven\'t uploaded a Postman collection. Continue without API testing configuration?')) {
        return
      }
    }

    updateProject({
      name: formData.projectName || formData.repoUrl.split('/').pop() || 'New Project',
      repository: formData.repoUrl,
      projectDesc: formData.projectDesc,
      frdDocument: fileNames.frd,
      userStories: fileNames.userStory,
      postmanCollection: fileNames.postman || 'Not provided',
      createdAt: new Date().toISOString()
    })

    alert('Starting your testing journey! Redirecting to dashboard...')
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
          <h2 className="text-2xl font-bold mb-4">Comprehensive Testing with AI Agents</h2>
          <p className="text-base mb-6 opacity-90 leading-relaxed">
            Upload your project and leverage our specialized AI testing agents.
          </p>
          <div className="space-y-3 text-sm">
            {[
              ['fas fa-check-circle', '9 specialized testing agents'],
              ['fas fa-bolt', 'AI-powered test generation'],
              ['fas fa-shield-alt', 'Security-focused testing'],
              ['fas fa-chart-line', 'Detailed reports']
            ].map(([icon, text], i) => (
              <div key={i} className="flex items-center gap-2">
                <i className={`${icon} text-lg`}></i>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:w-3/5 p-6 lg:p-8">
          <div className="max-w-md mx-auto">
            
            {/* Step Progress - 3 Steps */}
            <div className="relative flex justify-between mb-8">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
              <div
                className="absolute top-5 left-0 h-0.5 bg-emerald-500 transition-all duration-500"
                style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
              ></div>

              {[1, 2, 3].map(step => (
                <div key={step} className="flex flex-col items-center z-10 bg-white dark:bg-gray-800 px-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-3 transition-all duration-300 ${
                    currentStep >= step
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
                  }`}>
                    {currentStep > step ? <i className="fas fa-check text-xs"></i> : step}
                  </div>
                  <div className={`mt-1.5 text-xs font-semibold ${
                    currentStep === step
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : currentStep > step
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-400'
                  }`}>
                    {step === 1 ? 'Project' : step === 2 ? 'Documents' : 'API Config'}
                  </div>
                </div>
              ))}
            </div>

            {/* Step 1: Project Details */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Project Information</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                  Provide project name, description and repository URL
                </p>

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
                      rows={2}
                      value={formData.projectDesc}
                      onChange={handleInputChange('projectDesc')}
                      placeholder="Brief description..."
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      GitHub Repository URL <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={formData.repoUrl}
                      onChange={handleInputChange('repoUrl')}
                      placeholder="https://github.com/username/repo"
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleNextStep}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 text-sm shadow-lg"
                  >
                    Next <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Required Documents */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Upload Documents</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                  Upload your FRD and User Stories documents
                </p>

                {[
                  ['frd', 'Functional Requirements Document (FRD)', '.pdf,.doc,.docx'],
                  ['userStory', 'User Stories Document', '.pdf,.doc,.docx,.txt']
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

            {/* Step 3: API Configuration (Optional) */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">API Configuration</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                  Upload your Postman Collection for API testing (optional)
                </p>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Postman Collection (JSON)
                  </label>
                  <div className="relative">
                    <input type="file" id="postman" accept=".json" onChange={handleFileChange('postmanFile', 'postman')} className="hidden" />
                    <label
                      htmlFor="postman"
                      className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex flex-col items-center justify-center text-center"
                    >
                      <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                      <p className="text-gray-700 dark:text-gray-300 font-medium text-sm mb-1">Click to upload Postman Collection</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">JSON format only</p>
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
                    You can skip this step and configure API testing later from the dashboard
                  </p>
                </div>

                <div className="flex justify-between gap-3 mt-6">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-5 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex items-center gap-2 text-sm"
                  >
                    <i className="fas fa-arrow-left"></i> Back
                  </button>
                  <button
                    onClick={handleStartTesting}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-semibold transition-all flex items-center gap-2 text-sm shadow-lg"
                  >
                    Start Testing <i className="fas fa-rocket"></i>
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
