// src/components/e2e/GitAutoRouting.jsx
import { useState } from 'react';
import TestCasesPreviewModal from './TestCasesPreviewModal';

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

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-100 dark:bg-gray-800">
      {sessionToken || localStorage.getItem('session_token') ? (
        <>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{loginSuccessMessage || 'GitHub login successful ✅'}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Select repository, branch, and frontend route files to extract routes</div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-500 text-white rounded-md"
            >
              Logout
            </button>
          </div>
          <div className="space-y-2 mt-3">
            <div>
              <label className="block text-sm font-medium">Project ID (for filtering test cases):</label>
              <input
                type="text"
                value={projectUrl}
                onChange={e => setProjectUrl(e.target.value)}
                placeholder="e.g., Srivarshini-iHUB/testing-agent-fe"
                className="mt-1 px-2 py-1 rounded-md w-full border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Repo:</label>
              <select
                value={selectedRepo}
                onChange={e => setSelectedRepo(e.target.value)}
                className="mt-1 px-2 py-1 rounded-md w-full border"
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
              <label className="block text-sm font-medium">Branch:</label>
              <select
                value={selectedBranch}
                onChange={e => setSelectedBranch(e.target.value)}
                className="mt-1 px-2 py-1 rounded-md w-full border"
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
          <button
            onClick={fetchRouteFiles}
            disabled={loading || !selectedRepo || !selectedBranch}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md disabled:opacity-50"
          >
            {loading ? 'Fetching...' : 'Fetch Route Files'}
          </button>
          {routeFiles.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium">Select Route Files ({routeFiles.length} found):</label>
              <select
                multiple
                value={selectedFiles}
                onChange={e => setSelectedFiles(Array.from(e.target.selectedOptions, option => option.value))}
                className="mt-1 px-2 py-1 rounded-md w-full border h-32"
              >
                {routeFiles.map(f => (
                  <option key={f.path} value={f.path}>
                    {f.name} ({f.path})
                  </option>
                ))}
              </select>
              <div className="text-sm text-gray-600 mt-1">Hold Ctrl/Cmd to select multiple files</div>
            </div>
          )}
          <button
            onClick={extractAndMapTestCases}
            disabled={loading || selectedFiles.length === 0}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md disabled:opacity-50"
          >
            {loading ? 'Mapping...' : 'Extract Routes & Map Test Cases'}
          </button>
          {routesPreview.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
              <h3 className="font-semibold mb-2">Routes Found ({routesPreview.length}):</h3>
              <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
                {routesPreview.map((route, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>{route.method || 'GET'} {route.path}</span>
                    <span className="text-gray-500">{route.source_file}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {testCasesPreview.length > 0 && (
            <>
              <div className="mt-4 flex justify-between items-center">
                <h3 className="font-semibold">
                  Test Cases Preview (
                  {testCasesPreview.filter(tc => tc.edited_route || tc.matched_route).length} auto-matched / 
                  {testCasesPreview.length} total
                  ):
                </h3>
                <button
                  onClick={() => setShowPreviewModal(true)}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-md text-sm"
                >
                  Open Editable Preview
                </button>
              </div>
            </>
          )}
          {testCasesPreview.length === 0 && routesPreview.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded text-center">
              <h3 className="font-semibold text-red-600">No Test Cases Available</h3>
              <p className="text-sm text-red-700 mt-1">Preview cannot be shown—ingest test cases into MongoDB (use sample insert script) or check project_id.</p>
              <button
                onClick={() => alert('Run: python insert_sample_testcases.py\nThen re-extract.')}
                className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-xs"
              >
                View Insert Instructions
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center gap-4">
          <button onClick={handleGitLogin} className="px-4 py-2 bg-blue-500 text-white rounded-md">Login with GitHub</button>
          <div className="text-sm text-gray-600">Login to auto-map routes from your repo</div>
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