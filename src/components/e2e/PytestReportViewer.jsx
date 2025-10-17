import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const PytestReportViewer = () => {
  const [searchParams] = useSearchParams();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTests, setExpandedTests] = useState(new Set());

  const reportUrl = searchParams.get('url') || '';

  useEffect(() => {
    if (reportUrl) {
      fetchReport(reportUrl);
    } else {
      setLoading(false);
      setError('No report URL provided');
    }
  }, [reportUrl]);

  const fetchReport = async (url) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch report: ${response.status}`);
      }
      const data = await response.json();
      setReportData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleTest = (testId) => {
    setExpandedTests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(testId)) {
        newSet.delete(testId);
      } else {
        newSet.add(testId);
      }
      return newSet;
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
    if (seconds < 60) return `${seconds.toFixed(2)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return `${minutes}m ${secs}s`;
  };

  const getStatusIcon = (outcome) => {
    switch (outcome) {
      case 'passed':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'skipped':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getStatusBadge = (outcome) => {
    const badges = {
      passed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      skipped: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };
    return badges[outcome] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading test report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="card max-w-lg">
          <div className="text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Report</h2>
            <p className="text-gray-600 dark:text-gray-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="card max-w-lg text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Report Data</h2>
          <p className="text-gray-600 dark:text-gray-300">Please provide a valid report URL</p>
        </div>
      </div>
    );
  }

  const { summary, tests = [], duration, created } = reportData;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Pytest Test Report
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {created && new Date(created * 1000).toLocaleString()}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">Total Tests</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{summary?.total || 0}</p>
              </div>
              <div className="text-blue-500 dark:text-blue-400">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-green-200 dark:border-green-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 dark:text-green-300 font-medium mb-1">Passed</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">{summary?.passed || 0}</p>
              </div>
              <div className="text-green-500 dark:text-green-400">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 border-red-200 dark:border-red-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 dark:text-red-300 font-medium mb-1">Failed</p>
                <p className="text-3xl font-bold text-red-900 dark:text-red-100">{summary?.failed || 0}</p>
              </div>
              <div className="text-red-500 dark:text-red-400">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 dark:text-purple-300 font-medium mb-1">Duration</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{formatDuration(duration)}</p>
              </div>
              <div className="text-purple-500 dark:text-purple-400">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Test Results</h2>
          <div className="space-y-4">
            {tests.map((test, index) => {
              const isExpanded = expandedTests.has(test.nodeid);
              const testDuration = (test.setup?.duration || 0) + (test.call?.duration || 0) + (test.teardown?.duration || 0);
              
              return (
                <div
                  key={test.nodeid || index}
                  className={`border rounded-lg overflow-hidden transition-all ${
                    test.outcome === 'failed'
                      ? 'border-red-300 dark:border-red-700'
                      : test.outcome === 'passed'
                      ? 'border-green-300 dark:border-green-700'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <div
                    className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      test.outcome === 'failed'
                        ? 'bg-red-50 dark:bg-red-900/20'
                        : test.outcome === 'passed'
                        ? 'bg-green-50 dark:bg-green-900/20'
                        : 'bg-gray-50 dark:bg-gray-800'
                    }`}
                    onClick={() => toggleTest(test.nodeid)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getStatusIcon(test.outcome)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                              {test.nodeid?.split('::').pop() || 'Unknown Test'}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(test.outcome)}`}>
                              {test.outcome?.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-mono truncate">
                            {test.nodeid}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <span>⏱️ {formatDuration(testDuration)}</span>
                            {test.lineno && <span>📍 Line {test.lineno}</span>}
                          </div>
                        </div>
                      </div>
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${
                          isExpanded ? 'transform rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                      {/* Test Phases */}
                      <div className="space-y-4">
                        {/* Setup Phase */}
                        {test.setup && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Setup Phase</h4>
                            <div className="flex items-center space-x-2 text-sm">
                              {getStatusIcon(test.setup.outcome)}
                              <span className="text-gray-600 dark:text-gray-400">
                                {test.setup.outcome} ({formatDuration(test.setup.duration)})
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Call Phase */}
                        {test.call && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Test Execution</h4>
                            <div className="flex items-center space-x-2 text-sm mb-2">
                              {getStatusIcon(test.call.outcome)}
                              <span className="text-gray-600 dark:text-gray-400">
                                {test.call.outcome} ({formatDuration(test.call.duration)})
                              </span>
                            </div>

                            {/* Error Details */}
                            {test.call.outcome === 'failed' && test.call.crash && (
                              <div className="mt-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                <h5 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">Error Message</h5>
                                <pre className="text-sm text-red-700 dark:text-red-400 whitespace-pre-wrap font-mono">
                                  {test.call.crash.message}
                                </pre>
                                {test.call.crash.path && (
                                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                                    📄 {test.call.crash.path}:{test.call.crash.lineno}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Long repr (detailed error) */}
                            {test.call.longrepr && (
                              <div className="mt-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-300 mb-2">Traceback</h5>
                                <pre className="text-xs text-gray-700 dark:text-gray-400 whitespace-pre-wrap font-mono overflow-x-auto">
                                  {test.call.longrepr}
                                </pre>
                              </div>
                            )}

                            {/* Traceback */}
                            {test.call.traceback && test.call.traceback.length > 0 && (
                              <div className="mt-3">
                                <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-300 mb-2">Stack Trace</h5>
                                <div className="space-y-2">
                                  {test.call.traceback.map((trace, idx) => (
                                    <div key={idx} className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
                                      <span className="text-gray-600 dark:text-gray-400">{trace.path}:{trace.lineno}</span>
                                      {trace.message && (
                                        <p className="text-gray-700 dark:text-gray-300 mt-1">{trace.message}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Teardown Phase */}
                        {test.teardown && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Teardown Phase</h4>
                            <div className="flex items-center space-x-2 text-sm">
                              {getStatusIcon(test.teardown.outcome)}
                              <span className="text-gray-600 dark:text-gray-400">
                                {test.teardown.outcome} ({formatDuration(test.teardown.duration)})
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Keywords */}
                        {test.keywords && test.keywords.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Keywords</h4>
                            <div className="flex flex-wrap gap-2">
                              {test.keywords.map((keyword, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Exit Code */}
        {reportData.exitcode !== undefined && (
          <div className="mt-6 card">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Exit Code</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                reportData.exitcode === 0
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {reportData.exitcode}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PytestReportViewer;

