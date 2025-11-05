import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { authConfig } from '../config/auth';
import { regressionApi } from '../api/regressionApi';

const RegressionTesting = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const { user } = useUser();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  
  // Tab state - check if URL hash is #history to open history tab
  const [activeTab, setActiveTab] = useState(() => {
    return location.hash === '#history' ? 'history' : 'testing';
  });
  
  // History states
  const [historyList, setHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);
  const [historyReport, setHistoryReport] = useState(null);
  const [project, setProject] = useState(null);
  const [regressionTestData, setRegressionTestData] = useState(null); // Store parent regression_test data
  
  // Load project from localStorage
  useEffect(() => {
    try {
      const storedProject = localStorage.getItem('project');
      if (storedProject) {
        const parsed = JSON.parse(storedProject);
        setProject(parsed);
      }
    } catch (err) {
      console.error('Failed to load project from localStorage:', err);
    }
  }, []);
  
  // Handle URL hash changes to switch tabs
  useEffect(() => {
    if (location.hash === '#history') {
      setActiveTab('history');
      if (project?.id) {
        fetchHistoryList();
      }
    } else if (location.hash === '#testing' || !location.hash) {
      setActiveTab('testing');
      setHistoryReport(null);
      setSelectedHistoryId(null);
    }
  }, [location.hash, project?.id]);
  
  // Fetch history list
  const fetchHistoryList = async () => {
    if (!project?.id) return;
    
    setHistoryLoading(true);
    try {
      const data = await regressionApi.getProjectRegressionTests(project.id);
      console.log('Regression test data:', data);
      
      // The API returns: { project_id, regression_test: { regression_runs: [...], bug_sheet_url: ... }, count }
      // Extract regression_runs from the response and store parent regression_test data
      let historyArray = [];
      let parentData = null;
      
      if (Array.isArray(data)) {
        // If data is directly an array
        historyArray = data;
      } else if (data?.regression_test?.regression_runs && Array.isArray(data.regression_test.regression_runs)) {
        // Extract from regression_test.regression_runs (correct structure)
        historyArray = data.regression_test.regression_runs;
        parentData = data.regression_test; // Store parent data for bug_sheet_url
      } else if (Array.isArray(data?.regression_runs)) {
        // Alternative: regression_runs at root level
        historyArray = data.regression_runs;
        parentData = data; // Store parent data
      } else if (Array.isArray(data?.regression_tests)) {
        // Alternative: regression_tests array
        historyArray = data.regression_tests;
      } else if (Array.isArray(data?.data)) {
        // Alternative: data array
        historyArray = data.data;
      }
      
      console.log('Extracted history array:', historyArray);
      console.log('Parent regression test data:', parentData);
      setHistoryList(historyArray);
      setRegressionTestData(parentData); // Store parent data
    } catch (err) {
      console.error('Failed to load history list:', err);
      setHistoryList([]);
    } finally {
      setHistoryLoading(false);
    }
  };
  
  // Load historical report
  const handleLoadHistory = (regressionRun) => {
    // Toggle: if clicking the same test, close it
    // Use run_index as the unique identifier for each regression run
    const testId = regressionRun.run_index !== undefined ? regressionRun.run_index : (regressionRun.id || regressionRun._id || Date.now());
    if (selectedHistoryId === testId && historyReport) {
      setHistoryReport(null);
      setSelectedHistoryId(null);
      return;
    }
    
    // Map historical data to match current results format
    // RegressionRun model has: bugs_verified, bugs_reopened, total_bugs_tested, duration, status, created_at
    // bug_sheet_url is stored in the parent regression_test object, not in individual runs
    const reportData = {
      passed: Number(regressionRun.bugs_verified || regressionRun.passed || regressionRun.verified_count || 0),
      failed: Number(regressionRun.bugs_reopened || regressionRun.failed || regressionRun.reopened_count || 0),
      total: Number(regressionRun.total_bugs_tested || regressionRun.total || regressionRun.total_bugs || 0),
      verified_count: Number(regressionRun.bugs_verified || regressionRun.passed || regressionRun.verified_count || 0),
      reopened_count: Number(regressionRun.bugs_reopened || regressionRun.failed || regressionRun.reopened_count || 0),
      total_bugs: Number(regressionRun.total_bugs_tested || regressionRun.total || regressionRun.total_bugs || 0),
      duration: regressionRun.duration || '',
      status: regressionRun.status || '',
      bugSheetUrl: regressionTestData?.bug_sheet_url || regressionRun.bugSheetUrl || regressionRun.bug_sheet_url || '',
      reportUrl: regressionRun.reportUrl || regressionRun.report_url || ''
    };
    
    setHistoryReport(reportData);
    setSelectedHistoryId(testId);
  };
  
  // Handle history tab click
  const handleHistoryTabClick = () => {
    setActiveTab('history');
    setHistoryReport(null);
    setSelectedHistoryId(null);
    window.location.hash = '#history';
    if (project?.id) {
      fetchHistoryList();
    }
  };
  
  // Use displayResults to conditionally show historyReport or results
  const displayResults = activeTab === 'history' && historyReport ? historyReport : results;

  // Download functions for report
  const downloadJSON = (reportData) => {
    if (!reportData) return;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2)));
    element.setAttribute('download', `regression-test-report-${new Date().toISOString().split('T')[0]}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleRunRegression = async () => {
    setIsRunning(true);
    setError(null);
    setResults(null);
    setHistoryReport(null);
    setSelectedHistoryId(null);
    setActiveTab('testing');
    window.location.hash = '#testing';
    setProgress(0);

    try {
      // Get project ID from localStorage
      const proj = JSON.parse(localStorage.getItem('project') || 'null');
      const projectId = proj?.id;
      
      if (!projectId) {
        throw new Error('Project ID not found in localStorage. Please select a project first.');
      }

      // Try to get the latest E2E report ID
      setProgress(10);
      let reportId = localStorage.getItem('last_e2e_report_id') || '';
      if (!reportId) {
        const resp = await fetch(`http://localhost:8080/e2e-reports?project_id=${encodeURIComponent(projectId)}&limit=1`);
        if (resp.ok) {
          const j = await resp.json();
          const list = Array.isArray(j.reports) ? j.reports : [];
          if (list.length > 0) {
            reportId = String(list[0].id || list[0]._id || '');
          }
        }
      }
      if (!reportId) throw new Error('No recent E2E report found to run regression');

      setProgress(25);

      const response = await fetch('http://localhost:8080/trigger-regression', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem(authConfig.tokenKey) || ''}`
        },
        body: JSON.stringify({ 
          reportId,
          project_id: projectId // Use MongoDB _id from localStorage
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Regression test failed');
      }

      // Stream and parse SSE-like lines
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let progressLocal = 25;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'log') {
                progressLocal = Math.min(95, progressLocal + 5);
                setProgress(progressLocal);
              } else if (data.type === 'result') {
                const result = data.result || {};
                const passed = Number(result.passed || 0);
                const failed = Number(result.failed || 0);
                const total = Number(result.total || 0);
                setResults({
                  passed,
                  failed,
                  total,
                  verified_count: passed,
                  reopened_count: failed,
                  total_bugs: total,
                  bugSheetUrl: result.bugSheetUrl || '',
                  reportUrl: result.reportUrl || ''
                });
                setProgress(100);
              }
            } catch (_) {}
          }
        }
      }

    } catch (err) {
      setError(err.message);
      setIsRunning(false);
      setProgress(0);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-900 text-gray-900 dark:text-white p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Back Button & Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-4 flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-300 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-gray-700 dark:text-gray-300 font-semibold transition-all"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </button>

          <div className="flex items-center gap-3">
            <div className="text-slate-700 dark:text-slate-300 w-24 h-24 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
              <i className="fas fa-undo text-4xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Regression Testing</h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">AI-powered regression testing for bug verification</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 bg-transparent rounded-t-xl overflow-hidden">
          <div className="flex border-b-2 border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setActiveTab('testing');
                setHistoryReport(null);
                setSelectedHistoryId(null);
                window.location.hash = '#testing';
              }}
              className={`px-6 py-3 font-semibold text-sm transition-all ${
                activeTab === 'testing'
                  ? 'bg-transparent text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                  : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              REGRESSION TESTING
            </button>
            <button
              onClick={handleHistoryTabClick}
              className={`px-6 py-3 font-semibold text-sm transition-all ${
                activeTab === 'history'
                  ? 'bg-transparent text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                  : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              AGENT HISTORY
            </button>
          </div>
        </div>

        {/* REGRESSION TESTING Tab Content */}
        {activeTab === 'testing' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Panel */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <i className="fas fa-info-circle text-slate-600 dark:text-slate-400"></i>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Regression Testing Workflow</h2>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Functional Testing</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Complete functional tests are executed. A bug sheet is automatically created in Google Sheets.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Developer Fixes</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Developers update bug status in the sheet (e.g., "OPEN" → "FIXED").
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Regression Testing</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click "Run Regression Testing" to verify fixes. Tests run automatically and results update the bug sheet.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Verification Results</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Bug sheet is updated with verification status. Bugs are reopened if fixes didn't work.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-8">
              <button
                onClick={handleRunRegression}
                disabled={isRunning}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-emerald-500/50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
              >
                <i className={`fas ${isRunning ? 'fa-spinner fa-spin' : 'fa-play'}`}></i>
                {isRunning ? 'Running Regression Tests...' : 'Run Regression Testing'}
              </button>

              {/* Progress Bar */}
              {isRunning && (
                <div className="mt-4">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Results */}
            {displayResults && (
              <>
                <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                  <h3 className="font-bold text-emerald-800 dark:text-emerald-300 mb-2">
                    <i className="fas fa-check-circle mr-2"></i>
                    Regression Run Completed
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>{displayResults.verified_count || 0}</strong> bugs verified
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>{displayResults.reopened_count || 0}</strong> bugs reopened
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>{displayResults.total_bugs || 0}</strong> total bugs tested
                    </p>
                    {displayResults.bugSheetUrl && (
                      <p className="text-gray-700 dark:text-gray-300 mt-3">
                        <a 
                          href={displayResults.bugSheetUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <i className="fas fa-external-link-alt mr-2"></i>
                          View Bug Sheet
                        </a>
                      </p>
                    )}
                    {displayResults.reportUrl && (
                      <p className="text-gray-700 dark:text-gray-300">
                        <a 
                          href={displayResults.reportUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <i className="fas fa-external-link-alt mr-2"></i>
                          View Report
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                {/* Download Section */}
                <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg mt-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Export Test Report</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Download in your preferred format</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => downloadJSON(displayResults)}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all shadow-md"
                      >
                        <i className="fas fa-code"></i>
                        JSON
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Error */}
            {error && (
              <div className="mt-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl">
                <h3 className="font-bold text-rose-800 dark:text-rose-300 mb-2">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  Error
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">{error}</p>
              </div>
            )}
            </div>

            {/* Info Panel */}
            <div className="space-y-6">
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
                      <p className="font-semibold text-gray-900 dark:text-gray-300">Complete Functional Tests</p>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">Run functional tests first to generate the bug sheet</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <i className="fas fa-robot text-indigo-600 dark:text-indigo-400 mt-1"></i>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-300">Automated Verification</p>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">Regression tests automatically verify all bug fixes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <i className="fas fa-sync text-purple-600 dark:text-purple-400 mt-1"></i>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-300">Smart Reopening</p>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">Failed tests automatically reopen bugs in the sheet</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AGENT HISTORY Tab Content */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {historyReport ? (
              // Show report in full screen when selected
              <div className="space-y-6">
                {/* Viewing Historical Result Banner */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-4 text-white shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <i className="fas fa-history text-2xl"></i>
                      <div>
                        <h2 className="text-lg font-bold">Viewing Historical Result</h2>
                        <p className="text-sm text-white/90">
                          {selectedHistoryId ? `Regression Test ID: ${selectedHistoryId}` : 'Historical Test Run'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setHistoryReport(null);
                        setSelectedHistoryId(null);
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
                        onClick={() => downloadJSON(historyReport)}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all shadow-md"
                      >
                        <i className="fas fa-code"></i>
                        JSON
                      </button>
                    </div>
                  </div>
                </div>

                {/* Historical Report Display */}
                <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <i className="fas fa-chart-line text-indigo-600 dark:text-indigo-400"></i>
                    <h3 className="text-lg font-bold">Regression Test Report</h3>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40">
                      <div className="text-gray-500 dark:text-gray-400 text-sm">Total Bugs</div>
                      <div className="text-xl font-bold">{historyReport.total_bugs || 0}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                      <div className="text-emerald-700 dark:text-emerald-300 text-sm">Verified</div>
                      <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{historyReport.verified_count || 0}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20">
                      <div className="text-rose-700 dark:text-rose-300 text-sm">Reopened</div>
                      <div className="text-xl font-bold text-rose-600 dark:text-rose-400">{historyReport.reopened_count || 0}</div>
                    </div>
                  </div>

                  {/* Links */}
                  {historyReport.bugSheetUrl && (
                    <div className="mb-4">
                      <a 
                        href={historyReport.bugSheetUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                      >
                        <i className="fas fa-external-link-alt"></i>
                        View Bug Sheet
                      </a>
                    </div>
                  )}
                  {historyReport.reportUrl && (
                    <div>
                      <a 
                        href={historyReport.reportUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all"
                      >
                        <i className="fas fa-external-link-alt"></i>
                        View Report
                      </a>
                    </div>
                  )}

                </div>
              </div>
            ) : (
              // Show history list when no report is selected
              <div className="space-y-6">
                {historyLoading ? (
                  <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-10 border border-gray-200 dark:border-gray-700/50 shadow-lg flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
                    <h2 className="text-xl font-bold mt-6">Loading History...</h2>
                  </div>
                ) : historyList.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <i className="fas fa-inbox text-6xl text-gray-400 dark:text-gray-600 mb-4"></i>
                    <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">No history found</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Run regression tests to see them here
                    </p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Previous Test Runs</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {historyList.map((regressionRun, idx) => {
                        // Use run_index if available, otherwise use idx + 1
                        const runIndex = regressionRun.run_index !== undefined ? regressionRun.run_index : (idx + 1);
                        const testId = regressionRun.run_index !== undefined ? regressionRun.run_index : (regressionRun.id || regressionRun._id || idx);
                        const isSelected = selectedHistoryId === testId && historyReport;
                        // Check if run has report data (has bugs_verified, bugs_reopened, or total_bugs_tested)
                        const hasReport = !!(regressionRun.bugs_verified !== undefined || 
                                          regressionRun.bugs_reopened !== undefined || 
                                          regressionRun.total_bugs_tested !== undefined ||
                                          regressionRun.passed !== undefined || 
                                          regressionRun.failed !== undefined || 
                                          regressionRun.total !== undefined || 
                                          regressionRun.verified_count !== undefined);
                        const createdDate = regressionRun.created_at 
                          ? new Date(regressionRun.created_at).toLocaleString()
                          : 'N/A';
                        
                        return (
                          <button
                            key={testId}
                            onClick={() => handleLoadHistory(regressionRun)}
                            disabled={!hasReport}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                              isSelected
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                                : hasReport
                                ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm'
                                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <i className="fas fa-undo text-cyan-600 dark:text-cyan-400"></i>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                                      Regression Test #{runIndex}
                                    </h4>
                                    {hasReport && (
                                      <span className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded whitespace-nowrap">
                                        Has Report
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {createdDate}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 flex-shrink-0">
                                {hasReport && (
                                  <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                      {regressionRun.total_bugs_tested || regressionRun.total || regressionRun.total_bugs || 0}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Bugs</p>
                                  </div>
                                )}
                                {hasReport && (
                                  <i className={`fas fa-chevron-right text-gray-400 transition-colors ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : ''}`}></i>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegressionTesting;

