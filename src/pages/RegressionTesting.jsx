import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { authConfig } from '../config/auth';

const RegressionTesting = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user } = useUser();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleRunRegression = async () => {
    setIsRunning(true);
    setError(null);
    setResults(null);
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
            <i className="fas fa-undo text-4xl text-slate-600 dark:text-slate-400"></i>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Regression Testing</h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">AI-powered regression testing for bug verification</p>
            </div>
          </div>
        </div>

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
            {results && (
              <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <h3 className="font-bold text-emerald-800 dark:text-emerald-300 mb-2">
                  <i className="fas fa-check-circle mr-2"></i>
                  Regression Run Completed
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>{results.verified_count || 0}</strong> bugs verified
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>{results.reopened_count || 0}</strong> bugs reopened
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>{results.total_bugs || 0}</strong> total bugs tested
                  </p>
                </div>
              </div>
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
      </div>
    </div>
  );
};

export default RegressionTesting;

