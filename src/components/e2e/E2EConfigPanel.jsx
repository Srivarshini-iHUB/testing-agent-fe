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
  dockerRunning
}) => {
  const flows = [
    { id: 'manual', name: 'Manual Setup', description: 'Playwright configuration and CSV upload' },
    { id: 'agent', name: 'AI Agent', description: 'Automated test generation and execution' }
  ];

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          E2E Test Configuration
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Testing Flow
            </label>
            <div className="grid grid-cols-3 gap-3">
              {flows.map((flow) => (
                <button
                  key={flow.id}
                  onClick={() => setSelectedFlow(flow.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedFlow === flow.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {flow.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {flow.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Setup Flow removed: Setup control is available in Manual flow */}

      {/* Manual Flow */}
      {selectedFlow === 'manual' && (
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Manual Test Generation
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Playwright Setup (optional)
              </label>
              <div className="space-y-2">
                <div className="grid gap-3 md:grid-cols-3">
                  <input
                    type="text"
                    value={projectPath}
                    onChange={(e) => setProjectPath(e.target.value)}
                    placeholder="Project folder path"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white md:col-span-2"
                  />
                  <button
                    onClick={setupPlaywright}
                    disabled={playwrightSetup || !projectPath}
                    className="w-full btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {playwrightSetup ? 'Setting up Playwright...' : 'Setup Playwright'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">If you already have a Playwright project, you can skip this step.</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Test Data File
              </label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-6 transition-all ${
                  dragActive
                    ? "border-primary-400 bg-primary-500/10"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
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
                      <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <div className="text-left">
                        <p className="text-gray-900 dark:text-white font-medium">{uploadedFiles.name}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{(uploadedFiles.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-700 dark:text-gray-300 mb-1">
                        Drag and drop your file here, or click to browse
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Supports CSV, XLSX, and XLS files</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project URL
              </label>
              <input
                type="url"
                value={applicationUrl}
                onChange={(e) => setApplicationUrl(e.target.value)}
                placeholder="https://your-app.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <button
              onClick={generateTestScript}
              disabled={loading || !uploadedFiles || !applicationUrl}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                  Generating Test Script...
                </>
              ) : (
                'Generate Test Script'
              )}
            </button>

            {output && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Next steps</h4>
                <ol className="list-decimal ml-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li>Copy the generated script below.</li>
                  <li>Save it as <span className="font-mono">tests/test_generated.py</span> in your Playwright project.</li>
                  <li>Run <span className="font-mono">pytest --headed --browser chromium</span> from your project directory.</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Agent Flow */}
      {selectedFlow === 'agent' && (
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            AI Agent Testing
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Test Data File
              </label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-6 transition-all ${
                  dragActive
                    ? "border-primary-400 bg-primary-500/10"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
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
                      <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <div className="text-left">
                        <p className="text-gray-900 dark:text-white font-medium">{uploadedFiles.name}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{(uploadedFiles.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-700 dark:text-gray-300 mb-1">
                        Drag and drop your file here, or click to browse
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Supports CSV, XLSX, and XLS files</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project URL
              </label>
              <input
                type="url"
                value={applicationUrl}
                onChange={(e) => setApplicationUrl(e.target.value)}
                placeholder="https://your-app.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <button
                onClick={generateTestScript}
                disabled={!uploadedFiles || !applicationUrl || agentRunning}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {agentRunning ? 'Generating...' : 'Generate Scripts'}
              </button>
              <button
                onClick={handleRunWithDocker}
                disabled={agentRunning || !output}
                className="w-full btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {dockerRunning ? 'Running in Docker...' : 'Run with Docker'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Script and Run Command */}
      {output && (
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Generated Python Test Script
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
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
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Running...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
                        </svg>
                        Run with Docker
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            <pre className="bg-gray-900 text-gray-300 p-4 rounded-lg overflow-auto text-sm font-mono max-h-96">
              {output}
            </pre>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Run Command
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={runCommand}
                readOnly
                className="flex-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white font-mono text-sm focus:outline-none"
              />
              <button
                onClick={copyToClipboard}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all font-medium ${
                  copySuccess
                    ? "bg-green-600 hover:bg-green-500"
                    : "bg-primary-600 hover:bg-primary-500"
                } text-white`}
              >
                {copySuccess ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default E2EConfigPanel;