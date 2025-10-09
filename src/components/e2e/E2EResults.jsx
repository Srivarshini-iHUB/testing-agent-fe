const E2EResults = ({
  selectedFlow,
  testResults,
  agentRunning,
  applicationUrl,
  selectedBrowser,
  downloadScript,
  downloadReport
}) => {
  return (
    <div className="space-y-6">
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
                <span className="text-gray-600 dark:text-gray-300">Test Cases Processed</span>
                <span className="font-semibold text-gray-900 dark:text-white">12</span>
              </div>
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
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">8</div>
                <div className="text-sm text-green-700 dark:text-green-300">Tests Passed</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">2</div>
                <div className="text-sm text-red-700 dark:text-red-300">Tests Failed</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-600 dark:text-gray-300">Browser Used</span>
                <span className="font-semibold text-gray-900 dark:text-white capitalize">{selectedBrowser}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-600 dark:text-gray-300">Execution Time</span>
                <span className="font-semibold text-gray-900 dark:text-white">45s</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-600 dark:text-gray-300">Screenshots</span>
                <span className="font-semibold text-gray-900 dark:text-white">12</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button onClick={downloadScript} className="flex-1 btn-primary">Download Script (.py)</button>
              <button onClick={downloadReport} className="flex-1 btn-secondary">Download Report</button>
            </div>
          </div>
        </div>
      )}

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


