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
    <div className="space-y-8 mb-8">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Total Features</p>
              <p className="text-4xl font-bold">{stats.features}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">User Stories</p>
              <p className="text-4xl font-bold">{stats.stories}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm font-medium mb-1">Features Mapped</p>
              <p className="text-4xl font-bold">{stats.mapped}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">Test Cases</p>
              <p className="text-4xl font-bold">{stats.testCases}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Test Type Distribution */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Test Coverage Distribution</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="text-3xl font-bold text-green-600 mb-2">{testStats.positive}</div>
            <div className="text-sm font-medium text-gray-700">Positive Tests</div>
            <div className="text-xs text-gray-500 mt-1">Happy Path</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
            <div className="text-3xl font-bold text-red-600 mb-2">{testStats.negative}</div>
            <div className="text-sm font-medium text-gray-700">Negative Tests</div>
            <div className="text-xs text-gray-500 mt-1">Error Handling</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <div className="text-3xl font-bold text-yellow-600 mb-2">{testStats.edgeCase}</div>
            <div className="text-sm font-medium text-gray-700">Edge Cases</div>
            <div className="text-xs text-gray-500 mt-1">Boundary Values</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="text-3xl font-bold text-blue-600 mb-2">{testStats.boundary}</div>
            <div className="text-sm font-medium text-gray-700">Boundary Tests</div>
            <div className="text-xs text-gray-500 mt-1">Limits</div>
          </div>
        </div>
      </div>
      
      {/* Priority Distribution */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Priority Breakdown</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Critical</span>
              <span className="text-lg font-bold text-red-600">{testStats.critical}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-red-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${stats.testCases > 0 ? (testStats.critical / stats.testCases) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">High</span>
              <span className="text-lg font-bold text-orange-600">{testStats.high}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${stats.testCases > 0 ? (testStats.high / stats.testCases) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Medium</span>
              <span className="text-lg font-bold text-yellow-600">{testStats.medium}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-yellow-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${stats.testCases > 0 ? (testStats.medium / stats.testCases) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Low</span>
              <span className="text-lg font-bold text-gray-600">{testStats.low}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gray-500 h-3 rounded-full transition-all duration-500"
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
