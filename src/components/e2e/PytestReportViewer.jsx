import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PytestReportViewer = () => {
  const navigate = useNavigate();
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
        return <i className="fas fa-check-circle text-emerald-500 dark:text-emerald-400 text-xl"></i>;
      case 'failed':
        return <i className="fas fa-times-circle text-rose-500 dark:text-rose-400 text-xl"></i>;
      case 'skipped':
        return <i className="fas fa-minus-circle text-amber-500 dark:text-amber-400 text-xl"></i>;
      default:
        return <i className="fas fa-question-circle text-gray-500 dark:text-gray-400 text-xl"></i>;
    }
  };

  const getStatusBadge = (outcome) => {
    const badges = {
      passed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      failed: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
      skipped: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    };
    return badges[outcome] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-semibold">Loading test report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-900 p-6">
        <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-gray-700/50 shadow-2xl max-w-lg w-full">
          <div className="text-center">
            <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-exclamation-triangle text-4xl text-rose-600 dark:text-rose-400"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Report</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => navigate('/e2e-testing')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Functional Testing
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-900 p-6">
        <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-gray-700/50 shadow-2xl max-w-lg w-full text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Report Data</h2>
          <p className="text-gray-600 dark:text-gray-300">Please provide a valid report URL</p>
        </div>
      </div>
    );
  }

  const { summary, tests = [], duration, created } = reportData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/e2e-testing')}
            className="mb-4 flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-300 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-gray-700 dark:text-gray-300 font-semibold transition-all"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Functional Testing
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-3xl shadow-lg">
              📊
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pytest Test Report</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {created && new Date(created * 1000).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border-l-4 border-blue-500 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">Total Tests</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">{summary?.total || 0}</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <i className="fas fa-clipboard-list text-3xl text-blue-600 dark:text-blue-400"></i>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border-l-4 border-emerald-500 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">Passed</p>
                <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">{summary?.passed || 0}</p>
              </div>
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                <i className="fas fa-check-circle text-3xl text-emerald-600 dark:text-emerald-400"></i>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border-l-4 border-rose-500 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">Failed</p>
                <p className="text-4xl font-bold text-rose-600 dark:text-rose-400">{summary?.failed || 0}</p>
              </div>
              <div className="w-14 h-14 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center">
                <i className="fas fa-times-circle text-3xl text-rose-600 dark:text-rose-400"></i>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border-l-4 border-purple-500 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">Duration</p>
                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{formatDuration(duration)}</p>
              </div>
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <i className="fas fa-clock text-3xl text-purple-600 dark:text-purple-400"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <i className="fas fa-list-check text-indigo-600 dark:text-indigo-400"></i>
            Test Results
          </h2>
          <div className="space-y-4">
            {tests.map((test, index) => {
              const isExpanded = expandedTests.has(test.nodeid);
              const testDuration = (test.setup?.duration || 0) + (test.call?.duration || 0) + (test.teardown?.duration || 0);
              
              return (
                <div
                  key={test.nodeid || index}
                  className={`border-2 rounded-xl overflow-hidden transition-all ${
                    test.outcome === 'failed'
                      ? 'border-rose-300 dark:border-rose-700'
                      : test.outcome === 'passed'
                      ? 'border-emerald-300 dark:border-emerald-700'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <div
                    className={`p-5 cursor-pointer hover:opacity-90 transition-all ${
                      test.outcome === 'failed'
                        ? 'bg-rose-50 dark:bg-rose-900/20'
                        : test.outcome === 'passed'
                        ? 'bg-emerald-50 dark:bg-emerald-900/20'
                        : 'bg-gray-50 dark:bg-gray-800/30'
                    }`}
                    onClick={() => toggleTest(test.nodeid)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(test.outcome)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                              {test.nodeid?.split('::').pop() || 'Unknown Test'}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(test.outcome)}`}>
                              {test.outcome?.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-mono mb-2 truncate">
                            {test.nodeid}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <i className="fas fa-stopwatch"></i>
                              {formatDuration(testDuration)}
                            </span>
                            {test.lineno && (
                              <span className="flex items-center gap-1">
                                <i className="fas fa-map-marker-alt"></i>
                                Line {test.lineno}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <i className={`fas fa-chevron-down text-gray-500 dark:text-gray-400 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}></i>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-5 bg-white dark:bg-gray-900/50 border-t-2 border-gray-200 dark:border-gray-700">
                      <div className="space-y-5">
                        {/* Setup Phase */}
                        {test.setup && (
                          <div>
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                              <i className="fas fa-cog text-blue-600 dark:text-blue-400"></i>
                              Setup Phase
                            </h4>
                            <div className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
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
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                              <i className="fas fa-play text-indigo-600 dark:text-indigo-400"></i>
                              Test Execution
                            </h4>
                            <div className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg mb-3">
                              {getStatusIcon(test.call.outcome)}
                              <span className="text-gray-600 dark:text-gray-400">
                                {test.call.outcome} ({formatDuration(test.call.duration)})
                              </span>
                            </div>

                            {/* Error Details */}
                            {test.call.outcome === 'failed' && test.call.crash && (
                              <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg border-2 border-rose-200 dark:border-rose-800">
                                <h5 className="text-sm font-bold text-rose-800 dark:text-rose-300 mb-2 flex items-center gap-2">
                                  <i className="fas fa-bug"></i>
                                  Error Message
                                </h5>
                                <pre className="text-sm text-rose-700 dark:text-rose-400 whitespace-pre-wrap font-mono bg-rose-100 dark:bg-rose-950/30 p-3 rounded">
                                  {test.call.crash.message}
                                </pre>
                                {test.call.crash.path && (
                                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 font-mono">
                                    <i className="fas fa-file-code mr-1"></i>
                                    {test.call.crash.path}:{test.call.crash.lineno}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Long repr */}
                            {test.call.longrepr && (
                              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <h5 className="text-sm font-bold text-gray-800 dark:text-gray-300 mb-2 flex items-center gap-2">
                                  <i className="fas fa-stream"></i>
                                  Traceback
                                </h5>
                                <pre className="text-xs text-gray-700 dark:text-gray-400 whitespace-pre-wrap font-mono overflow-x-auto custom-scrollbar">
                                  {test.call.longrepr}
                                </pre>
                              </div>
                            )}

                            {/* Traceback */}
                            {test.call.traceback && test.call.traceback.length > 0 && (
                              <div>
                                <h5 className="text-sm font-bold text-gray-800 dark:text-gray-300 mb-2 flex items-center gap-2">
                                  <i className="fas fa-layer-group"></i>
                                  Stack Trace
                                </h5>
                                <div className="space-y-2">
                                  {test.call.traceback.map((trace, idx) => (
                                    <div key={idx} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                      <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                                        {trace.path}:{trace.lineno}
                                      </span>
                                      {trace.message && (
                                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{trace.message}</p>
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
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                              <i className="fas fa-broom text-purple-600 dark:text-purple-400"></i>
                              Teardown Phase
                            </h4>
                            <div className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
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
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                              <i className="fas fa-tags text-amber-600 dark:text-amber-400"></i>
                              Keywords
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {test.keywords.map((keyword, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-semibold"
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
          <div className="mt-6 bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300 font-bold flex items-center gap-2">
                <i className="fas fa-code"></i>
                Exit Code
              </span>
              <span className={`px-4 py-2 rounded-lg text-sm font-bold ${
                reportData.exitcode === 0
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'
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
