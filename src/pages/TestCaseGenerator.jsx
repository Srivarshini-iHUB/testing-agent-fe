import { useState } from 'react';
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

  // === State ===
  const [frdFiles, setFrdFiles] = useState([]);
  const [userStoryFiles, setUserStoryFiles] = useState([]);
  const [selectedTestCase, setSelectedTestCase] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Upload state
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const { loading, progress, result, error, generate } = useTestCaseGeneration();
  const { downloading, downloadExcel, downloadJSON } = useDownload();
  const { isDark } = useTheme();

  // === CONFIRM UPLOAD HANDLER ===
  const handleConfirmUpload = async () => {
    if (!frdFiles.length || !userStoryFiles.length) {
      toast.error('Please upload both FRD and User Story files.');
      return;
    }

    setUploadLoading(true);
    setUploadSuccess(false);

    const form = new FormData();
    frdFiles.forEach((file) => form.append('frd', file));
    userStoryFiles.forEach((file) => form.append('user_story', file));

    try {
      const response = await fetch('http://localhost:8080/api/projects/PROJ_1', {
        method: 'PATCH',
        body: form,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${response.status}`);
      }

      await response.json();
      toast.success('Files uploaded and project updated successfully!');
      setUploadSuccess(true);
    } catch (err) {
      toast.error(err.message || 'Failed to upload files');
      console.error('Upload error:', err);
    } finally {
      setUploadLoading(false);
    }
  };

  // === GENERATE TEST CASES ===
  const handleGenerate = async () => {
    try {
      await generate(frdFiles, userStoryFiles);
    } catch (err) {
      console.error('Error generating test cases:', err);
    }
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

            {/* FRD Upload Section */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Functional Requirements Document <span className="text-rose-500 dark:text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.docx,.txt"
                    onChange={(e) => setFrdFiles(Array.from(e.target.files || []))}
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

                {frdFiles.length > 0 && (
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
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900/50 p-2 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <i className="fas fa-file-pdf text-blue-500 dark:text-blue-400"></i>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Stories Upload Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  User Stories Document <span className="text-rose-500 dark:text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.docx,.txt"
                    onChange={(e) => setUserStoryFiles(Array.from(e.target.files || []))}
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

                {userStoryFiles.length > 0 && (
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
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900/50 p-2 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <i className="fas fa-file-word text-purple-500 dark:text-purple-400"></i>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
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

              {/* Confirm Upload Button */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleConfirmUpload}
                  disabled={uploadLoading || !frdFiles.length || !userStoryFiles.length}
                  className={`
                    px-6 py-2 rounded-lg font-semibold transition-all shadow-md flex items-center gap-2
                    ${
                      uploadLoading
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : uploadSuccess
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }
                  `}
                >
                  {uploadLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Uploading...
                    </>
                  ) : uploadSuccess ? (
                    <>
                      <i className="fas fa-check-circle"></i> Uploaded
                    </>
                  ) : (
                    'Confirm Upload'
                  )}
                </button>
              </div>

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
                onClick={handleGenerate}
                disabled={loading || !frdFiles.length || !userStoryFiles.length}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white py-4 rounded-xl font-semibold shadow-lg disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
              >
                <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-play'}`}></i>
                {loading ? 'Generating...' : 'Start Test Generation'}
              </button>
              {(!frdFiles.length || !userStoryFiles.length) && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                  <i className="fas fa-info-circle mr-1"></i>
                  Upload both documents to continue
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
