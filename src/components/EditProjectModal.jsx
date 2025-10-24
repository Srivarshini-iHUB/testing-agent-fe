import React, { useState, useEffect } from 'react'
import { useUser } from '../contexts/UserContext'

const EditProjectModal = ({ isOpen, onClose, onSave }) => {
  const { project } = useUser()
  
  const [editStep, setEditStep] = useState(1)
  const [editFormData, setEditFormData] = useState({
    projectName: '',
    projectDesc: '',
    repoUrl: '',
    frdFile: null,
    userStoryFile: null,
    postmanFile: null
  })
  const [editFileNames, setEditFileNames] = useState({
    frd: '',
    userStory: '',
    postman: ''
  })

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && project) {
      setEditFormData({
        projectName: project.name || '',
        projectDesc: project.projectDesc || '',
        repoUrl: project.repository || '',
        frdFile: null,
        userStoryFile: null,
        postmanFile: null
      })
      setEditFileNames({
        frd: project.frdDocument || '',
        userStory: project.userStories || '',
        postman: project.postmanCollection || ''
      })
      setEditStep(1)
    }
  }, [isOpen, project])

  const handleInputChange = (field) => (e) => {
    setEditFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleFileChange = (field, displayField) => (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0]
      setEditFormData(prev => ({ ...prev, [field]: file }))
      setEditFileNames(prev => ({ ...prev, [displayField]: file.name }))
    }
  }

  const handleClose = () => {
    if (window.confirm('Discard changes?')) {
      onClose()
    }
  }

  const handleSave = () => {
    // Validate required fields
    if (!editFormData.projectName || !editFormData.repoUrl) {
      alert('Please fill in all required fields')
      return
    }

    // Call parent's onSave with updated data
    onSave({
      name: editFormData.projectName,
      repository: editFormData.repoUrl,
      projectDesc: editFormData.projectDesc,
      frdDocument: editFileNames.frd,
      userStories: editFileNames.userStory,
      postmanCollection: editFileNames.postman,
      updatedAt: new Date().toISOString()
    })
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
              ['fas fa-info-circle', 'Only upload new files to replace existing ones'],
              ['fas fa-save', 'Changes will be saved immediately'],
              ['fas fa-shield-alt', 'Your existing data is safe']
            ].map(([icon, text], i) => (
              <div key={i} className="flex items-center gap-2">
                <i className={`${icon} text-base`}></i>
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Edit Form */}
        <div className="lg:w-3/5 p-11 overflow-y-auto relative">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full  hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 z-10"
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
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
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
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
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
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Repository URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  value={editFormData.repoUrl}
                  onChange={handleInputChange('repoUrl')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={() => setEditStep(2)}
                className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 text-sm"
              >
                Next <i className="fas fa-arrow-right ml-1"></i>
              </button>
            </div>
          )}

          {/* Step 2: Documents */}
          {editStep === 2 && (
            <div className="space-y-3 animate-fadeIn">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Documents</h3>
              {[
                ['frd', 'FRD', '.pdf,.doc,.docx'],
                ['userStory', 'User Stories', '.pdf,.doc,.docx,.txt']
              ].map(([key, label, accept]) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                  </label>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Current: {editFileNames[key]}
                  </div>
                  <input
                    type="file"
                    id={`edit-${key}`}
                    accept={accept}
                    onChange={handleFileChange(`${key}File`, key)}
                    className="hidden"
                  />
                  <label
                    htmlFor={`edit-${key}`}
                    className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 cursor-pointer hover:border-indigo-500 flex items-center justify-center text-xs transition-all"
                  >
                    <i className="fas fa-upload mr-2"></i>
                    {editFormData[`${key}File`] ? editFormData[`${key}File`].name : 'Click to replace'}
                  </label>
                </div>
              ))}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setEditStep(1)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                >
                  <i className="fas fa-arrow-left mr-1"></i> Back
                </button>
                <button
                  onClick={() => setEditStep(3)}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 text-sm"
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
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Postman Collection
                </label>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Current: {editFileNames.postman}
                </div>
                <input
                  type="file"
                  id="edit-postman"
                  accept=".json"
                  onChange={handleFileChange('postmanFile', 'postman')}
                  className="hidden"
                />
                <label
                  htmlFor="edit-postman"
                  className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 cursor-pointer hover:border-indigo-500 flex flex-col items-center justify-center text-xs transition-all"
                >
                  <i className="fas fa-upload text-xl mb-1"></i>
                  {editFormData.postmanFile ? editFormData.postmanFile.name : 'Click to replace (optional)'}
                </label>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setEditStep(2)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                >
                  <i className="fas fa-arrow-left mr-1"></i> Back
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-500 hover:to-purple-500 text-sm shadow-lg"
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
