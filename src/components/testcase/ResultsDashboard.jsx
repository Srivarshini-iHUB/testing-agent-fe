import React from 'react';

const ResultsDashboard = ({ result }) => {
  const stats = {
    features: result.extraction?.total_features || 0,
    stories: result.extraction?.total_stories || 0,
    mapped: result.analysis?.total_features_mapped || 0,
    testCases: result.test_cases?.total_test_cases || 0,
  };

  const testCases = result.test_cases?.test_cases || [];
  const testStats = {
    positive: testCases.filter(tc => tc.test_type === 'Positive').length,
    negative: testCases.filter(tc => tc.test_type === 'Negative').length,
    edgeCase: testCases.filter(tc => tc.test_type === 'Edge Case').length,
    boundary: testCases.filter(tc => tc.test_type === 'Boundary').length,
    critical: testCases.filter(tc => tc.priority === 'Critical').length,
    high: testCases.filter(tc => tc.priority === 'High').length,
    medium: testCases.filter(tc => tc.priority === 'Medium').length,
    low: testCases.filter(tc => tc.priority === 'Low').length,
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
            <i className="fas fa-check-circle text-3xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">Test Cases Generated Successfully!</h2>
            <p className="text-white/90">Your comprehensive test suite is ready for review and export</p>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-5 shadow-lg border-l-4 border-blue-500 dark:border-blue-400 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <i className="fas fa-layer-group text-xl text-blue-600 dark:text-blue-400"></i>
            </div>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.features}</span>
          </div>
          <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Features</h3>
        </div>

        <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-5 shadow-lg border-l-4 border-purple-500 dark:border-purple-400 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <i className="fas fa-book text-xl text-purple-600 dark:text-purple-400"></i>
            </div>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.stories}</span>
          </div>
          <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">User Stories</h3>
        </div>

        <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-5 shadow-lg border-l-4 border-pink-500 dark:border-pink-400 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
              <i className="fas fa-link text-xl text-pink-600 dark:text-pink-400"></i>
            </div>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.mapped}</span>
          </div>
          <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Features Mapped</h3>
        </div>

        <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-5 shadow-lg border-l-4 border-emerald-500 dark:border-emerald-400 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <i className="fas fa-check-double text-xl text-emerald-600 dark:text-emerald-400"></i>
            </div>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.testCases}</span>
          </div>
          <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Test Cases</h3>
        </div>
      </div>

      {/* Test Type Distribution */}
      <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700/50">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
          <i className="fas fa-chart-pie text-indigo-600 dark:text-indigo-400"></i>
          Test Coverage Distribution
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border-2 border-emerald-200 dark:border-emerald-800">
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">{testStats.positive}</div>
            <div className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Positive Tests</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Happy Path</div>
          </div>
          <div className="text-center p-5 bg-rose-50 dark:bg-rose-900/20 rounded-xl border-2 border-rose-200 dark:border-rose-800">
            <div className="text-3xl font-bold text-rose-600 dark:text-rose-400 mb-2">{testStats.negative}</div>
            <div className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Negative Tests</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Error Handling</div>
          </div>
          <div className="text-center p-5 bg-amber-50 dark:bg-amber-900/20 rounded-xl border-2 border-amber-200 dark:border-amber-800">
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">{testStats.edgeCase}</div>
            <div className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Edge Cases</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Boundary Values</div>
          </div>
          <div className="text-center p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{testStats.boundary}</div>
            <div className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Boundary Tests</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Limits</div>
          </div>
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700/50">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
          <i className="fas fa-flag text-indigo-600 dark:text-indigo-400"></i>
          Priority Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Critical</span>
              <span className="text-lg font-bold text-rose-600 dark:text-rose-400">{testStats.critical}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-rose-500 to-red-600 h-2.5 rounded-full transition-all duration-1000"
                style={{ width: `${stats.testCases > 0 ? (testStats.critical / stats.testCases) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">High</span>
              <span className="text-lg font-bold text-orange-600 dark:text-orange-400">{testStats.high}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-orange-500 to-amber-600 h-2.5 rounded-full transition-all duration-1000"
                style={{ width: `${stats.testCases > 0 ? (testStats.high / stats.testCases) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Medium</span>
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{testStats.medium}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-yellow-500 h-2.5 rounded-full transition-all duration-1000"
                style={{ width: `${stats.testCases > 0 ? (testStats.medium / stats.testCases) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Low</span>
              <span className="text-lg font-bold text-gray-600 dark:text-gray-400">{testStats.low}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-gray-400 to-gray-500 h-2.5 rounded-full transition-all duration-1000"
                style={{ width: `${stats.testCases > 0 ? (testStats.low / stats.testCases) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
