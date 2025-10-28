import React, { useState, useEffect } from 'react'
import { useUser } from '../contexts/UserContext'

const EditProjectModal = ({ isOpen, onClose, onSave }) => {
  const { project } = useUser()
  
  const [editStep, setEditStep] = useState(3)
  const [editFormData, setEditFormData] = useState({
    projectName: '',
    projectDesc: '',
    projectURL: '',
    repoUrl: '',
    frdFiles: [],  // Changed to array
    userStoryFiles: [],  // Changed to array
    postmanFile: null,
    existingFrdFiles: [],  // Track existing files
    existingUserStoryFiles: []  // Track existing files
  })

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && project) {
      setEditFormData({
        projectName: project.name || '',
        projectDesc: project.projectDesc || '',
        projectURL: project.projectURL || '',
        repoUrl: project.repository || '',
        frdFiles: [],
        userStoryFiles: [],
        postmanFile: null,
        existingFrdFiles: project.frdDocuments || [],
        existingUserStoryFiles: project.userStories || []
      })
      setEditStep(1)
    }
  }, [isOpen, project])

  const handleInputChange = (field) => (e) => {
    setEditFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  // Handle multiple file uploads
  const handleMultipleFileChange = (fileType) => (e) => {
    if (e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setEditFormData(prev => ({
        ...prev,
        [fileType]: [...prev[fileType], ...newFiles]
      }))
    }
  }

  // Remove newly added file (not yet saved)
  const removeNewFile = (fileType, index) => {
    setEditFormData(prev => ({
      ...prev,
      [fileType]: prev[fileType].filter((_, i) => i !== index)
    }))
  }

  // Remove existing file (already saved)
  const removeExistingFile = (fileType, index) => {
    const existingKey = fileType === 'frdFiles' ? 'existingFrdFiles' : 'existingUserStoryFiles'
    setEditFormData(prev => ({
      ...prev,
      [existingKey]: prev[existingKey].filter((_, i) => i !== index)
    }))
  }

  // Handle single file upload (Postman)
  const handleSingleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setEditFormData(prev => ({ ...prev, postmanFile: e.target.files[0] }))
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const showNotification = (message, type = 'info') => {
    const bgColors = {
      error: 'bg-red-600',
      warning: 'bg-orange-600',
      success: 'bg-green-600',
      info: 'bg-blue-600'
    }
    
    const icons = {
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      success: 'fa-check-circle',
      info: 'fa-info-circle'
    }

    const notification = document.createElement('div')
    notification.className = `fixed top-4 right-4 ${bgColors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeIn flex items-center gap-2`
    notification.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`
    document.body.appendChild(notification)
    setTimeout(() => notification.remove(), 3000)
  }

  const handleClose = () => {
    if (window.confirm('Discard changes and close?')) {
      onClose()
    }
  }

  const handleSave = () => {
    // Validate required fields
    if (!editFormData.projectName.trim() || !editFormData.repoUrl.trim()) {
      showNotification('Please fill in all required fields', 'error')
      return
    }

    // Prepare updated data
    const updatedData = {
      name: editFormData.projectName,
      repository: editFormData.repoUrl,
      projectDesc: editFormData.projectDesc,
      projectURL: editFormData.projectURL,
      frdDocuments: [
        ...editFormData.existingFrdFiles,
        ...editFormData.frdFiles.map(f => f.name)
      ],
      userStories: [
        ...editFormData.existingUserStoryFiles,
        ...editFormData.userStoryFiles.map(f => f.name)
      ],
      postmanCollection: editFormData.postmanFile?.name || project.postmanCollection,
      updatedAt: new Date().toISOString()
    }

    showNotification('Project updated successfully!', 'success')
    onSave(updatedData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row max-h-[90vh]">
        
        {/* Left Panel */}
        <div className="lg:w-2/5 bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-6 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <i className="fas fa-edit text-3xl"></i>
            <h2 className="text-2xl font-bold">Edit Project</h2>
          </div>
          <p className="text-base opacity-90 leading-relaxed mb-4">
            Update your project configuration and documentation.
          </p>
          <div className="space-y-2 text-sm">
            {[
              ['fas fa-file-upload', 'Add multiple documents'],
              ['fas fa-trash-alt', 'Remove unwanted files'],
              ['fas fa-save', 'Changes save immediately'],
              ['fas fa-shield-alt', 'Existing data is safe']
            ].map(([icon, text], i) => (
              <div key={i} className="flex items-center gap-2">
                <i className={`${icon} text-base`}></i>
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Edit Form */}
        <div className="lg:w-3/5 p-10 overflow-y-auto relative max-h-[90vh]">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 z-10 transition-all"
          >
            <i className="fas fa-times"></i>
          </button>

          {/* Step Progress */}
          <div className="relative flex justify-between mb-6">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
            <div 
              className="absolute top-4 left-0 h-0.5 bg-emerald-500 transition-all duration-500"
              style={{ width: `${((editStep - 1) / 2) * 100}%` }}
            ></div>
            
            {[1, 2, 3].map(step => (
              <div key={step} className="flex flex-col items-center z-10 bg-white dark:bg-gray-800 px-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-3 transition-all ${
                  editStep >= step ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                }`}>
                  {editStep > step ? <i className="fas fa-check text-xs"></i> : step}
                </div>
                <div className={`mt-1 text-xs font-semibold ${
                  editStep === step ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'
                }`}>
                  {step === 1 ? 'Details' : step === 2 ? 'Docs' : 'API'}
                </div>
              </div>
            ))}
          </div>

          {/* Step 1: Project Details */}
          {editStep === 1 && (
            <div className="space-y-3 animate-fadeIn">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Project Information</h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Project Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.projectName}
                  onChange={handleInputChange('projectName')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editFormData.projectDesc}
                  onChange={handleInputChange('projectDesc')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Repository URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  value={editFormData.repoUrl}
                  onChange={handleInputChange('repoUrl')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Project URL <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  type="url"
                  value={editFormData.projectURL}
                  onChange={handleInputChange('projectURL')}
                  placeholder="https://myproject.com"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={() => setEditStep(2)}
                className="w-full mt-4 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 text-sm shadow-md"
              >
                Next <i className="fas fa-arrow-right ml-1"></i>
              </button>
            </div>
          )}

          {/* Step 2: Documents - Multiple Files */}
          {editStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Documents</h3>
              
              {/* FRD Documents */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <i className="fas fa-file-alt text-emerald-600 dark:text-emerald-400"></i>
                  FRD Documents
                  <span className="text-xs text-gray-500">
                    ({editFormData.existingFrdFiles.length} existing, {editFormData.frdFiles.length} new)
                  </span>
                </label>
                
                {/* Existing FRD Files */}
                {editFormData.existingFrdFiles.length > 0 && (
                  <div className="mb-2 space-y-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Existing Files:</p>
                    {editFormData.existingFrdFiles.map((fileName, index) => (
                      <div key={`existing-frd-${index}`} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <i className="fas fa-file-pdf text-gray-600 dark:text-gray-400 text-sm"></i>
                          <span className="text-sm text-gray-900 dark:text-white truncate">{fileName}</span>
                        </div>
                        <button
                          onClick={() => removeExistingFile('frdFiles', index)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                          title="Remove file"
                        >
                          <i className="fas fa-times text-red-600 dark:text-red-400 text-sm"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add New FRD Files */}
                <input 
                  type="file" 
                  id="edit-frd" 
                  accept=".pdf,.doc,.docx" 
                  multiple
                  onChange={handleMultipleFileChange('frdFiles')} 
                  className="hidden" 
                />
                <label
                  htmlFor="edit-frd"
                  className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all flex flex-col items-center justify-center text-center"
                >
                  <i className="fas fa-plus text-lg text-gray-400 mb-1"></i>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Add more FRD files</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PDF, DOC, DOCX</p>
                </label>

                {/* New FRD Files */}
                {editFormData.frdFiles.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {editFormData.frdFiles.map((file, index) => (
                      <div key={`new-frd-${index}`} className="flex items-center justify-between p-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <i className="fas fa-file-pdf text-emerald-600 dark:text-emerald-400 text-sm"></i>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 dark:text-white font-medium truncate">{file.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeNewFile('frdFiles', index)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                          title="Remove file"
                        >
                          <i className="fas fa-times text-red-600 dark:text-red-400 text-sm"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* User Stories Documents */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <i className="fas fa-book text-purple-600 dark:text-purple-400"></i>
                  User Stories
                  <span className="text-xs text-gray-500">
                    ({editFormData.existingUserStoryFiles.length} existing, {editFormData.userStoryFiles.length} new)
                  </span>
                </label>
                
                {/* Existing User Story Files */}
                {editFormData.existingUserStoryFiles.length > 0 && (
                  <div className="mb-2 space-y-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Existing Files:</p>
                    {editFormData.existingUserStoryFiles.map((fileName, index) => (
                      <div key={`existing-story-${index}`} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <i className="fas fa-file-alt text-gray-600 dark:text-gray-400 text-sm"></i>
                          <span className="text-sm text-gray-900 dark:text-white truncate">{fileName}</span>
                        </div>
                        <button
                          onClick={() => removeExistingFile('userStoryFiles', index)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                          title="Remove file"
                        >
                          <i className="fas fa-times text-red-600 dark:text-red-400 text-sm"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add New User Story Files */}
                <input 
                  type="file" 
                  id="edit-userStory" 
                  accept=".pdf,.doc,.docx,.txt" 
                  multiple
                  onChange={handleMultipleFileChange('userStoryFiles')} 
                  className="hidden" 
                />
                <label
                  htmlFor="edit-userStory"
                  className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 cursor-pointer hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex flex-col items-center justify-center text-center"
                >
                  <i className="fas fa-plus text-lg text-gray-400 mb-1"></i>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Add more User Stories</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PDF, DOC, DOCX, TXT</p>
                </label>

                {/* New User Story Files */}
                {editFormData.userStoryFiles.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {editFormData.userStoryFiles.map((file, index) => (
                      <div key={`new-story-${index}`} className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <i className="fas fa-file-alt text-purple-600 dark:text-purple-400 text-sm"></i>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 dark:text-white font-medium truncate">{file.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeNewFile('userStoryFiles', index)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                          title="Remove file"
                        >
                          <i className="fas fa-times text-red-600 dark:text-red-400 text-sm"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setEditStep(1)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                >
                  <i className="fas fa-arrow-left mr-1"></i> Back
                </button>
                <button
                  onClick={() => setEditStep(3)}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 text-sm shadow-md"
                >
                  Next <i className="fas fa-arrow-right ml-1"></i>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: API Config */}
          {editStep === 3 && (
            <div className="space-y-3 animate-fadeIn">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">API Configuration</h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <i className="fas fa-cube text-orange-600 dark:text-orange-400"></i>
                  Postman Collection
                </label>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Current: {project.postmanCollection || 'None'}
                </div>
                <input
                  type="file"
                  id="edit-postman"
                  accept=".json"
                  onChange={handleSingleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="edit-postman"
                  className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 cursor-pointer hover:border-orange-500 dark:hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all flex flex-col items-center justify-center text-center"
                >
                  <i className="fas fa-upload text-xl text-gray-400 mb-1"></i>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {editFormData.postmanFile ? editFormData.postmanFile.name : 'Click to replace (optional)'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">JSON format</p>
                </label>
                
                {editFormData.postmanFile && (
                  <div className="mt-2 flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <i className="fas fa-file-code text-orange-600 dark:text-orange-400"></i>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white font-medium truncate">{editFormData.postmanFile.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(editFormData.postmanFile.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditFormData(prev => ({ ...prev, postmanFile: null }))}
                      className="w-7 h-7 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                    >
                      <i className="fas fa-times text-red-600 dark:text-red-400"></i>
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setEditStep(2)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                >
                  <i className="fas fa-arrow-left mr-1"></i> Back
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-500 hover:to-purple-500 text-sm shadow-lg"
                >
                  <i className="fas fa-save mr-1"></i> Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EditProjectModal
