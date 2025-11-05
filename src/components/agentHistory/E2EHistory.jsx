import React, { useEffect, useState } from 'react';
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

const E2EHistory = ({ projectId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [expandedReports, setExpandedReports] = useState({});
  const [expandedTestCases, setExpandedTestCases] = useState({});
  const [selectedReport, setSelectedReport] = useState(null);

  const toggleReport = (reportId) => {
    setExpandedReports((prev) => ({ ...prev, [reportId]: !(prev[reportId] ?? false) }));
  };

  // Download functions for report
  const downloadJSON = (reportData) => {
    if (!reportData) return;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2)));
    element.setAttribute('download', `functional-test-report-${reportData.id || new Date().toISOString().split('T')[0]}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadMarkdown = (reportData) => {
    if (!reportData) return;
    
    // Create markdown report from report data
    let markdown = `# Functional Test Report\n\n`;
    markdown += `**Test Run Date:** ${formatDate(reportData.created_at)}\n\n`;
    
    if (reportData.passed !== undefined || reportData.failed !== undefined) {
      markdown += `## Test Summary\n\n`;
      markdown += `- **Passed:** ${reportData.passed || 0}\n`;
      markdown += `- **Failed:** ${reportData.failed || 0}\n`;
      if (reportData.total_tests) markdown += `- **Total:** ${reportData.total_tests}\n`;
      markdown += `\n`;
    }
    
    if (reportData.duration) {
      markdown += `**Duration:** ${reportData.duration}\n\n`;
    }
    
    if (reportData.project_url) {
      markdown += `**Project URL:** ${reportData.project_url}\n\n`;
    }
    
    if (reportData.bug_sheet_url) {
      markdown += `**Bug Sheet URL:** ${reportData.bug_sheet_url}\n\n`;
    }
    
    if (reportData.test_cases && reportData.test_cases.length > 0) {
      markdown += `## Test Cases\n\n`;
      reportData.test_cases.forEach((tc, idx) => {
        markdown += `### Test Case ${idx + 1}\n`;
        markdown += `- **ID:** ${tc.test_case_id || tc.test_case_number || `TC-${idx + 1}`}\n`;
        markdown += `- **Scenario:** ${tc.test_scenario || tc.feature_name || 'N/A'}\n`;
        markdown += `- **Type:** ${tc.test_type || 'Positive'}\n`;
        markdown += `- **Priority:** ${tc.priority || 'Medium'}\n`;
        markdown += `\n`;
      });
    }
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `functional-test-report-${reportData.id || new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleTestCase = (key) => {
    setExpandedTestCases((prev) => ({ ...prev, [key]: !(prev[key] ?? false) }));
  };

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

      {data && (
        <div className="space-y-6">
          {/* Handle different response structures */}
          {(() => {
            // Check if data.reports is an array
            let reports = [];
            if (Array.isArray(data.reports)) {
              reports = data.reports;
            } else if (Array.isArray(data)) {
              reports = data;
            } else if (data.data && Array.isArray(data.data)) {
              reports = data.data;
            } else if (data.e2e_reports && Array.isArray(data.e2e_reports)) {
              reports = data.e2e_reports;
            } else if (data.runs && Array.isArray(data.runs)) {
              // Handle case where reports are in a runs array
              reports = data.runs;
            }

            // If reports is still empty, show debug info
            if (reports.length === 0) {
              console.log('E2E History - No reports found. Data structure:', data);
              return (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                  <i className="fas fa-file-alt text-4xl text-gray-400 dark:text-gray-600 mb-3"></i>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">No E2E reports found for this project.</p>
                  {data && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      Debug: Response keys: {Object.keys(data).join(', ')}
                    </p>
                  )}
                </div>
              );
            }

            return reports.map((report, idx) => {
              // Handle both direct report format and runs array format
              const reportData = report.run_index !== undefined ? report : report; // If it's a run, use it directly
              const reportId = reportData.id || reportData._id || `report_${idx}`;
              const isReportOpen = expandedReports[reportId] ?? false;
              
              // Extract run_index if present (for runs array format)
              const runIndex = reportData.run_index !== undefined ? reportData.run_index : idx;
              
              return (
                <div
                  key={reportId}
                  className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg"
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          Run #{runIndex + 1}
                        </span>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                          ID: {reportId}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <strong>Created:</strong> {formatDate(reportData.created_at || report.created_at)}
                        </div>
                        <div>
                          <strong>Updated:</strong> {formatDate(reportData.updated_at || report.updated_at)}
                        </div>
                        <div>
                          <strong>Project URL:</strong>{' '}
                          <span className="truncate">{reportData.project_url || report.project_url || '-'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex gap-2 flex-wrap">
                        <span className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-xs font-semibold">
                          Passed: {reportData.passed !== undefined ? reportData.passed : (report.passed || 0)}
                        </span>
                        <span className="px-3 py-1 bg-rose-500 text-white rounded-lg text-xs font-semibold">
                          Failed: {reportData.failed !== undefined ? reportData.failed : (report.failed || 0)}
                        </span>
                        <span className="px-3 py-1 bg-indigo-500 text-white rounded-lg text-xs font-semibold">
                          Total: {reportData.total_tests !== undefined ? reportData.total_tests : (report.total_tests || 0)}
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
                    </div>
                  </div>

                  {isReportOpen && (
                    <div className="space-y-6 mt-4">
                      {/* Viewing Historical Result Banner */}
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-4 text-white shadow-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <i className="fas fa-history text-2xl"></i>
                            <div>
                              <h2 className="text-lg font-bold">Viewing Historical Result</h2>
                              <p className="text-sm text-white/90">
                                {formatDate(reportData.created_at || report.created_at)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setExpandedReports((prev) => ({ ...prev, [reportId]: false }));
                            }}
                            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-sm font-medium"
                          >
                            <i className="fas fa-times mr-2"></i>
                            Close Report
                          </button>
                        </div>
                      </div>

                      {/* Download Section */}
                      <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Export Test Report</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Download in your preferred format</p>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => downloadJSON(reportData)}
                              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all shadow-md"
                            >
                              <i className="fas fa-code"></i>
                              JSON
                            </button>
                            <button
                              onClick={() => downloadMarkdown(reportData)}
                              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-all shadow-md"
                            >
                              <i className="fas fa-file-alt"></i>
                              Markdown
                            </button>
                          </div>
                        </div>
                      </div>

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
                                {Number((reportData.passed !== undefined ? reportData.passed : report.passed) || 0)}
                              </div>
                              <div className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">Tests Passed</div>
                            </div>
                            <div className="text-center p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800">
                              <div className="text-3xl font-bold text-rose-600 dark:text-rose-400 mb-1">
                                {Number((reportData.failed !== undefined ? reportData.failed : report.failed) || 0)}
                              </div>
                              <div className="text-xs text-rose-700 dark:text-rose-300 font-semibold">Tests Failed</div>
                            </div>
                            {(reportData.total_tests !== undefined ? reportData.total_tests : report.total_tests) && (
                              <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 col-span-2">
                                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                                  {Number((reportData.total_tests !== undefined ? reportData.total_tests : report.total_tests) || 0)}
                                </div>
                                <div className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold">Total Tests</div>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            {(reportData.duration || report.duration) && (
                              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Duration</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{reportData.duration || report.duration}</span>
                              </div>
                            )}
                            {(reportData.bug_sheet_url || report.bug_sheet_url) && (
                              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Bug Sheet</span>
                                <a
                                  href={reportData.bug_sheet_url || report.bug_sheet_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                                >
                                  View Sheet
                                </a>
                              </div>
                            )}
                            {(reportData.bug_csv_url || report.bug_csv_url) && (
                              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Bug CSV</span>
                                <a
                                  href={reportData.bug_csv_url || report.bug_csv_url}
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
                      <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Test Script</h3>
                        <pre className="bg-gray-900 dark:bg-black text-gray-300 dark:text-gray-400 p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap border border-gray-700 dark:border-gray-600">
                          <code>{reportData.test_script || report.test_script || '// No test script available'}</code>
                        </pre>
                      </div>

                      {/* Test Cases */}
                      <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                          Test Cases ({((reportData.test_cases || report.test_cases)?.length || 0)})
                        </h3>
                        {((reportData.test_cases || report.test_cases) && (reportData.test_cases || report.test_cases).length > 0) ? (
                          <div className="space-y-3">
                            {(reportData.test_cases || report.test_cases).map((tc, tcIdx) => {
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
                      {((reportData.test_results || report.test_results) && (reportData.test_results || report.test_results).length > 0) && (
                        <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Test Results ({((reportData.test_results || report.test_results)?.length || 0)})
                          </h3>
                          <div className="space-y-4">
                            {(reportData.test_results || report.test_results).map((result, resultIdx) => (
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
            });
          })()}
        </div>
      )}

      {data && !data.reports && !Array.isArray(data) && !data.data && !data.e2e_reports && (
        <div className="text-center py-12 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border-2 border-dashed border-yellow-300 dark:border-yellow-700">
          <i className="fas fa-exclamation-triangle text-4xl text-yellow-400 dark:text-yellow-600 mb-3"></i>
          <p className="text-gray-600 dark:text-gray-400 mb-2">Unexpected response format from API.</p>
          <p className="text-xs text-gray-500 dark:text-gray-500">Response: {JSON.stringify(data).substring(0, 100)}...</p>
        </div>
      )}
    </div>
  );
};

export default E2EHistory;
