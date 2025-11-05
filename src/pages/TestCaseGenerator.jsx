import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTestCaseGeneration } from '../hooks/useTestCaseGeneration';
import { useDownload } from '../hooks/useDownload';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { testCaseApi } from '../api/testCaseApi';
import { projectApi } from '../api/projectApi';
import InsufficientAlert from '../components/testcase/InsufficientAlert';
import MismatchAlert from '../components/testcase/MismatchAlert';
import IncompleteStoriesAlert from '../components/testcase/IncompleteStoriesAlert';
import ProgressBar from '../components/testcase/ProgressBar';
import ResultsDashboard from '../components/testcase/ResultsDashboard';
import TestCaseTable from '../components/testcase/TestCaseTable';
import TestCaseModal from '../components/testcase/TestCaseModal';
import TestCaseHistory from '../components/agentHistory/TestCaseHistory';

function TestCaseGenerator() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, project: contextProject } = useUser();
  const [frdFiles, setFrdFiles] = useState([]);
  const [userStoryFiles, setUserStoryFiles] = useState([]);
  const [selectedTestCase, setSelectedTestCase] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { loading, progress, result, error, generate } = useTestCaseGeneration();
  const { downloading, downloadExcel, downloadJSON } = useDownload();
  const { isDark } = useTheme();
  
  // Project data and source selection
  const [projectData, setProjectData] = useState(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [useProjectFrd, setUseProjectFrd] = useState(false);
  const [useProjectUserStory, setUseProjectUserStory] = useState(false);
  const [selectedFrdUrl, setSelectedFrdUrl] = useState(null);
  const [selectedUserStoryUrl, setSelectedUserStoryUrl] = useState(null);
  const [uploadingFrd, setUploadingFrd] = useState(false);
  const [uploadingUserStory, setUploadingUserStory] = useState(false);
  
  // Tab and History states
  // Check if URL hash is #history to open history tab
  const [activeTab, setActiveTab] = useState(() => {
    return location.hash === '#history' ? 'history' : 'generator';
  });
  const [historyResult, setHistoryResult] = useState(null); // Override result when viewing history
  const [historyList, setHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);
  
  // Use historyResult only in history tab, otherwise use current result
  const displayResult = activeTab === 'history' ? (historyResult || null) : result;

  // Fetch project data to get FRD and User Story URLs
  useEffect(() => {
    const fetchProjectData = async () => {
      setProjectLoading(true);
      try {
        const proj = JSON.parse(localStorage.getItem('project') || 'null');
        const projectId = proj?.id || proj?.projectId;
        
        if (!projectId) {
          setProjectData(null);
          setProjectLoading(false);
          return;
        }

        // Try to fetch project from API
        try {
          const fetchedProject = await projectApi.getProject(projectId);
          setProjectData(fetchedProject);
          
          // Auto-select project files if available
          if (fetchedProject.frdDocument) {
            const frdUrls = Array.isArray(fetchedProject.frdDocument) 
              ? fetchedProject.frdDocument 
              : [fetchedProject.frdDocument];
            if (frdUrls.length > 0 && frdUrls[0]) {
              setUseProjectFrd(true);
              setSelectedFrdUrl(frdUrls[0]);
            }
          }
          
          if (fetchedProject.userStories) {
            const userStoryUrls = Array.isArray(fetchedProject.userStories)
              ? fetchedProject.userStories
              : [fetchedProject.userStories];
            if (userStoryUrls.length > 0 && userStoryUrls[0]) {
              setUseProjectUserStory(true);
              setSelectedUserStoryUrl(userStoryUrls[0]);
            }
          }
        } catch (err) {
          // Fallback to localStorage project data
          console.warn('Failed to fetch project from API, using localStorage:', err);
          setProjectData(proj);
        }
      } catch (err) {
        console.error('Error fetching project data:', err);
        setProjectData(null);
      } finally {
        setProjectLoading(false);
      }
    };

    fetchProjectData();
  }, []);

  // Handle URL hash changes to switch tabs
  useEffect(() => {
    if (location.hash === '#history') {
      setActiveTab('history');
      setHistoryResult(null);
      setSelectedHistoryId(null);
      fetchHistoryList();
    } else if (location.hash === '#generator' || !location.hash) {
      setActiveTab('generator');
      setHistoryResult(null);
      setSelectedHistoryId(null);
    }
  }, [location.hash]);

  const handleGenerate = async () => {
    try {
      setHistoryResult(null); // Clear history result when generating new
      setActiveTab('generator'); // Switch back to generator tab
      
      // Get project ID
      const proj = projectData || JSON.parse(localStorage.getItem('project') || 'null');
      const projectId = proj?.id || proj?.projectId;
      const userId = user?.user_id || null;
      
      // Prepare FRD URLs and User Story URLs
      const frdUrls = useProjectFrd && selectedFrdUrl ? [selectedFrdUrl] : [];
      const userStoryUrls = useProjectUserStory && selectedUserStoryUrl ? [selectedUserStoryUrl] : [];
      
      // Only pass files if not using project URLs
      const filesToSend = useProjectFrd ? [] : frdFiles;
      const userStoryFilesToSend = useProjectUserStory ? [] : userStoryFiles;
      
      await generate(filesToSend, userStoryFilesToSend, frdUrls, userStoryUrls, projectId, userId);
    } catch (err) {
      // Error handled in hook
    }
  };

  // Fetch history list when switching to history tab
  const fetchHistoryList = async () => {
    setHistoryLoading(true);
    try {
      const proj = JSON.parse(localStorage.getItem('project') || 'null');
      const projectId = proj?.id;
      
      if (!projectId) {
        setHistoryList([]);
        return;
      }
      
      const data = await testCaseApi.getProjectTestCaseGenerations(projectId);
      setHistoryList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load history list:', err);
      setHistoryList([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Load historical result into display format (using data from history list)
  // Toggle: if already selected, deselect it; otherwise, load it
  const handleLoadHistory = (generationId) => {
    try {
      // If clicking the same generation that's already selected, toggle it off
      if (selectedHistoryId === generationId && historyResult) {
        setHistoryResult(null);
        setSelectedHistoryId(null);
        return;
      }
      
      // Find the generation in the history list
      const generation = historyList.find(
        (gen) => (gen.id || gen.testcase_id) === generationId
      );
      
      if (!generation) {
        console.error('Generation not found in history list:', generationId);
        return;
      }
      
      // Transform history data to match the result format expected by components
      const transformedResult = {
        status: 'ok',
        extraction: {
          total_features: generation.generation_metadata?.total_features || 0,
          total_stories: generation.generation_metadata?.total_stories || 0,
        },
        analysis: {
          total_features_mapped: generation.generation_metadata?.total_features_mapped || 0,
        },
        test_cases: {
          total_test_cases: generation.generation_metadata?.total_test_cases || generation.test_cases?.length || 0,
          test_cases: generation.test_cases || [],
        },
        mismatched_features: generation.generation_metadata?.mismatched_features,
        incomplete_user_stories: generation.generation_metadata?.incomplete_user_stories,
      };
      
      setHistoryResult(transformedResult);
      setSelectedHistoryId(generationId);
    } catch (err) {
      console.error('Failed to load historical result:', err);
    }
  };

  // Switch to history tab and load list
  const handleHistoryTabClick = () => {
    setActiveTab('history');
    setHistoryResult(null);
    setSelectedHistoryId(null);
    window.location.hash = '#history';
    fetchHistoryList();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-900 text-gray-900 dark:text-white p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Back Button & Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-4 flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-300 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-gray-700 dark:text-gray-300 font-semibold transition-all"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </button>

          <div className="flex items-center gap-3">
            <div className="text-indigo-700 dark:text-indigo-300 w-24 h-24 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
              <i className="fas fa-file-alt text-4xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Test Case Generator</h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">AI-powered test case generation from requirements and user stories</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 bg-transparent rounded-t-xl overflow-hidden">
          <div className="flex border-b-2 border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setActiveTab('generator');
                setHistoryResult(null); // Clear history result when switching to generator tab
                setSelectedHistoryId(null);
                window.location.hash = '#generator';
              }}
              className={`px-6 py-3 font-semibold text-sm transition-all ${
                activeTab === 'generator'
                  ? 'bg-transparent text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                  : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              TEST CASE GENERATOR
            </button>
            <button
              onClick={handleHistoryTabClick}
              className={`px-6 py-3 font-semibold text-sm transition-all ${
                activeTab === 'history'
                  ? 'bg-transparent text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                  : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              AGENT HISTORY
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'generator' && (
              <div className="space-y-6">
                {/* Main Configuration and Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Configuration Panel */}
                  <div className="lg:col-span-2 bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                    <div className="flex items-center gap-2 mb-6">
                      <i className="fas fa-cog text-indigo-600 dark:text-indigo-400"></i>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Test Configuration</h2>
                    </div>

                    <div className="space-y-6">
                      {/* FRD Upload */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Functional Requirements Document <span className="text-rose-500 dark:text-rose-400">*</span>
                        </label>
                        
                        {/* Source Selection Toggle */}
                        {projectData && projectData.frdDocument && (
                          <div className="mb-3 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setUseProjectFrd(true);
                                setFrdFiles([]);
                                const frdUrls = Array.isArray(projectData.frdDocument) 
                                  ? projectData.frdDocument 
                                  : [projectData.frdDocument];
                                if (frdUrls.length > 0) setSelectedFrdUrl(frdUrls[0]);
                              }}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                useProjectFrd
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                            >
                              <i className="fas fa-database"></i>
                              Use from Project
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setUseProjectFrd(false);
                                setSelectedFrdUrl(null);
                              }}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                !useProjectFrd
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                            >
                              <i className="fas fa-upload"></i>
                              Upload New Files
                            </button>
                          </div>
                        )}

                        {/* Project FRD Selection */}
                        {useProjectFrd && projectData && projectData.frdDocument && (
                          <div className="mb-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl">
                            <label className="block text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
                              Select FRD from Project:
                            </label>
                            <div className="space-y-2">
                              {(Array.isArray(projectData.frdDocument) ? projectData.frdDocument : [projectData.frdDocument]).map((url, idx) => (
                                <label key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
                                  <input
                                    type="radio"
                                    name="frd-url"
                                    checked={selectedFrdUrl === url}
                                    onChange={() => setSelectedFrdUrl(url)}
                                    className="text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                                      {url.split('/').pop() || `FRD Document ${idx + 1}`}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{url}</p>
                                  </div>
                                  <i className="fas fa-check-circle text-indigo-600 dark:text-indigo-400"></i>
                                </label>
                              ))}
                            </div>
                            {selectedFrdUrl && (
                              <div className="mt-2 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                                    <i className="fas fa-check-circle mr-1"></i>
                                    Selected: <span className="font-semibold">{selectedFrdUrl.split('/').pop()}</span>
                                  </p>
                                  <button
                                    onClick={() => {
                                      const fileName = selectedFrdUrl.split('/').pop() || '';
                                      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
                                      
                                      // For PDF files, open directly in browser
                                      if (fileExtension === 'pdf') {
                                        window.open(selectedFrdUrl, '_blank', 'noopener,noreferrer');
                                      }
                                      // For DOCX files, use Google Docs Viewer
                                      else if (fileExtension === 'docx' || fileExtension === 'doc') {
                                        const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(selectedFrdUrl)}&embedded=true`;
                                        window.open(viewerUrl, '_blank', 'noopener,noreferrer');
                                      }
                                      // For TXT files, open directly
                                      else if (fileExtension === 'txt') {
                                        window.open(selectedFrdUrl, '_blank', 'noopener,noreferrer');
                                      }
                                      // For other files, try to open directly
                                      else {
                                        window.open(selectedFrdUrl, '_blank', 'noopener,noreferrer');
                                      }
                                    }}
                                    className="ml-2 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium transition-all flex items-center gap-1"
                                    title="Preview in new tab"
                                  >
                                    <i className="fas fa-external-link-alt"></i>
                                    Preview
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* File Upload */}
                        {!useProjectFrd && (
                          <div className="relative">
                            <input
                              type="file"
                              multiple
                              accept=".pdf,.docx,.txt"
                              onChange={async (e) => {
                                const files = Array.from(e.target.files);
                                if (files.length > 0) {
                                  setFrdFiles(files);
                                  
                                  // Auto-save to project DB if project exists
                                  if (projectData && projectData.id) {
                                    setUploadingFrd(true);
                                    try {
                                      const formData = new FormData();
                                      files.forEach(file => {
                                        formData.append('frd', file);
                                      });
                                      
                                      const updatedProject = await projectApi.updateProject(projectData.id, formData);
                                      setProjectData(updatedProject);
                                      
                                      // Auto-select the uploaded files after save
                                      if (updatedProject.frdDocument) {
                                        const frdUrls = Array.isArray(updatedProject.frdDocument) 
                                          ? updatedProject.frdDocument 
                                          : [updatedProject.frdDocument];
                                        if (frdUrls.length > 0) {
                                          // Select the newly uploaded files
                                          const newUrls = frdUrls.slice(-files.length); // Get the last N URLs (newly uploaded)
                                          if (newUrls.length > 0) {
                                            setSelectedFrdUrl(newUrls[0]);
                                            setUseProjectFrd(true);
                                            setFrdFiles([]); // Clear local files since they're now in DB
                                          }
                                        }
                                      }
                                    } catch (err) {
                                      console.error('Failed to save FRD to project:', err);
                                      // Keep files for manual upload if save fails
                                    } finally {
                                      setUploadingFrd(false);
                                    }
                                  }
                                }
                              }}
                              id="frd-upload"
                              className="hidden"
                              disabled={useProjectFrd || uploadingFrd}
                            />
                            <label
                              htmlFor="frd-upload"
                              className={`block w-full bg-gray-50 dark:bg-gray-900/50 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-900/70 ${
                                (useProjectFrd || uploadingFrd) ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              <i className={`fas ${uploadingFrd ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'} text-3xl text-gray-400 dark:text-gray-400 mb-2 block`}></i>
                              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                {uploadingFrd ? 'Uploading and saving to project...' : 'Click to upload FRD (auto-saves to project)'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">PDF, DOCX, TXT (Max 10MB)</p>
                            </label>
                          </div>
                        )}

                        {frdFiles.length > 0 && !useProjectFrd && (
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                <i className="fas fa-check-circle mr-1"></i>
                                {frdFiles.length} file{frdFiles.length > 1 ? 's' : ''} selected
                              </span>
                              <button
                                onClick={() => setFrdFiles([])}
                                className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-semibold"
                              >
                                <i className="fas fa-times mr-1"></i>Clear
                              </button>
                            </div>
                            <div className="space-y-2 max-h-24 overflow-y-auto custom-scrollbar">
                              {frdFiles.map((file, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900/50 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                  <i className="fas fa-file-pdf text-blue-500 dark:text-blue-400"></i>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{file.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* User Stories Upload */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          User Stories Document <span className="text-rose-500 dark:text-rose-400">*</span>
                        </label>
                        
                        {/* Source Selection Toggle */}
                        {projectData && projectData.userStories && (
                          <div className="mb-3 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setUseProjectUserStory(true);
                                setUserStoryFiles([]);
                                const userStoryUrls = Array.isArray(projectData.userStories) 
                                  ? projectData.userStories 
                                  : [projectData.userStories];
                                if (userStoryUrls.length > 0) setSelectedUserStoryUrl(userStoryUrls[0]);
                              }}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                useProjectUserStory
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                            >
                              <i className="fas fa-database"></i>
                              Use from Project
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setUseProjectUserStory(false);
                                setSelectedUserStoryUrl(null);
                              }}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                !useProjectUserStory
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                            >
                              <i className="fas fa-upload"></i>
                              Upload New Files
                            </button>
                          </div>
                        )}

                        {/* Project User Story Selection */}
                        {useProjectUserStory && projectData && projectData.userStories && (
                          <div className="mb-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl">
                            <label className="block text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
                              Select User Story from Project:
                            </label>
                            <div className="space-y-2">
                              {(Array.isArray(projectData.userStories) ? projectData.userStories : [projectData.userStories]).map((url, idx) => (
                                <label key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
                                  <input
                                    type="radio"
                                    name="user-story-url"
                                    checked={selectedUserStoryUrl === url}
                                    onChange={() => setSelectedUserStoryUrl(url)}
                                    className="text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                                      {url.split('/').pop() || `User Story ${idx + 1}`}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{url}</p>
                                  </div>
                                  <i className="fas fa-check-circle text-indigo-600 dark:text-indigo-400"></i>
                                </label>
                              ))}
                            </div>
                            {selectedUserStoryUrl && (
                              <div className="mt-2 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                                    <i className="fas fa-check-circle mr-1"></i>
                                    Selected: <span className="font-semibold">{selectedUserStoryUrl.split('/').pop()}</span>
                                  </p>
                                  <button
                                    onClick={() => {
                                      const fileName = selectedUserStoryUrl.split('/').pop() || '';
                                      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
                                      
                                      // For PDF files, open directly in browser
                                      if (fileExtension === 'pdf') {
                                        window.open(selectedUserStoryUrl, '_blank', 'noopener,noreferrer');
                                      }
                                      // For DOCX files, use Google Docs Viewer
                                      else if (fileExtension === 'docx' || fileExtension === 'doc') {
                                        const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(selectedUserStoryUrl)}&embedded=true`;
                                        window.open(viewerUrl, '_blank', 'noopener,noreferrer');
                                      }
                                      // For TXT files, open directly
                                      else if (fileExtension === 'txt') {
                                        window.open(selectedUserStoryUrl, '_blank', 'noopener,noreferrer');
                                      }
                                      // For other files, try to open directly
                                      else {
                                        window.open(selectedUserStoryUrl, '_blank', 'noopener,noreferrer');
                                      }
                                    }}
                                    className="ml-2 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium transition-all flex items-center gap-1"
                                    title="Preview in new tab"
                                  >
                                    <i className="fas fa-external-link-alt"></i>
                                    Preview
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* File Upload */}
                        {!useProjectUserStory && (
                          <div className="relative">
                            <input
                              type="file"
                              multiple
                              accept=".pdf,.docx,.txt"
                              onChange={async (e) => {
                                const files = Array.from(e.target.files);
                                if (files.length > 0) {
                                  setUserStoryFiles(files);
                                  
                                  // Auto-save to project DB if project exists
                                  if (projectData && projectData.id) {
                                    setUploadingUserStory(true);
                                    try {
                                      const formData = new FormData();
                                      files.forEach(file => {
                                        formData.append('user_story', file);
                                      });
                                      
                                      const updatedProject = await projectApi.updateProject(projectData.id, formData);
                                      setProjectData(updatedProject);
                                      
                                      // Auto-select the uploaded files after save
                                      if (updatedProject.userStories) {
                                        const userStoryUrls = Array.isArray(updatedProject.userStories) 
                                          ? updatedProject.userStories 
                                          : [updatedProject.userStories];
                                        if (userStoryUrls.length > 0) {
                                          // Select the newly uploaded files
                                          const newUrls = userStoryUrls.slice(-files.length); // Get the last N URLs (newly uploaded)
                                          if (newUrls.length > 0) {
                                            setSelectedUserStoryUrl(newUrls[0]);
                                            setUseProjectUserStory(true);
                                            setUserStoryFiles([]); // Clear local files since they're now in DB
                                          }
                                        }
                                      }
                                    } catch (err) {
                                      console.error('Failed to save User Story to project:', err);
                                      // Keep files for manual upload if save fails
                                    } finally {
                                      setUploadingUserStory(false);
                                    }
                                  }
                                }
                              }}
                              id="userstory-upload"
                              className="hidden"
                              disabled={useProjectUserStory || uploadingUserStory}
                            />
                            <label
                              htmlFor="userstory-upload"
                              className={`block w-full bg-gray-50 dark:bg-gray-900/50 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-500 rounded-xl p-6 text-center cursor-pointer transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-900/70 ${
                                (useProjectUserStory || uploadingUserStory) ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              <i className={`fas ${uploadingUserStory ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'} text-3xl text-gray-400 dark:text-gray-400 mb-2 block`}></i>
                              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                {uploadingUserStory ? 'Uploading and saving to project...' : 'Click to upload User Story (auto-saves to project)'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">PDF, DOCX, TXT (Max 10MB)</p>
                            </label>
                          </div>
                        )}

                        {userStoryFiles.length > 0 && !useProjectUserStory && (
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                <i className="fas fa-check-circle mr-1"></i>
                                {userStoryFiles.length} file{userStoryFiles.length > 1 ? 's' : ''} selected
                              </span>
                              <button
                                onClick={() => setUserStoryFiles([])}
                                className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-semibold"
                              >
                                <i className="fas fa-times mr-1"></i>Clear
                              </button>
                            </div>
                            <div className="space-y-2 max-h-24 overflow-y-auto custom-scrollbar">
                              {userStoryFiles.map((file, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900/50 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                  <i className="fas fa-file-word text-purple-500 dark:text-purple-400"></i>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{file.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Advanced Options Toggle */}
                      <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition-colors"
                      >
                        <i className={`fas fa-cog ${showAdvanced ? 'fa-spin' : ''}`}></i>
                        {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                      </button>

                      {showAdvanced && (
                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-200 dark:border-gray-700/50">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Test Types</label>
                            <select className="w-full bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:outline-none">
                              <option>All Types</option>
                              <option>Positive Only</option>
                              <option>Negative Only</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Priority</label>
                            <select className="w-full bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:outline-none">
                              <option>All Priorities</option>
                              <option>Critical & High</option>
                              <option>Medium & Low</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Panel */}
                  <div className="space-y-6">
                    {/* Start Button */}
                    <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                      <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Actions</h2>
                      <button
                        onClick={handleGenerate}
                        disabled={loading || (!frdFiles.length && !selectedFrdUrl) || (!userStoryFiles.length && !selectedUserStoryUrl)}
                        className="w-full bg-emerald-500 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-400 disabled:to-gray-500 dark:disabled:from-gray-600 dark:disabled:to-gray-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-play'}`}></i>
                        {loading ? 'Generating...' : 'Start Test Generation'}
                      </button>

                      {((!frdFiles.length && !selectedFrdUrl) || (!userStoryFiles.length && !selectedUserStoryUrl)) && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                          <i className="fas fa-info-circle mr-1"></i>
                          {(!frdFiles.length && !selectedFrdUrl) && (!userStoryFiles.length && !selectedUserStoryUrl)
                            ? 'Provide both FRD and User Story documents to continue'
                            : (!frdFiles.length && !selectedFrdUrl)
                            ? 'Provide FRD document to continue'
                            : 'Provide User Story document to continue'}
                        </p>
                      )}
                    </div>

                    {/* Quick Tips */}
                    <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                      <div className="flex items-center gap-2 mb-4">
                        <i className="fas fa-lightbulb text-yellow-500 dark:text-yellow-400"></i>
                        <h3 className="font-bold text-gray-900 dark:text-white">Quick Tips</h3>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                          <i className="fas fa-check text-emerald-600 dark:text-emerald-400 mt-1"></i>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-300">Complete Coverage</p>
                            <p className="text-gray-600 dark:text-gray-400 text-xs">Generates positive, negative, edge & boundary cases</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <i className="fas fa-robot text-indigo-600 dark:text-indigo-400 mt-1"></i>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-300">AI-Powered</p>
                            <p className="text-gray-600 dark:text-gray-400 text-xs">Automatically maps features to user stories</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <i className="fas fa-download text-purple-600 dark:text-purple-400 mt-1"></i>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-300">Export Ready</p>
                            <p className="text-gray-600 dark:text-gray-400 text-xs">Download in Excel or JSON format</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {loading && (
                  <div>
                    <ProgressBar progress={progress} />
                  </div>
                )}

                {/* Error Alert */}
                {error && !result && (
                  <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-300 dark:border-rose-500 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <i className="fas fa-exclamation-triangle text-rose-600 dark:text-rose-400 text-xl"></i>
                      <div>
                        <h3 className="font-bold text-rose-800 dark:text-rose-300">Generation Error</h3>
                        <p className="text-sm text-rose-700 dark:text-rose-200 mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Alerts */}
                <div>
                  <InsufficientAlert data={displayResult} />
                  {displayResult?.mismatched_features && (
                    <MismatchAlert mismatched_features={displayResult.mismatched_features} />
                  )}
                  {displayResult?.incomplete_user_stories && (
                    <IncompleteStoriesAlert incomplete_user_stories={displayResult.incomplete_user_stories} />
                  )}
                </div>

                {/* Results Section */}
                {displayResult?.status === 'ok' && (
                  <div className="space-y-6" data-results-section>
                    <ResultsDashboard result={displayResult} />
                    <TestCaseTable
                      testCases={displayResult.test_cases?.test_cases || displayResult.test_cases || []}
                      onSelectTestCase={setSelectedTestCase}
                    />

                    {/* Download Section */}
                    <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Export Test Cases</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Download in your preferred format</p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => downloadExcel(displayResult.test_cases?.test_cases || [])}
                            disabled={downloading}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white rounded-lg font-semibold transition-all shadow-md"
                          >
                            <i className="fas fa-file-excel"></i>
                            {downloading ? 'Downloading...' : 'Excel'}
                          </button>
                          <button
                            onClick={() => downloadJSON(displayResult.test_cases)}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all shadow-md"
                          >
                            <i className="fas fa-code"></i>
                            JSON
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                {historyLoading ? (
                  <div className="text-center py-12">
                    <i className="fas fa-spinner fa-spin text-4xl text-indigo-600 dark:text-indigo-400 mb-4"></i>
                    <p className="text-gray-600 dark:text-gray-400">Loading history...</p>
                  </div>
                ) : historyList.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <i className="fas fa-inbox text-6xl text-gray-400 dark:text-gray-600 mb-4"></i>
                    <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">No history found</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Generate test cases to see them here
                    </p>
                  </div>
                ) : (
                  <>
                    {/* History List */}
                    <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Previous Generations</h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {historyList.map((generation, idx) => {
                          const generationId = generation.id || generation.testcase_id;
                          const createdDate = generation.created_at 
                            ? new Date(generation.created_at).toLocaleString()
                            : 'N/A';
                          const testCaseCount = generation.test_cases?.length || 0;
                          const isSelected = selectedHistoryId === generationId;
                          
                          return (
                            <button
                              key={generationId}
                              onClick={() => handleLoadHistory(generationId)}
                              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                isSelected
                                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:border-indigo-300 dark:hover:border-indigo-700'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                                    <i className="fas fa-file-alt text-indigo-600 dark:text-indigo-400"></i>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                      Generation #{generation.generation_index !== undefined ? generation.generation_index + 1 : idx + 1}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{createdDate}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{testCaseCount}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Test Cases</p>
                                  </div>
                                  <i className={`fas fa-chevron-right text-gray-400 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : ''}`}></i>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Historical Result Display (Same format as Generator) */}
                    {historyResult && (
                      <div className="space-y-6">
                        {/* Banner */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <i className="fas fa-history text-blue-600 dark:text-blue-400"></i>
                              <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                                Viewing Historical Result
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setHistoryResult(null);
                                setSelectedHistoryId(null);
                              }}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-all"
                            >
                              <i className="fas fa-times mr-1"></i>
                              Close
                            </button>
                          </div>
                        </div>

                        {/* Download Section */}
                        <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Export Test Cases</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Download in your preferred format</p>
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={() => downloadExcel(historyResult.test_cases?.test_cases || [])}
                                disabled={downloading}
                                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white rounded-lg font-semibold transition-all shadow-md"
                              >
                                <i className="fas fa-file-excel"></i>
                                {downloading ? 'Downloading...' : 'Excel'}
                              </button>
                              <button
                                onClick={() => downloadJSON(historyResult.test_cases)}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all shadow-md"
                              >
                                <i className="fas fa-code"></i>
                                JSON
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Alerts */}
                        <div>
                          <InsufficientAlert data={historyResult} />
                          {historyResult?.mismatched_features && (
                            <MismatchAlert mismatched_features={historyResult.mismatched_features} />
                          )}
                          {historyResult?.incomplete_user_stories && (
                            <IncompleteStoriesAlert incomplete_user_stories={historyResult.incomplete_user_stories} />
                          )}
                        </div>

                        {/* Results Dashboard */}
                        <ResultsDashboard result={historyResult} hideSuccessMessage={true} />
                        <TestCaseTable
                          testCases={historyResult.test_cases?.test_cases || []}
                          onSelectTestCase={setSelectedTestCase}
                        />
                      </div>
                    )}

                    {!historyResult && (
                      <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                        <i className="fas fa-mouse-pointer text-4xl text-gray-400 dark:text-gray-600 mb-4"></i>
                        <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">Select a generation to view</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          Click on any generation above to view its details
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Test Case Detail Modal */}
      {selectedTestCase && (
        <TestCaseModal testCase={selectedTestCase} onClose={() => setSelectedTestCase(null)} />
      )}
    </div>
  );
}

export default TestCaseGenerator;
