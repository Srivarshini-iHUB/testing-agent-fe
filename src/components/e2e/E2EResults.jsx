import { useState } from 'react';

const E2EResults = ({
  selectedFlow,
  testResults,
  agentRunning,
  applicationUrl,
  selectedBrowser,
  downloadScript,
  downloadReport,
  reportData,
  reportLoading,
  fetchReportData
}) => {
  const handleViewReport = () => {
    if (testResults && testResults.reportUrl) {
      const reportUrl = testResults.reportUrl;
      // Fetch and display the report data in the UI
      fetchReportData(reportUrl);
    } else {
      alert('Report URL not available yet. Please wait for the test execution to complete.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Actions & Quick Tips */}
      <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Actions</h2>
        <div className="space-y-3">
          <button
            onClick={downloadScript}
            disabled={!testResults || testResults.status !== 'completed'}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 rounded-lg font-semibold transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <i className="fas fa-download"></i>
            Download Script
          </button>
          {/* {testResults && testResults.reportUrl && (
            <button
              onClick={handleViewReport}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-chart-bar"></i>
              View Report
            </button>
          )} */}
        </div>
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
              <p className="font-semibold text-gray-900 dark:text-gray-300">Playwright Testing</p>
              <p className="text-gray-600 dark:text-gray-400 text-xs">Automated browser testing with Chromium engine</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <i className="fas fa-robot text-indigo-600 dark:text-indigo-400 mt-1"></i>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-300">AI-Powered</p>
              <p className="text-gray-600 dark:text-gray-400 text-xs">Automatically generates test scripts from CSV data</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <i className="fab fa-docker text-blue-600 dark:text-blue-400 mt-1"></i>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-300">Docker Ready</p>
              <p className="text-gray-600 dark:text-gray-400 text-xs">Execute tests in isolated container environment</p>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Logs */}
      {selectedFlow === 'setup' && testResults && testResults.logs && (
        <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <i className="fas fa-terminal text-indigo-600 dark:text-indigo-400"></i>
            Setup Logs
          </h2>
          <div className="bg-gray-900 text-gray-300 p-4 rounded-lg max-h-96 overflow-y-auto custom-scrollbar">
            {testResults.logs.length > 0 ? (
              <div className="space-y-2">
                {testResults.logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded hover:bg-gray-800/50 transition-colors">
                    {log.type === 'success' ? (
                      <i className="fas fa-check-circle text-emerald-400 mt-1"></i>
                    ) : log.type === 'error' ? (
                      <i className="fas fa-times-circle text-rose-400 mt-1"></i>
                    ) : (
                      <i className="fas fa-info-circle text-blue-400 mt-1"></i>
                    )}
                    <p className={`text-sm flex-1 ${
                      log.type === 'success' ? 'text-emerald-300' : 
                      log.type === 'error' ? 'text-rose-300' : 'text-gray-300'
                    }`}>
                      {log.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-info-circle text-4xl text-gray-600 mb-3"></i>
                <p className="text-gray-500">Waiting for setup to begin...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Agent Processing */}
      {agentRunning && (
        <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 text-center">
            AI Agent Processing
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
            </div>
            <div className="text-center">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                AI Agent is analyzing your test cases...
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Generating optimized Playwright scripts and running tests
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <span className="text-sm text-gray-900 dark:text-gray-100">Analyzing CSV data</span>
                <i className="fas fa-check text-emerald-600 dark:text-emerald-400"></i>
              </div>
              <div className="flex justify-between items-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <span className="text-sm text-gray-900 dark:text-gray-100">Generating test scripts</span>
                <i className="fas fa-spinner fa-spin text-indigo-600 dark:text-indigo-400"></i>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Executing tests</span>
                <i className="fas fa-clock text-gray-400"></i>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Generating report</span>
                <i className="fas fa-clock text-gray-400"></i>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Script Results */}
      {selectedFlow === 'manual' && testResults && testResults.status === 'completed' && (
        <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Script Generation Complete</h2>
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2">
                <i className="fas fa-check-circle text-2xl text-emerald-600 dark:text-emerald-400"></i>
                <span className="text-emerald-800 dark:text-emerald-200 font-semibold">
                  Playwright test script generated successfully!
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Application URL</span>
                <span className="font-semibold text-gray-900 dark:text-white text-sm truncate ml-2 max-w-[200px]">
                  {applicationUrl}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">File Format</span>
                <span className="font-semibold text-gray-900 dark:text-white">Python (.py)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Agent Results */}
      {selectedFlow === 'agent' && testResults && testResults.status === 'completed' && (
        <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">AI Agent Results</h2>
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2">
                <i className="fas fa-check-circle text-2xl text-emerald-600 dark:text-emerald-400"></i>
                <span className="text-emerald-800 dark:text-emerald-200 font-semibold">
                  AI Agent completed successfully!
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                  {Number(testResults.passed || 0)}
                </div>
                <div className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">Tests Passed</div>
              </div>
              <div className="text-center p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800">
                <div className="text-3xl font-bold text-rose-600 dark:text-rose-400 mb-1">
                  {Number(testResults.failed || 0)}
                </div>
                <div className="text-xs text-rose-700 dark:text-rose-300 font-semibold">Tests Failed</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Browser Used</span>
                <span className="font-semibold text-gray-900 dark:text-white capitalize">{selectedBrowser || 'chrome'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Execution Time</span>
                <span className="font-semibold text-gray-900 dark:text-white">{testResults.executionTime || '-'}</span>
              </div>
            </div>
            
            {/* View Report Button */}
            <div className="flex gap-2 mt-4">
              <button 
                onClick={handleViewReport} 
                disabled={reportLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-all font-medium flex items-center justify-center"
              >
                {reportLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Loading Report...
                  </>
                ) : (
                  '📊 View Detailed Report'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Report Viewer */}
      {reportData && (
        <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Detailed Test Report
          </h2>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {reportData.summary?.total || 0}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Total Tests</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {reportData.summary?.passed || 0}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">Passed</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {reportData.summary?.failed || 0}
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">Failed</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {Math.round(reportData.duration || 0)}s
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">Duration</div>
            </div>
          </div>

          {/* Test Results */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Test Results
            </h3>
            {reportData.tests && reportData.tests.map((test, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {test.nodeid?.split('::').pop() || `Test ${index + 1}`}
                  </h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    test.outcome === 'passed' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {test.outcome?.toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Duration: {Math.round((test.call?.duration || 0) * 1000)}ms
                </div>

                {test.outcome === 'failed' && test.call?.crash && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <h5 className="font-medium text-red-800 dark:text-red-200 mb-2">
                      Error Details:
                    </h5>
                    <div className="text-sm text-red-700 dark:text-red-300 font-mono whitespace-pre-wrap">
                      {test.call.crash.message}
                    </div>
                    {test.call.traceback && test.call.traceback.length > 0 && (
                      <div className="mt-2">
                        <h6 className="font-medium text-red-800 dark:text-red-200 mb-1">
                          Traceback:
                        </h6>
                        <div className="text-sm text-red-700 dark:text-red-300 font-mono">
                          {test.call.traceback.map((tb, i) => (
                            <div key={i} className="ml-2">
                              {tb.path}:{tb.lineno} in {tb.message}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Raw JSON Toggle */}
          <details className="mt-6">
            <summary className="cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              View Raw JSON Data
            </summary>
            <pre className="mt-2 p-4 bg-gray-900 text-gray-300 rounded-lg overflow-auto text-xs font-mono max-h-96">
              {JSON.stringify(reportData, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Default State */}
      {/* {!testResults && !agentRunning && (
        <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-gray-700/50 shadow-lg text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-flask text-4xl text-purple-600 dark:text-purple-400"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Ready for Functional Testing
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Choose your testing flow and upload test cases to get started
          </p>
        </div>
      )} */}
    </div>
  );
};

export default E2EResults;
