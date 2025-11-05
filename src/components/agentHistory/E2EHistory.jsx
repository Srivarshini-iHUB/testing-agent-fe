import React, { useEffect, useMemo, useState } from 'react';
import { e2eApi } from '../../api/e2eApi';

const formatDate = (value) => {
  if (!value) return '-';
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
  } catch (e) {
    return value;
  }
};

const DownloadJsonButton = ({ fileName, data }) => {
  const handleDownload = () => {
    try {
      const json = JSON.stringify(data ?? {}, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download JSON', err);
    }
  };

  return (
    <button
      onClick={handleDownload}
      title="Download report JSON"
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all text-sm font-medium"
    >
      <i className="fas fa-download"></i>
    </button>
  );
};

const E2EHistory = ({ projectId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [expandedReports, setExpandedReports] = useState({});
  const [expandedTestCases, setExpandedTestCases] = useState({});

  const toggleReport = (reportId) => {
    setExpandedReports((prev) => ({ ...prev, [reportId]: !(prev[reportId] ?? false) }));
  };

  const toggleTestCase = (key) => {
    setExpandedTestCases((prev) => ({ ...prev, [key]: !(prev[key] ?? false) }));
  };

  const totals = useMemo(() => {
    if (!data || !data.reports || !Array.isArray(data.reports)) return { totalReports: 0, totalTests: 0 };
    return {
      totalReports: data.reports.length ?? 0,
      totalTests: data.reports.reduce((sum, report) => sum + (report.total_tests || 0), 0),
    };
  }, [data]);

  useEffect(() => {
    let mounted = true;
    const fetchReports = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await e2eApi.getProjectE2EReports(projectId);
        if (mounted) setData(res);
      } catch (e) {
        if (mounted) setError(e?.message || 'Failed to load E2E reports');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (projectId) fetchReports();
    return () => {
      mounted = false;
    };
  }, [projectId]);

  if (!projectId) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Functional Testing - History</h2>
        <div className="inline-block px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400">
          Provide a valid projectId to view E2E reports.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Functional Testing - History</h2>

      {loading && (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-4xl text-indigo-600 dark:text-indigo-400 mb-4"></i>
          <p className="text-gray-600 dark:text-gray-400">Loading history...</p>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 mb-4">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      )}

      {data && data.reports && Array.isArray(data.reports) && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="flex gap-4 mb-6">
            <div className="px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg font-semibold text-sm">
              <strong>Total Runs:</strong> {totals.totalReports}
            </div>
            <div className="px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg font-semibold text-sm">
              <strong>Total Tests:</strong> {totals.totalTests}
            </div>
          </div>

          {data.reports.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
              <i className="fas fa-file-alt text-4xl text-gray-400 dark:text-gray-600 mb-3"></i>
              <p className="text-gray-600 dark:text-gray-400">No E2E reports found for this project.</p>
            </div>
          ) : (
            data.reports.map((report, idx) => {
              const reportId = report.id || `report_${idx}`;
              const isReportOpen = expandedReports[reportId] ?? false;
              
              return (
                <div
                  key={reportId}
                  className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg"
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          Run #{idx + 1}
                        </span>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                          ID: {reportId}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <strong>Created:</strong> {formatDate(report.created_at)}
                        </div>
                        <div>
                          <strong>Updated:</strong> {formatDate(report.updated_at)}
                        </div>
                        <div>
                          <strong>Project URL:</strong>{' '}
                          <span className="truncate">{report.project_url || '-'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex gap-2 flex-wrap">
                        <span className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-xs font-semibold">
                          Passed: {report.passed || 0}
                        </span>
                        <span className="px-3 py-1 bg-rose-500 text-white rounded-lg text-xs font-semibold">
                          Failed: {report.failed || 0}
                        </span>
                        <span className="px-3 py-1 bg-indigo-500 text-white rounded-lg text-xs font-semibold">
                          Total: {report.total_tests || 0}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleReport(reportId)}
                        title="Toggle report details"
                        aria-label={isReportOpen ? 'Collapse report' : 'Expand report'}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                      >
                        <i className={`fas fa-chevron-${isReportOpen ? 'down' : 'right'}`}></i>
                      </button>
                      <DownloadJsonButton 
                        fileName={`e2e_report_${reportId}`} 
                        data={report} 
                      />
                    </div>
                  </div>

                  {isReportOpen && (
                    <div className="space-y-6 mt-4">
                      {/* Test Results Summary - Same UI as E2EResults */}
                      <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Test Results Summary</h2>
                        <div className="space-y-4">
                          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                            <div className="flex items-center gap-2">
                              <i className="fas fa-check-circle text-2xl text-emerald-600 dark:text-emerald-400"></i>
                              <span className="text-emerald-800 dark:text-emerald-200 font-semibold">
                                Test execution completed!
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                                {Number(report.passed || 0)}
                              </div>
                              <div className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">Tests Passed</div>
                            </div>
                            <div className="text-center p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800">
                              <div className="text-3xl font-bold text-rose-600 dark:text-rose-400 mb-1">
                                {Number(report.failed || 0)}
                              </div>
                              <div className="text-xs text-rose-700 dark:text-rose-300 font-semibold">Tests Failed</div>
                            </div>
                            {report.total_tests && (
                              <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 col-span-2">
                                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                                  {Number(report.total_tests || 0)}
                                </div>
                                <div className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold">Total Tests</div>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            {report.duration && (
                              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Duration</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{report.duration}</span>
                              </div>
                            )}
                            {report.bug_sheet_url && (
                              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Bug Sheet</span>
                                <a
                                  href={report.bug_sheet_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                                >
                                  View Sheet
                                </a>
                              </div>
                            )}
                            {report.bug_csv_url && (
                              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Bug CSV</span>
                                <a
                                  href={report.bug_csv_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                                >
                                  Download CSV
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Test Script */}
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white mb-2">Test Script</div>
                        <pre className="bg-gray-900 dark:bg-black text-gray-300 dark:text-gray-400 p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap border border-gray-700 dark:border-gray-600">
                          <code>{report.test_script || '// No test script available'}</code>
                        </pre>
                      </div>

                      {/* Test Cases */}
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white mb-3">
                          Test Cases ({report.test_cases?.length || 0})
                        </div>
                        {report.test_cases && report.test_cases.length > 0 ? (
                          <div className="space-y-3">
                            {report.test_cases.map((tc, tcIdx) => {
                              const tcKey = `${reportId}_${tc.test_case_id || tc.test_case_number || tcIdx}`;
                              const isTestCaseOpen = expandedTestCases[tcKey] ?? false;
                              
                              return (
                                <div
                                  key={tcKey}
                                  className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/30"
                                >
                                  <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                      <div className="font-semibold text-gray-900 dark:text-white mb-2">
                                        {tc.test_case_id || tc.test_case_number || `TC-${tcIdx + 1}`}:{' '}
                                        {tc.test_scenario || tc.feature_name || 'Test Case'}
                                      </div>
                                      <div className="flex gap-2 flex-wrap">
                                        <span
                                          className={`px-2 py-1 rounded text-xs font-semibold ${
                                            tc.test_type === 'Positive'
                                              ? 'bg-emerald-500 text-white'
                                              : tc.test_type === 'Negative'
                                              ? 'bg-rose-500 text-white'
                                              : 'bg-yellow-500 text-white'
                                          }`}
                                        >
                                          {tc.test_type || 'Positive'}
                                        </span>
                                        <span
                                          className={`px-2 py-1 rounded text-xs font-semibold ${
                                            tc.priority === 'Critical' || tc.priority === 'High'
                                              ? 'bg-rose-500 text-white'
                                              : tc.priority === 'Medium'
                                              ? 'bg-yellow-500 text-white'
                                              : 'bg-cyan-500 text-white'
                                          }`}
                                        >
                                          {tc.priority || 'Medium'}
                                        </span>
                                        <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-500 text-white">
                                          {tc.automation_status || 'Manual'}
                                        </span>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => toggleTestCase(tcKey)}
                                      title="Toggle test case details"
                                      aria-label={isTestCaseOpen ? 'Collapse test case' : 'Expand test case'}
                                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex-shrink-0"
                                    >
                                      <i className={`fas fa-chevron-${isTestCaseOpen ? 'down' : 'right'}`}></i>
                                    </button>
                                  </div>

                                  {isTestCaseOpen && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                                      <div className="text-sm">
                                        <strong className="text-gray-700 dark:text-gray-300">Feature Name:</strong>{' '}
                                        <span className="text-gray-900 dark:text-white">{tc.feature_name || '-'}</span>
                                      </div>
                                      <div className="text-sm">
                                        <strong className="text-gray-700 dark:text-gray-300">Preconditions:</strong>{' '}
                                        <span className="text-gray-900 dark:text-white">{tc.preconditions || '-'}</span>
                                      </div>
                                      <div className="text-sm">
                                        <strong className="text-gray-700 dark:text-gray-300">Steps to Execute:</strong>
                                        <pre className="mt-2 bg-gray-900 dark:bg-black text-gray-300 dark:text-gray-400 p-3 rounded-lg overflow-x-auto text-xs font-mono whitespace-pre-wrap border border-gray-700 dark:border-gray-600">
                                          {tc.steps_to_execute || '-'}
                                        </pre>
                                      </div>
                                      <div className="text-sm">
                                        <strong className="text-gray-700 dark:text-gray-300">Test Data:</strong>{' '}
                                        <span className="text-gray-900 dark:text-white">{tc.test_data || '-'}</span>
                                      </div>
                                      <div className="text-sm">
                                        <strong className="text-gray-700 dark:text-gray-300">Expected Result:</strong>
                                        <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white text-xs">
                                          {tc.expected_result || '-'}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm">
                            No test cases in this report.
                          </div>
                        )}
                      </div>

                      {/* Test Results - Same UI as E2EResults Detailed Report */}
                      {report.test_results && report.test_results.length > 0 && (
                        <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Test Results ({report.test_results.length})
                          </h3>
                          <div className="space-y-4">
                            {report.test_results.map((result, resultIdx) => (
                              <div
                                key={resultIdx}
                                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/30"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {result.name || `Test ${resultIdx + 1}`}
                                  </h4>
                                  <span
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                                      result.status === 'passed' || result.status === 'PASSED'
                                        ? 'bg-emerald-500 text-white'
                                        : result.status === 'failed' || result.status === 'FAILED'
                                        ? 'bg-rose-500 text-white'
                                        : 'bg-gray-500 text-white'
                                    }`}
                                  >
                                    {(result.status || 'UNKNOWN').toUpperCase()}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                  Duration: {result.duration || '-'}
                                </div>
                                {(result.status === 'failed' || result.status === 'FAILED') && result.error_message && (
                                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <h5 className="font-medium text-red-800 dark:text-red-200 mb-2">Error Details:</h5>
                                    <div className="text-sm text-red-700 dark:text-red-300 font-mono whitespace-pre-wrap">
                                      {result.error_message}
                                    </div>
                                  </div>
                                )}
                                {result.actual_result && (
                                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                    <strong>Actual Result:</strong> {result.actual_result}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default E2EHistory;
