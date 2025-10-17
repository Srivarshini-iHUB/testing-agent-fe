import { useState } from 'react';

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
      if (reportUrl.startsWith('http://') || reportUrl.startsWith('https://')) {
        window.open(reportUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.open(`/pytest-report?url=${encodeURIComponent(reportUrl)}`, '_blank', 'noopener,noreferrer');
      }
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
          {testResults && testResults.reportUrl && (
            <button
              onClick={handleViewReport}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-chart-bar"></i>
              View Report
            </button>
          )}
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
          </div>
        </div>
      )}

      {/* Default State */}
      {!testResults && !agentRunning && (
        <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-gray-700/50 shadow-lg text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-flask text-4xl text-purple-600 dark:text-purple-400"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Ready for E2E Testing
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Choose your testing flow and upload test cases to get started
          </p>
        </div>
      )}
    </div>
  );
};

export default E2EResults;
