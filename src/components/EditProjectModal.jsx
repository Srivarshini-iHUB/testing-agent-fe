import React, { useState, useEffect, useRef } from 'react'
import { useUser } from '../contexts/UserContext'
import { projectApi } from '../api/projectApi'
import { useDialog } from '../contexts/DialogContext'

const EditProjectModal = ({ isOpen, onClose, onSave }) => {
  const { project } = useUser()
  const { confirm } = useDialog()
  const postmanFileInputRef = useRef(null)
  const nameCheckTimeoutRef = useRef(null)
  const initialProjectNameRef = useRef('')
  
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
    existingUserStoryFiles: [],  // Track existing files
    existingSwaggerFile: ''
  })

  const [nameCheckState, setNameCheckState] = useState({
    status: 'idle',
    exists: false,
    message: '',
  })

  // Helper function to normalize data to array (handles string, array, or null)
  const normalizeToArray = (data) => {
    if (!data) return []
    if (Array.isArray(data)) return data
    if (typeof data === 'string') {
      // If it's a comma-separated string, split it
      if (data.includes(',')) {
        return data.split(',').map(s => s.trim()).filter(s => s)
      }
      return [data]
    }
    return []
  }

  // Helper function to extract filename from URL
  const extractFilename = (url) => {
    if (!url) return ''
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      const filename = pathname.split('/').pop()
      return decodeURIComponent(filename || url)
    } catch {
      // If not a valid URL, return as is
      return url
    }
  }

  const resolveUserId = () => {
    if (project?.userId || project?.user_id) {
      return project.userId || project.user_id
    }

    try {
      const storedProject = localStorage.getItem('project')
      if (storedProject) {
        const parsedProject = JSON.parse(storedProject)
        if (parsedProject?.userId || parsedProject?.user_id) {
          return parsedProject.userId || parsedProject.user_id
        }
      }
    } catch (e) {
      console.error('Failed to parse stored project for userId:', e)
    }

    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        return parsedUser?.user_id || parsedUser?.id || null
      }
    } catch (e) {
      console.error('Failed to parse stored user for userId:', e)
    }

    return null
  }

  const persistProjectData = (updatedProject) => {
    if (!updatedProject) return

    initialProjectNameRef.current = updatedProject.name || updatedProject.projectName || ''

    const normalizedFrd = normalizeToArray(updatedProject.frdDocument)
    const normalizedUserStories = normalizeToArray(updatedProject.userStories)

    const projectDataToStore = {
      id: updatedProject.id,
      projectId: updatedProject.projectId,
      name: updatedProject.name,
      description: updatedProject.description,
      repository: updatedProject.repository,
      frdDocument: normalizedFrd,
      userStories: normalizedUserStories,
      postmanCollection: updatedProject.postmanCollection,
      projectUrl: updatedProject.projectUrl,
      userId: updatedProject.userId,
      isActive: updatedProject.isActive,
      createdAt: updatedProject.createdAt,
      updatedAt: updatedProject.updatedAt,
    }

    localStorage.setItem('project', JSON.stringify(projectDataToStore))

    setEditFormData(prev => ({
      ...prev,
      existingFrdFiles: normalizedFrd,
      existingUserStoryFiles: normalizedUserStories,
      existingSwaggerFile: updatedProject.postmanCollection || '',
    }))
  }

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      // First try to get from context project, then fallback to localStorage
      let projectData = project
      
      if (!projectData) {
        try {
          const storedProject = localStorage.getItem('project')
          if (storedProject) {
            projectData = JSON.parse(storedProject)
          }
        } catch (e) {
          console.error('Failed to parse project from localStorage:', e)
        }
      }

      if (projectData) {
        // Handle both singular and plural property names
        const frdData = projectData.frdDocuments || projectData.frdDocument || []
        const userStoriesData = projectData.userStories || projectData.userStory || []

        const initialName = projectData.name || projectData.projectName || ''
        initialProjectNameRef.current = initialName
        setNameCheckState({ status: 'unchanged', exists: false, message: '' })
        
        setEditFormData({
          projectName: projectData.name || projectData.projectName || '',
          projectDesc: projectData.description || projectData.projectDesc || '',
          projectURL: projectData.projectUrl || projectData.projectURL || '',
          repoUrl: projectData.repository || projectData.repoUrl || '',
          frdFiles: [],
          userStoryFiles: [],
          postmanFile: null,
          existingFrdFiles: normalizeToArray(frdData),
          existingUserStoryFiles: normalizeToArray(userStoriesData),
          existingSwaggerFile: projectData.postmanCollection || ''
        })
        setEditStep(1)
      }
    }
  }, [isOpen, project])

  const handleInputChange = (field) => (e) => {
    setEditFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  useEffect(() => {
    if (nameCheckTimeoutRef.current) {
      clearTimeout(nameCheckTimeoutRef.current)
      nameCheckTimeoutRef.current = null
    }

    const trimmedName = editFormData.projectName ? editFormData.projectName.trim() : ''

    if (!trimmedName) {
      setNameCheckState({ status: 'idle', exists: false, message: '' })
      return
    }

    const initialTrimmed = initialProjectNameRef.current
      ? initialProjectNameRef.current.trim()
      : ''

    if (initialTrimmed && trimmedName.toLowerCase() === initialTrimmed.toLowerCase()) {
      setNameCheckState({ status: 'unchanged', exists: false, message: '' })
      return
    }

    const userId = resolveUserId()

    if (!userId) {
      setNameCheckState({
        status: 'error',
        exists: false,
        message: 'Unable to determine user. Please refresh and try again.',
      })
      return
    }

    setNameCheckState({ status: 'loading', exists: false, message: '' })

    let isCancelled = false

    nameCheckTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await projectApi.checkProjectNameAvailability({
          userId,
          projectName: trimmedName,
        })

        if (isCancelled) return

        setNameCheckState({
          status: result.exists ? 'unavailable' : 'available',
          exists: Boolean(result.exists),
          message:
            result.message ||
            (result.exists
              ? 'Project name already exists for this user.'
              : 'Project name is available.'),
        })
      } catch (error) {
        if (isCancelled) return
        console.error('Failed to check project name availability:', error)
        setNameCheckState({
          status: 'error',
          exists: false,
          message: 'Unable to verify project name right now.',
        })
      }
    }, 400)

    return () => {
      isCancelled = true
      if (nameCheckTimeoutRef.current) {
        clearTimeout(nameCheckTimeoutRef.current)
        nameCheckTimeoutRef.current = null
      }
    }
  }, [editFormData.projectName, project])

  useEffect(() => {
    if (!isOpen && nameCheckTimeoutRef.current) {
      clearTimeout(nameCheckTimeoutRef.current)
      nameCheckTimeoutRef.current = null
      setNameCheckState({ status: 'idle', exists: false, message: '' })
    }
  }, [isOpen])

  // Handle multiple file uploads - upload immediately
  const handleMultipleFileChange = (fileType) => (e) => {
    if (e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      handleAddFile(fileType, newFiles)
      // Reset input
      e.target.value = ''
    }
  }

  // Remove newly added file (not yet saved)
  const removeNewFile = (fileType, index) => {
    setEditFormData(prev => ({
      ...prev,
      [fileType]: prev[fileType].filter((_, i) => i !== index)
    }))
  }

  // Remove existing file (already saved) - immediately update DB
  const removeExistingFile = async (fileType, index) => {
    const existingKey = fileType === 'frdFiles' ? 'existingFrdFiles' : 'existingUserStoryFiles'
    const apiFileType = fileType === 'frdFiles' ? 'frd' : 'user_story'

    // Get project ID
    let projectId = project?.id
    if (!projectId) {
      try {
        const storedProject = localStorage.getItem('project')
        if (storedProject) {
          const projectData = JSON.parse(storedProject)
          projectId = projectData.id
        }
      } catch (e) {
        console.error('Failed to parse project from localStorage:', e)
      }
    }

    if (!projectId) {
      showNotification('Project ID not found', 'error')
      return
    }

    const previousFiles = [...editFormData[existingKey]]
    const fileToRemove = previousFiles[index]

    if (!fileToRemove) {
      showNotification('File not found', 'error')
      return
    }

    // Optimistically update local state
    setEditFormData(prev => ({
      ...prev,
      [existingKey]: prev[existingKey].filter((_, i) => i !== index)
    }))

    try {
      await projectApi.deleteProjectFile(projectId, {
        fileUrl: fileToRemove,
        fileType: apiFileType
      })

      const updatedProject = await projectApi.getProject(projectId)
      persistProjectData(updatedProject)

      showNotification('File removed successfully', 'success')
    } catch (error) {
      console.error('Failed to remove file:', error)
      showNotification('Failed to remove file', 'error')
      // Revert state on error
      setEditFormData(prev => ({
        ...prev,
        [existingKey]: previousFiles
      }))
    }
  }

  // Replace existing file - upload new file and update DB
  const replaceExistingFile = async (fileType, index, newFile) => {
    const existingKey = fileType === 'frdFiles' ? 'existingFrdFiles' : 'existingUserStoryFiles'
    const fieldName = fileType === 'frdFiles' ? 'frd' : 'user_story'
    const folder = fileType === 'frdFiles' ? 'frd' : 'user_stories'
    
    // Get project ID
    let projectId = project?.id
    if (!projectId) {
      try {
        const storedProject = localStorage.getItem('project')
        if (storedProject) {
          const projectData = JSON.parse(storedProject)
          projectId = projectData.id
        }
      } catch (e) {
        console.error('Failed to parse project from localStorage:', e)
      }
    }

    if (!projectId) {
      showNotification('Project ID not found', 'error')
      return
    }

    try {
      showNotification('Uploading file...', 'info')
      
      // Upload new file to Cloudinary via API
      const uploadFormData = new FormData()
      const filesKey = fileType === 'frdFiles' ? 'frd' : 'user_story'
      uploadFormData.append(filesKey, newFile)

      // Upload and get the new URL
      await projectApi.updateProject(projectId, uploadFormData)
      
      // Get the updated project to get the new URL
      const updatedProject = await projectApi.getProject(projectId)
      const updatedFiles = normalizeToArray(
        fileType === 'frdFiles' ? updatedProject.frdDocument : updatedProject.userStories
      )
      
      // Replace the file at the index
      const currentFiles = [...editFormData[existingKey]]
      currentFiles[index] = updatedFiles[updatedFiles.length - 1] // Latest uploaded file
      
      // Update DB with the replaced array - send as FormData with JSON string
      const updateFormData = new FormData()
      const arrayFieldName = fileType === 'frdFiles' ? 'frd_array' : 'user_story_array'
      updateFormData.append(arrayFieldName, JSON.stringify(currentFiles))
      await projectApi.updateProject(projectId, updateFormData)
      
      // Refresh project data
      const finalProject = await projectApi.getProject(projectId)
      persistProjectData(finalProject)
      
      showNotification('File replaced successfully', 'success')
    } catch (error) {
      console.error('Failed to replace file:', error)
      showNotification('Failed to replace file', 'error')
    }
  }

  const removeSwaggerFile = async () => {
    const previousSwaggerFile = editFormData.existingSwaggerFile

    if (!previousSwaggerFile) {
      showNotification('No Swagger file to remove', 'warning')
      return
    }

    // Get project ID
    let projectId = project?.id
    if (!projectId) {
      try {
        const storedProject = localStorage.getItem('project')
        if (storedProject) {
          const projectData = JSON.parse(storedProject)
          projectId = projectData.id
        }
      } catch (e) {
        console.error('Failed to parse project from localStorage:', e)
      }
    }

    if (!projectId) {
      showNotification('Project ID not found', 'error')
      return
    }

    // Optimistically update UI
    setEditFormData(prev => ({
      ...prev,
      existingSwaggerFile: ''
    }))

    try {
      await projectApi.deleteProjectFile(projectId, {
        fileUrl: previousSwaggerFile,
        fileType: 'swagger'
      })

      const updatedProject = await projectApi.getProject(projectId)
      persistProjectData(updatedProject)

      showNotification('Swagger file removed successfully', 'success')
    } catch (error) {
      console.error('Failed to remove Swagger file:', error)
      showNotification('Failed to remove Swagger file', 'error')
      setEditFormData(prev => ({
        ...prev,
        existingSwaggerFile: previousSwaggerFile
      }))
    }
  }

  // Handle replace file button click
  const handleReplaceFile = (fileType, index) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = fileType === 'frdFiles' ? '.pdf,.doc,.docx' : '.pdf,.doc,.docx,.txt'
    input.onchange = (e) => {
      if (e.target.files.length > 0) {
        replaceExistingFile(fileType, index, e.target.files[0])
      }
    }
    input.click()
  }

  // Handle add new file - upload immediately and update DB
  const handleAddFile = async (fileType, files) => {
    const fieldName = fileType === 'frdFiles' ? 'frd' : 'user_story'
    
    // Get project ID
    let projectId = project?.id
    if (!projectId) {
      try {
        const storedProject = localStorage.getItem('project')
        if (storedProject) {
          const projectData = JSON.parse(storedProject)
          projectId = projectData.id
        }
      } catch (e) {
        console.error('Failed to parse project from localStorage:', e)
      }
    }

    if (!projectId) {
      showNotification('Project ID not found', 'error')
      return
    }

    try {
      showNotification('Uploading files...', 'info')
      
      // Upload files to Cloudinary via API
      const formData = new FormData()
      const filesKey = fileType === 'frdFiles' ? 'frd' : 'user_story'
      Array.from(files).forEach(file => {
        formData.append(filesKey, file)
      })

      await projectApi.updateProject(projectId, formData)
      
      // Refresh project data
      const updatedProject = await projectApi.getProject(projectId)
      persistProjectData(updatedProject)

      // Clear new files since they're now uploaded
      setEditFormData(prev => ({
        ...prev,
        [fileType]: []
      }))
      
      showNotification('Files uploaded successfully', 'success')
    } catch (error) {
      console.error('Failed to upload files:', error)
      showNotification('Failed to upload files', 'error')
    }
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
    confirm({
      title: 'Discard changes?',
      message: 'Your unsaved edits will be lost. Do you still want to close?',
      confirmText: 'Discard',
      cancelText: 'Keep editing',
      variant: 'warning',
    }).then((shouldClose) => {
      if (shouldClose) {
        onClose()
      }
    })
  }

  const handleSave = async () => {
    const trimmedProjectName = editFormData.projectName ? editFormData.projectName.trim() : ''
    const trimmedRepoUrl = editFormData.repoUrl ? editFormData.repoUrl.trim() : ''

    // Validate required fields
    if (!trimmedProjectName || !trimmedRepoUrl) {
      showNotification('Please fill in all required fields', 'error')
      return
    }

    if (nameCheckState.status === 'loading') {
      showNotification('Please wait while we verify your project name', 'info')
      return
    }

    if (nameCheckState.exists || nameCheckState.status === 'unavailable') {
      showNotification(nameCheckState.message || 'Project name already exists for this user', 'error')
      return
    }

    if (nameCheckState.status === 'error') {
      showNotification(nameCheckState.message || 'Unable to verify project name right now.', 'error')
      return
    }

    try {
      // Get project ID - try from context project first, then localStorage
      let projectId = project?.id
      if (!projectId) {
        try {
          const storedProject = localStorage.getItem('project')
          if (storedProject) {
            const projectData = JSON.parse(storedProject)
            projectId = projectData.id
          }
        } catch (e) {
          console.error('Failed to parse project from localStorage:', e)
        }
      }

      if (!projectId) {
        showNotification('Project ID not found. Please select a project first.', 'error')
        return
      }

      const userId = resolveUserId()

      if (!userId) {
        showNotification('Unable to determine user. Please refresh and try again.', 'error')
        return
      }

      const initialTrimmed = initialProjectNameRef.current
        ? initialProjectNameRef.current.trim()
        : ''

      if (trimmedProjectName.toLowerCase() !== initialTrimmed.toLowerCase()) {
        try {
          const availability = await projectApi.checkProjectNameAvailability({
            userId,
            projectName: trimmedProjectName,
          })

          if (availability.exists) {
            showNotification(
              availability.message || 'Project name already exists for this user',
              'error'
            )
            return
          }
        } catch (error) {
          console.error('Failed to verify project name before saving project:', error)
          showNotification('Unable to verify project name. Please try again.', 'error')
          return
        }
      }

      // Prepare updated data for API - convert to FormData since backend expects Form fields
      const formData = new FormData()
      
      // Add text fields
      if (trimmedProjectName) {
        formData.append('project_name', trimmedProjectName)
      }
      if (editFormData.projectDesc) {
        formData.append('project_description', editFormData.projectDesc)
      }
      if (trimmedRepoUrl) {
        formData.append('github_repo_id', trimmedRepoUrl)
      }
      // Always send project_url (empty string will be converted to None by backend)
      formData.append('project_url', editFormData.projectURL || '')
      
      // Add file arrays as JSON strings (if they exist)
      if (editFormData.existingFrdFiles.length > 0) {
        formData.append('frd_array', JSON.stringify(editFormData.existingFrdFiles))
      }
      if (editFormData.existingUserStoryFiles.length > 0) {
        formData.append('user_story_array', JSON.stringify(editFormData.existingUserStoryFiles))
      }
      
      // Add Postman/Swagger file if selected
      if (editFormData.postmanFile) {
        formData.append('swagger_documentation', editFormData.postmanFile)
      }

      // Call updateProject API
      await projectApi.updateProject(projectId, formData)

      // Fetch updated project data
      const updatedProject = await projectApi.getProject(projectId)

      // Update local state/localStorage with the fresh project data
      persistProjectData(updatedProject)

      showNotification('Project updated successfully!', 'success')
      if (onSave) {
        onSave(updatedProject)
      }
      onClose()
    } catch (error) {
      console.error('Failed to update project:', error)
      showNotification('Failed to update project. Please try again.', 'error')
    }
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
                {nameCheckState.status === 'loading' && (
                  <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">Checking availability...</p>
                )}
                {nameCheckState.status === 'unavailable' && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                    {nameCheckState.message || 'Project name already exists for this user.'}
                  </p>
                )}
                {nameCheckState.status === 'available' && (
                  <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                    {nameCheckState.message || 'Project name is available.'}
                  </p>
                )}
                {nameCheckState.status === 'error' && (
                  <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                    {nameCheckState.message || 'Unable to verify project name right now.'}
                  </p>
                )}
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
                disabled={
                  nameCheckState.status === 'loading' ||
                  nameCheckState.status === 'unavailable' ||
                  nameCheckState.exists
                }
                className="w-full mt-4 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
                    {editFormData.existingFrdFiles.map((fileUrl, index) => {
                      const fileName = extractFilename(fileUrl)
                      const isUrl = fileUrl && (fileUrl.startsWith('http://') || fileUrl.startsWith('https://'))
                      return (
                        <div key={`existing-frd-${index}`} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <i className="fas fa-file-pdf text-gray-600 dark:text-gray-400 text-sm"></i>
                            {isUrl ? (
                              <a 
                                href={fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate flex-1 min-w-0"
                                title={fileUrl}
                              >
                                {fileName || fileUrl}
                              </a>
                            ) : (
                              <span className="text-sm text-gray-900 dark:text-white truncate">{fileName || fileUrl}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={() => handleReplaceFile('frdFiles', index)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                              title="Replace file"
                            >
                              <i className="fas fa-exchange-alt text-blue-600 dark:text-blue-400 text-sm"></i>
                            </button>
                            <button
                              onClick={() => removeExistingFile('frdFiles', index)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                              title="Delete file"
                            >
                              <i className="fas fa-times text-red-600 dark:text-red-400 text-sm"></i>
                            </button>
                          </div>
                        </div>
                      )
                    })}
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
                    {editFormData.existingUserStoryFiles.map((fileUrl, index) => {
                      const fileName = extractFilename(fileUrl)
                      const isUrl = fileUrl && (fileUrl.startsWith('http://') || fileUrl.startsWith('https://'))
                      return (
                        <div key={`existing-story-${index}`} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <i className="fas fa-file-alt text-gray-600 dark:text-gray-400 text-sm"></i>
                            {isUrl ? (
                              <a 
                                href={fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate flex-1 min-w-0"
                                title={fileUrl}
                              >
                                {fileName || fileUrl}
                              </a>
                            ) : (
                              <span className="text-sm text-gray-900 dark:text-white truncate">{fileName || fileUrl}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={() => handleReplaceFile('userStoryFiles', index)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                              title="Replace file"
                            >
                              <i className="fas fa-exchange-alt text-blue-600 dark:text-blue-400 text-sm"></i>
                            </button>
                            <button
                              onClick={() => removeExistingFile('userStoryFiles', index)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                              title="Delete file"
                            >
                              <i className="fas fa-times text-red-600 dark:text-red-400 text-sm"></i>
                            </button>
                          </div>
                        </div>
                      )
                    })}
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
                  Swagger File
                </label>
                {editFormData.existingSwaggerFile ? (
                  <div className="mb-2 flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <i className="fas fa-file-code text-gray-600 dark:text-gray-400"></i>
                      <a
                        href={editFormData.existingSwaggerFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate flex-1 min-w-0"
                        title={editFormData.existingSwaggerFile}
                      >
                        {extractFilename(editFormData.existingSwaggerFile)}
                      </a>
                    </div>
                    <button
                      onClick={removeSwaggerFile}
                      className="w-7 h-7 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                      title="Remove Swagger file"
                    >
                      <i className="fas fa-times text-red-600 dark:text-red-400 text-sm"></i>
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Current: None
                  </div>
                )}
                <input
                  ref={postmanFileInputRef}
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
                      onClick={() => {
                        setEditFormData(prev => ({ ...prev, postmanFile: null }))
                        // Reset the file input so the same file can be selected again
                        if (postmanFileInputRef.current) {
                          postmanFileInputRef.current.value = ''
                        }
                      }}
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
