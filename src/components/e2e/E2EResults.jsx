const E2EResults = ({
  selectedFlow,
  testResults,
  agentRunning,
  applicationUrl,
  selectedBrowser,
  downloadScript,
  downloadReport
}) => {
  const handleViewReport = () => {
    if (testResults && testResults.reportUrl) {
      const reportUrl = testResults.reportUrl;
      // Open in new window with the report viewer
      window.open(`/pytest-report?url=${encodeURIComponent(reportUrl)}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Setup Logs */}
      {selectedFlow === 'setup' && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Setup Logs
          </h2>
          <div className="bg-gray-900 text-gray-300 p-4 rounded-lg max-h-96 overflow-y-auto">
            {testResults && testResults.logs && testResults.logs.length > 0 ? (
              <div className="space-y-2">
                {testResults.logs.map((log, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                  >
                    {log.type === 'success' ? (
                      <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : log.type === 'error' ? (
                      <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    <p className={`text-sm flex-1 leading-relaxed ${
                      log.type === 'success' ? 'text-green-300' : 
                      log.type === 'error' ? 'text-red-300' : 'text-gray-300'
                    }`}>
                      {log.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-700/50 rounded-full mb-3">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500">Waiting for setup to begin...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Agent Processing */}
      {agentRunning && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            AI Agent Processing
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                AI Agent is analyzing your test cases...
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Generating optimized Playwright scripts and running tests
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-300">Analyzing CSV data</span>
                <span className="text-green-600 dark:text-green-400">✓</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-300">Generating test scripts</span>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-300">Executing tests</span>
                <span className="text-gray-400">⏳</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-300">Generating report</span>
                <span className="text-gray-400">⏳</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Script Generation Results */}
      {selectedFlow === 'manual' && testResults && testResults.status === 'completed' && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Script Generation Complete
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-800 dark:text-green-200 font-medium">
                  Playwright test script generated successfully!
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-600 dark:text-gray-300">Application URL</span>
                <span className="font-semibold text-gray-900 dark:text-white text-sm truncate ml-2">
                  {applicationUrl}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-600 dark:text-gray-300">File Format</span>
                <span className="font-semibold text-gray-900 dark:text-white">Python (.py)</span>
              </div>
            </div>
            <button onClick={downloadScript} className="w-full btn-primary">Download Test Script (.py)</button>
          </div>
        </div>
      )}

      {/* AI Agent Results */}
      {selectedFlow === 'agent' && testResults && testResults.status === 'completed' && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            AI Agent Results
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-800 dark:text-green-200 font-medium">
                  AI Agent completed successfully!
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{Number(testResults.passed || 0)}</div>
                <div className="text-sm text-green-700 dark:text-green-300">Tests Passed</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{Number(testResults.failed || 0)}</div>
                <div className="text-sm text-red-700 dark:text-red-300">Tests Failed</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-600 dark:text-gray-300">Browser Used</span>
                <span className="font-semibold text-gray-900 dark:text-white capitalize">{selectedBrowser || 'chrome'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-600 dark:text-gray-300">Execution Time</span>
                <span className="font-semibold text-gray-900 dark:text-white">{testResults.executionTime || '-'}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleViewReport} className="flex-1 btn-primary">
                📊 View Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Docker UI removed as per requirements */}

      {/* Default State */}
      {!testResults && !agentRunning && (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🔄</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Ready for E2E Testing
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Choose your testing flow and upload test cases to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default E2EResults;