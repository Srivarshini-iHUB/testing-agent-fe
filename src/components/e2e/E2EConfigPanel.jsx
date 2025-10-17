const E2EConfigPanel = ({
  selectedFlow,
  setSelectedFlow,
  handleFileUpload,
  uploadedFiles,
  applicationUrl,
  setApplicationUrl,
  setupPlaywright,
  playwrightSetup,
  generateTestScript,
  agentRunning,
  projectPath,
  setProjectPath,
  handleDrag,
  handleDrop,
  dragActive,
  loading,
  output,
  runCommand,
  handleDownload,
  copyToClipboard,
  copySuccess,
  handleRunWithDocker,
  dockerRunning,
  testCases,
  setTestCases,
  reportId,
  setReportId,
  bugSheetUrl,
  appsScriptCode,
  setupInstructions
}) => {
  const flows = [
    { id: 'manual', name: 'Manual Setup', icon: 'fa-hand-pointer', description: 'Playwright configuration and CSV upload' },
    { id: 'agent', name: 'AI Agent', icon: 'fa-robot', description: 'Automated test generation and execution' }
  ];

  return (
    <div className="space-y-6">
      {/* Flow Selection */}
      <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <i className="fas fa-cog text-indigo-600 dark:text-indigo-400"></i>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Test Configuration</h2>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Select Testing Flow
          </label>
          <div className="grid grid-cols-2 gap-4">
            {flows.map((flow) => (
              <button
                key={flow.id}
                onClick={() => setSelectedFlow(flow.id)}
                className={`p-5 rounded-xl border-2 transition-all text-left ${
                  selectedFlow === flow.id
                    ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 bg-white dark:bg-gray-800/30'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <i className={`fas ${flow.icon} text-2xl ${
                    selectedFlow === flow.id 
                      ? 'text-indigo-600 dark:text-indigo-400' 
                      : 'text-gray-400'
                  }`}></i>
                  <div className="font-bold text-gray-900 dark:text-white">{flow.name}</div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{flow.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Manual Flow */}
      {selectedFlow === 'manual' && (
        <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <i className="fas fa-wrench text-purple-600 dark:text-purple-400"></i>
            Manual Test Generation
          </h3>
          
          <div className="space-y-5">
            {/* Playwright Setup */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Playwright Setup <span className="text-gray-500 dark:text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="space-y-2">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={projectPath}
                    onChange={(e) => setProjectPath(e.target.value)}
                    placeholder="Project folder path (e.g., /home/user/my-project)"
                    className="flex-1 px-4 py-3 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={setupPlaywright}
                    disabled={playwrightSetup || !projectPath}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white rounded-lg font-semibold transition-all disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {playwrightSetup ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Setting up...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-download mr-2"></i>
                        Setup
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <i className="fas fa-info-circle mr-1"></i>
                  If you already have a Playwright project, you can skip this step
                </p>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Test Data File <span className="text-rose-500">*</span>
              </label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
                  dragActive
                    ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-900/30"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="file-upload"
                />
                <div className="text-center">
                  {uploadedFiles ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                        <i className="fas fa-check text-emerald-600 dark:text-emerald-400 text-xl"></i>
                      </div>
                      <div className="text-left">
                        <p className="text-gray-900 dark:text-white font-semibold">{uploadedFiles.name}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{(uploadedFiles.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <i className="fas fa-cloud-upload-alt text-5xl text-gray-400 dark:text-gray-500 mb-3"></i>
                      <p className="text-gray-700 dark:text-gray-300 mb-1 font-medium">
                        Drag and drop your file here, or click to browse
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Supports CSV, XLSX, and XLS files</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Application URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Application URL <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <i className="fas fa-link absolute left-4 top-4 text-gray-400"></i>
                <input
                  type="url"
                  value={applicationUrl}
                  onChange={(e) => setApplicationUrl(e.target.value)}
                  placeholder="https://your-app.com"
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateTestScript}
              disabled={loading || !uploadedFiles || !applicationUrl}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-xl font-bold shadow-lg disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Generating Test Script...
                </>
              ) : (
                <>
                  <i className="fas fa-magic"></i>
                  Generate Test Script
                </>
              )}
            </button>

            {/* Next Steps Info */}
            {output && (
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <h4 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
                  <i className="fas fa-lightbulb"></i>
                  Next Steps
                </h4>
                <ol className="list-decimal ml-5 space-y-1 text-sm text-indigo-800 dark:text-indigo-200">
                  <li>Copy the generated script below</li>
                  <li>Save it as <code className="bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded">tests/test_generated.py</code></li>
                  <li>Run <code className="bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded">pytest --headed --browser chromium</code></li>
                </ol>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Agent Flow */}
      {selectedFlow === 'agent' && (
        <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <i className="fas fa-robot text-indigo-600 dark:text-indigo-400"></i>
            AI Agent Testing
          </h3>
          
          <div className="space-y-5">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Test Data File <span className="text-rose-500">*</span>
              </label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
                  dragActive
                    ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-900/30"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="file-upload-agent"
                />
                <div className="text-center">
                  {uploadedFiles ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                        <i className="fas fa-check text-emerald-600 dark:text-emerald-400 text-xl"></i>
                      </div>
                      <div className="text-left">
                        <p className="text-gray-900 dark:text-white font-semibold">{uploadedFiles.name}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{(uploadedFiles.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <i className="fas fa-cloud-upload-alt text-5xl text-gray-400 dark:text-gray-500 mb-3"></i>
                      <p className="text-gray-700 dark:text-gray-300 mb-1 font-medium">
                        Drag and drop your file here, or click to browse
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Supports CSV, XLSX, and XLS files</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Application URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Application URL <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <i className="fas fa-link absolute left-4 top-4 text-gray-400"></i>
                <input
                  type="url"
                  value={applicationUrl}
                  onChange={(e) => setApplicationUrl(e.target.value)}
                  placeholder="https://your-app.com"
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid gap-3 md:grid-cols-2">
              <button
                onClick={generateTestScript}
                disabled={!uploadedFiles || !applicationUrl || agentRunning}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {agentRunning ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Generating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-file-code"></i>
                    Generate Scripts
                  </>
                )}
              </button>
              <button
                onClick={handleRunWithDocker}
                disabled={agentRunning || !output}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {dockerRunning ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Running...
                  </>
                ) : (
                  <>
                    <i className="fab fa-docker"></i>
                    Run with Docker
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Script Display */}
      {output && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <i className="fab fa-python text-blue-500"></i>
                Generated Python Test Script
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all"
                >
                  <i className="fas fa-download"></i>
                  Download
                </button>
                {selectedFlow === 'agent' && (
                  <button
                    onClick={handleRunWithDocker}
                    disabled={dockerRunning}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white px-4 py-2 rounded-lg transition-all"
                  >
                    {dockerRunning ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Running...
                      </>
                    ) : (
                      <>
                        <i className="fab fa-docker"></i>
                        Run Docker
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            <pre className="bg-gray-900 text-gray-300 p-4 rounded-lg overflow-auto text-sm font-mono max-h-96 custom-scrollbar">
              {output}
            </pre>
          </div>

          <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <i className="fas fa-terminal text-emerald-600 dark:text-emerald-400"></i>
              Run Command
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={runCommand}
                readOnly
                className="flex-1 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white font-mono text-sm focus:outline-none"
              />
              <button
                onClick={copyToClipboard}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all font-semibold ${
                  copySuccess
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-indigo-600 hover:bg-indigo-500"
                } text-white`}
              >
                {copySuccess ? (
                  <>
                    <i className="fas fa-check"></i>
                    Copied!
                  </>
                ) : (
                  <>
                    <i className="fas fa-copy"></i>
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bug Sheet and Apps Script Section */}
      {bugSheetUrl && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Bug Sheet & Apps Script Setup
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bug Sheet URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={bugSheetUrl}
                    readOnly
                    className="flex-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white font-mono text-sm focus:outline-none"
                  />
                  <button
                    onClick={() => window.open(bugSheetUrl, '_blank', 'noopener,noreferrer')}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg transition-all font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open Bug Sheet
                  </button>
                </div>
              </div>

              {appsScriptCode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Apps Script Code
                  </label>
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-300 p-4 rounded-lg overflow-auto text-sm font-mono max-h-96 border border-gray-700">
                      {appsScriptCode}
                    </pre>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(appsScriptCode);
                        // You could add a success state here if needed
                      }}
                      className="absolute top-2 right-2 flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-all text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Code
                    </button>
                  </div>
                </div>
              )}

              {setupInstructions && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Setup Instructions
                  </label>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono">
                      {setupInstructions}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default E2EConfigPanel;
