import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [frdFiles, setFrdFiles] = useState([]);
  const [userStoryFiles, setUserStoryFiles] = useState([]);
  const [selectedTestCase, setSelectedTestCase] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { loading, progress, result, error, generate } = useTestCaseGeneration();
  const { downloading, downloadExcel, downloadJSON } = useDownload();
  const { isDark } = useTheme();

  const handleGenerate = async () => {
    try {
      await generate(frdFiles, userStoryFiles);
    } catch (err) {
      // Error handled in hook
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-900 text-gray-900 dark:text-white p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Back Button & Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="mb-4 flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-300 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-gray-700 dark:text-gray-300 font-semibold transition-all"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </button>

          <div className="flex items-center gap-3">
            <i className="fas fa-file-alt text-4xl text-indigo-600 dark:text-indigo-400"></i>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Test Case Generator</h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">AI-powered test case generation from requirements and user stories</p>
            </div>
          </div>
        </div>

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
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.docx,.txt"
                    onChange={(e) => setFrdFiles(Array.from(e.target.files))}
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
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.docx,.txt"
                    onChange={(e) => setUserStoryFiles(Array.from(e.target.files))}
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
                disabled={loading || !frdFiles.length || !userStoryFiles.length}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-400 disabled:to-gray-500 dark:disabled:from-gray-600 dark:disabled:to-gray-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
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
          <div className="mt-6">
            <ProgressBar progress={progress} />
          </div>
        )}

        {/* Error Alert */}
        {error && !result && (
          <div className="mt-6 bg-rose-50 dark:bg-rose-900/20 border border-rose-300 dark:border-rose-500 rounded-xl p-4">
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
        <div className="mt-6">
          <InsufficientAlert data={result} />
          {result?.mismatched_features && (
            <MismatchAlert mismatched_features={result.mismatched_features} />
          )}
          {result?.incomplete_user_stories && (
            <IncompleteStoriesAlert incomplete_user_stories={result.incomplete_user_stories} />
          )}
        </div>

        {/* Results Section */}
        {result?.status === 'ok' && (
          <div className="mt-6 space-y-6">
            <ResultsDashboard result={result} />
            <TestCaseTable
              testCases={result.test_cases?.test_cases || []}
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
                    onClick={() => downloadExcel(result.test_cases?.test_cases || [])}
                    disabled={downloading}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white rounded-lg font-semibold transition-all shadow-md"
                  >
                    <i className="fas fa-file-excel"></i>
                    {downloading ? 'Downloading...' : 'Excel'}
                  </button>
                  <button
                    onClick={() => downloadJSON(result.test_cases)}
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

      {/* Test Case Detail Modal */}
      {selectedTestCase && (
        <TestCaseModal testCase={selectedTestCase} onClose={() => setSelectedTestCase(null)} />
      )}
    </div>
  );
}

export default TestCaseGenerator;
