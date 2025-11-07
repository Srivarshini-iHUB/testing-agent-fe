// src/components/e2e/GitAutoRouting.jsx
import { useState } from 'react';
import TestCasesPreviewModal from './TestCasesPreviewModal';
import { useDialog } from '../../contexts/DialogContext';

const GitAutoRouting = ({
  loading,
  projectUrl,
  setProjectUrl,
  sessionToken,
  repos,
  branches,
  selectedRepo,
  setSelectedRepo,
  selectedBranch,
  setSelectedBranch,
  routeFiles,
  setRouteFiles,
  selectedFiles,
  setSelectedFiles,
  routesPreview,
  setRoutesPreview,
  testCasesPreview,
  setTestCasesPreview,
  loginSuccessMessage,
  handleGitLogin,
  fetchRepos,
  fetchBranches,
  fetchRouteFiles,
  extractAndMapTestCases,
  handleUpdateTestCase,
  generateScriptFromMapping,
  handleLogout,
  output,
  handleDownload,
  handleRunWithDocker,
  dockerRunning
}) => {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const { alert: showDialogAlert } = useDialog();

  return (
    <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
      {sessionToken || localStorage.getItem('session_token') ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                <i className="fab fa-github text-white text-xl"></i>
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">{loginSuccessMessage || 'GitHub login successful ✅'}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Select repository, branch, and frontend route files to extract routes</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all shadow-md flex items-center gap-2"
            >
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <i className="fas fa-project-diagram mr-2 text-indigo-600 dark:text-indigo-400"></i>
                Project ID (for filtering test cases)
              </label>
              <input
                type="text"
                value={projectUrl}
                onChange={e => setProjectUrl(e.target.value)}
                placeholder="e.g., Srivarshini-iHUB/testing-agent-fe"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <i className="fas fa-code-branch mr-2 text-indigo-600 dark:text-indigo-400"></i>
                  Repository
                </label>
                <select
                  value={selectedRepo}
                  onChange={e => setSelectedRepo(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Repo</option>
                  {repos.map(r => (
                    <option key={r.id} value={`${r.owner.login}/${r.name}`}>
                      {r.name} ({r.owner.login})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <i className="fas fa-network-wired mr-2 text-indigo-600 dark:text-indigo-400"></i>
                  Branch
                </label>
                <select
                  value={selectedBranch}
                  onChange={e => setSelectedBranch(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Branch</option>
                  {branches.map(b => (
                    <option key={b.name} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <button
            onClick={fetchRouteFiles}
            disabled={loading || !selectedRepo || !selectedBranch}
            className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-semibold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-download'}`}></i>
            {loading ? 'Fetching...' : 'Fetch Route Files'}
          </button>
          {routeFiles.length > 0 && (
            <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <i className="fas fa-file-code mr-2 text-indigo-600 dark:text-indigo-400"></i>
                Select Route Files ({routeFiles.length} found)
              </label>
              <select
                multiple
                value={selectedFiles}
                onChange={e => setSelectedFiles(Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all h-32"
              >
                {routeFiles.map(f => (
                  <option key={f.path} value={f.path}>
                    {f.name} ({f.path})
                  </option>
                ))}
              </select>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2">
                <i className="fas fa-info-circle"></i>
                Hold Ctrl/Cmd to select multiple files
              </div>
            </div>
          )}
          <button
            onClick={extractAndMapTestCases}
            disabled={loading || selectedFiles.length === 0}
            className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-semibold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-route'}`}></i>
            {loading ? 'Mapping...' : 'Extract Routes & Map Test Cases'}
          </button>
          {routesPreview.length > 0 && (
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <i className="fas fa-list-check text-blue-600 dark:text-blue-400"></i>
                Routes Found ({routesPreview.length})
              </h3>
              <ul className="text-sm space-y-2 max-h-40 overflow-y-auto">
                {routesPreview.map((route, idx) => (
                  <li key={idx} className="flex justify-between items-center p-2 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="font-medium text-gray-900 dark:text-white">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs mr-2">
                        {route.method || 'GET'}
                      </span>
                      {route.path}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{route.source_file}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {testCasesPreview.length > 0 && (
            <div className="mt-6 p-5 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                    <i className="fas fa-vial text-purple-600 dark:text-purple-400"></i>
                    Test Cases Preview
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {testCasesPreview.filter(tc => tc.edited_route || tc.matched_route).length} auto-matched / {testCasesPreview.length} total
                  </p>
                </div>
                <button
                  onClick={() => setShowPreviewModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all shadow-md flex items-center gap-2"
                >
                  <i className="fas fa-eye"></i>
                  Open Editable Preview
                </button>
              </div>
            </div>
          )}
          {testCasesPreview.length === 0 && routesPreview.length > 0 && (
            <div className="mt-6 p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-exclamation-triangle text-red-600 dark:text-red-400 text-2xl"></i>
              </div>
              <h3 className="font-bold text-red-600 dark:text-red-400 mb-2">No Test Cases Available</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-4">Preview cannot be shown—ingest test cases into MongoDB (use sample insert script) or check project_id.</p>
              <button
                onClick={() => showDialogAlert({
                  title: 'Sample data required',
                  message: 'Run: python insert_sample_testcases.py\nThen re-extract.',
                  variant: 'info',
                })}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all shadow-md flex items-center gap-2 mx-auto"
              >
                <i className="fas fa-info-circle"></i>
                View Insert Instructions
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-700">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                <i className="fab fa-github text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">GitHub Integration Required</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Login with GitHub to enable auto-routing and route extraction from your repository</p>
              </div>
            </div>
            <button 
              onClick={handleGitLogin} 
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg text-sm font-semibold transition-all shadow-md flex items-center gap-2 flex-shrink-0"
            >
              <i className="fab fa-github"></i>
              <span>Login with GitHub</span>
            </button>
          </div>
        </div>
      )}
      <TestCasesPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        testCasesPreview={testCasesPreview}
        onUpdate={handleUpdateTestCase}
      />
    </div>
  );
};

export default GitAutoRouting;