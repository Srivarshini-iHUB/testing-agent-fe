import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTestCaseGeneration } from '../hooks/useTestCaseGeneration';
import { useDownload } from '../hooks/useDownload';
import { useTheme } from '../contexts/ThemeContext';
import InsufficientAlert from '../components/testcase/InsufficientAlert';
import MismatchAlert from '../components/testcase/MismatchAlert';
import IncompleteStoriesAlert from '../components/testcase/IncompleteStoriesAlert';
import ProgressBar from '../components/testcase/ProgressBar';
import ResultsDashboard from '../components/testcase/ResultsDashboard';
import TestCaseTable from '../components/testcase/TestCaseTable';
import TestCaseModal from '../components/testcase/TestCaseModal';

function TestCaseGenerator() {
  const navigate = useNavigate();
  const [selectedFrdUrl, setSelectedFrdUrl] = useState("");
  const [selectedUserStoryUrl, setSelectedUserStoryUrl] = useState("");
  const [frdFiles, setFrdFiles] = useState([]);
  const [userStoryFiles, setUserStoryFiles] = useState([]);
  const [selectedTestCase, setSelectedTestCase] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [project, setProject] = useState(null);
  const [frdPreviewUrl, setFrdPreviewUrl] = useState(null);
  const [userStoryPreviewUrl, setUserStoryPreviewUrl] = useState(null);
  const { loading, progress, result, error, generate } = useTestCaseGeneration();
  const { downloading, downloadExcel, downloadJSON } = useDownload();
  const { isDark } = useTheme();

  // Load project from localStorage on mount
  useEffect(() => {
    const storedProject = localStorage.getItem('project');
    if (storedProject) {
      const parsedProject = JSON.parse(storedProject);
      console.log("Loaded project:", parsedProject); // Debug log
      setProject(parsedProject);
    } else {
      toast.error("No project found. Redirecting to dashboard...");
      navigate('/dashboard');
    }
  }, [navigate]);

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      if (frdPreviewUrl) URL.revokeObjectURL(frdPreviewUrl);
      if (userStoryPreviewUrl) URL.revokeObjectURL(userStoryPreviewUrl);
    };
  }, [frdPreviewUrl, userStoryPreviewUrl]);

  // Generate test cases using selected URLs or uploaded files
  const handleGenerateTestCases = async () => {
    if ((!selectedFrdUrl && frdFiles.length === 0) || (!selectedUserStoryUrl && userStoryFiles.length === 0)) {
      toast.error("Please select or upload both FRD and User Story files.");
      return;
    }

    if (!project) {
      toast.error("Project not loaded. Please refresh the page.");
      return;
    }

    try {
      const formData = new FormData();

      // Use project.id (not project._id)
      if (!project.id) {
        toast.error("Project ID is missing. Please check your project data.");
        return;
      }
      formData.append("project_id", project.id);

      // Add FRD (URL or file)
      if (selectedFrdUrl) {
        console.log("Using selected FRD URL:", selectedFrdUrl); // Debug log
        formData.append("frd_url", selectedFrdUrl);
      } else if (frdFiles.length > 0) {
        formData.append("frd_file", frdFiles[0]);
      }

      // Add User Story (URL or file)
      if (selectedUserStoryUrl) {
        console.log("Using selected User Story URL:", selectedUserStoryUrl); // Debug log
        formData.append("user_story_url", selectedUserStoryUrl);
      } else if (userStoryFiles.length > 0) {
        formData.append("user_story_file", userStoryFiles[0]);
      }

      // Log FormData for debugging
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      await generate(formData);
      console.log("formData", formData);
    } catch (err) {
      console.error('Error generating test cases:', err);
      toast.error(err.message || 'Failed to generate test cases');
    }
  };

  const handleFrdSelect = (e) => {
    const value = e.target.value;
    setSelectedFrdUrl(value);
    setFrdFiles([]);
    setFrdPreviewUrl(null);
  };

  const handleFrdUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setFrdFiles(files);
    setSelectedFrdUrl("");
    if (files[0]) {
      setFrdPreviewUrl(URL.createObjectURL(files[0]));
    } else {
      setFrdPreviewUrl(null);
    }
  };

  const handleUserStorySelect = (e) => {
    const value = e.target.value;
    setSelectedUserStoryUrl(value);
    setUserStoryFiles([]);
    setUserStoryPreviewUrl(null);
  };

  const handleUserStoryUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setUserStoryFiles(files);
    setSelectedUserStoryUrl("");
    if (files[0]) {
      setUserStoryPreviewUrl(URL.createObjectURL(files[0]));
    } else {
      setUserStoryPreviewUrl(null);
    }
  };

  const getFilename = (url) => {
    if (!url) return '';
    return decodeURIComponent(url.split('/').pop());
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
            <i className="fas fa-file-alt text-4xl text-indigo-600 dark:text-indigo-400"></i>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Test Case Generator</h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                AI-powered test case generation from requirements and user stories
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Configuration Panel */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <i className="fas fa-cog text-indigo-600 dark:text-indigo-400"></i>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Test Configuration</h2>
            </div>

            {/* FRD Section */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Functional Requirements Document <span className="text-rose-500 dark:text-rose-400">*</span>
                </label>
                {project?.frd?.length > 0 ? (
                  <div className="space-y-2">
                    <select
                      value={selectedFrdUrl}
                      onChange={handleFrdSelect}
                      className="w-full bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="">Select FRD</option>
                      {project.frd.map((url, idx) => (
                        <option key={idx} value={url}>
                          {getFilename(url)}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="file"
                        id="frd-upload"
                        className="hidden"
                        onChange={handleFrdUpload}
                        accept=".pdf,.docx,.txt"
                      />
                      <label
                        htmlFor="frd-upload"
                        className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition-colors cursor-pointer"
                      >
                        <i className="fas fa-plus-circle"></i>
                        Quick Upload FRD
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFrdUpload}
                      id="frd-upload"
                      className="hidden"
                    />
                    <label
                      htmlFor="frd-upload"
                      className="block w-full bg-gray-50 dark:bg-gray-900/50 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-900/70"
                    >
                      <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 dark:text-gray-400 mb-2 block"></i>
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Click to upload FRD</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">PDF, DOCX, TXT (Max 10MB)</p>
                    </label>
                  </div>
                )}

                {/* Selected FRD Display */}
                {selectedFrdUrl && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <a
                      href={selectedFrdUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2 text-sm font-medium"
                    >
                      <i className="fas fa-external-link-alt"></i>
                      View FRD: {getFilename(selectedFrdUrl)}
                    </a>
                  </div>
                )}

                {/* Uploaded FRD Preview */}
                {frdFiles.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Uploaded: {frdFiles[0].name}
                    </p>
                    {frdFiles[0].type === 'application/pdf' && frdPreviewUrl ? (
                      <iframe
                        src={frdPreviewUrl}
                        className="w-full h-64 border rounded-lg shadow-sm"
                        title="FRD Preview"
                      />
                    ) : (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {frdFiles[0].type} file uploaded. Preview available for PDFs only.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Stories Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  User Stories Document <span className="text-rose-500 dark:text-rose-400">*</span>
                </label>
                {project?.user_story?.length > 0 ? (
                  <div className="space-y-2">
                    <select
                      value={selectedUserStoryUrl}
                      onChange={handleUserStorySelect}
                      className="w-full bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="">Select User Story</option>
                      {project.user_story.map((url, idx) => (
                        <option key={idx} value={url}>
                          {getFilename(url)}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="file"
                        id="userstory-upload"
                        className="hidden"
                        onChange={handleUserStoryUpload}
                        accept=".pdf,.docx,.txt"
                      />
                      <label
                        htmlFor="userstory-upload"
                        className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition-colors cursor-pointer"
                      >
                        <i className="fas fa-plus-circle"></i>
                        Quick Upload User Story
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleUserStoryUpload}
                      id="userstory-upload"
                      className="hidden"
                    />
                    <label
                      htmlFor="userstory-upload"
                      className="block w-full bg-gray-50 dark:bg-gray-900/50 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-500 rounded-xl p-6 text-center cursor-pointer transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-900/70"
                    >
                      <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 dark:text-gray-400 mb-2 block"></i>
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Click to upload User Stories</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">PDF, DOCX, TXT (Max 10MB)</p>
                    </label>
                  </div>
                )}

                {/* Selected User Story Display */}
                {selectedUserStoryUrl && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <a
                      href={selectedUserStoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2 text-sm font-medium"
                    >
                      <i className="fas fa-external-link-alt"></i>
                      View User Story: {getFilename(selectedUserStoryUrl)}
                    </a>
                  </div>
                )}

                {/* Uploaded User Story Preview */}
                {userStoryFiles.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Uploaded: {userStoryFiles[0].name}
                    </p>
                    {userStoryFiles[0].type === 'application/pdf' && userStoryPreviewUrl ? (
                      <iframe
                        src={userStoryPreviewUrl}
                        className="w-full h-64 border rounded-lg shadow-sm"
                        title="User Story Preview"
                      />
                    ) : (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {userStoryFiles[0].type} file uploaded. Preview available for PDFs only.
                        </p>
                      </div>
                    )}
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

              {/* Advanced Options Panel */}
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-200 dark:border-gray-700/50 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Test Types
                    </label>
                    <select className="w-full bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:outline-none">
                      <option>All Types</option>
                      <option>Positive Only</option>
                      <option>Negative Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Priority
                    </label>
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
            <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
              <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Actions</h2>
              <button
                onClick={handleGenerateTestCases}
                disabled={loading || (!selectedFrdUrl && frdFiles.length === 0) || (!selectedUserStoryUrl && userStoryFiles.length === 0)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white py-4 rounded-xl font-semibold shadow-lg disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
              >
                <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-play'}`}></i>
                {loading ? 'Generating...' : 'Start Test Generation'}
              </button>
              {((!selectedFrdUrl && frdFiles.length === 0) || (!selectedUserStoryUrl && userStoryFiles.length === 0)) && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                  <i className="fas fa-info-circle mr-1"></i>
                  Select or upload both documents to continue
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
                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                      Generates positive, negative, edge & boundary cases
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <i className="fas fa-robot text-indigo-600 dark:text-indigo-400 mt-1"></i>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-300">AI-Powered</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                      Automatically maps features to user stories
                    </p>
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
          <div className="mt-6">
            <ProgressBar progress={progress} />
          </div>
        )}

        {/* Error Alert */}
        {error && !result && (
          <div className="mt-6 bg-rose-50 dark:bg-rose-900/20 border border-rose-300 dark:border-rose-500 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <i className="fas fa-exclamation-triangle text-rose-500 mt-0.5"></i>
              <div>
                <h3 className="font-semibold text-rose-600 dark:text-rose-400">Generation Failed</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="mt-10 space-y-6">
            <ResultsDashboard
              result={result}
              downloading={downloading}
              downloadExcel={downloadExcel}
              downloadJSON={downloadJSON}
            />
            <TestCaseTable result={result} onRowClick={setSelectedTestCase} />
          </div>
        )}

        {/* Modals */}
        {selectedTestCase && (
          <TestCaseModal testCase={selectedTestCase} onClose={() => setSelectedTestCase(null)} />
        )}
        <InsufficientAlert />
        <MismatchAlert />
        <IncompleteStoriesAlert />
      </div>
    </div>
  );
}

export default TestCaseGenerator;