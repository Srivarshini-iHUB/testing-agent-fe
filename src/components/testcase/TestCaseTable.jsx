import React, { useState } from 'react';

const TestCaseTable = ({ testCases, onSelectTestCase }) => {
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  
  const filteredTestCases = testCases.filter(tc => {
    const typeMatch = filterType === 'all' || tc.test_type === filterType;
    const priorityMatch = filterPriority === 'all' || tc.priority === filterPriority;
    return typeMatch && priorityMatch;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-xl shadow-lg p-5 border border-gray-200 dark:border-gray-700/50">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filter by Type:</span>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="Positive">Positive</option>
              <option value="Negative">Negative</option>
              <option value="Edge Case">Edge Case</option>
              <option value="Boundary">Boundary</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filter by Priority:</span>
            <select 
              value={filterPriority} 
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          
          <div className="ml-auto">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-bold text-indigo-600 dark:text-indigo-400">{filteredTestCases.length}</span> of <span className="font-bold">{testCases.length}</span> test cases
            </span>
          </div>
        </div>
      </div>

      {/* Test Cases Table */}
      <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700/50">
        <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/60 dark:to-gray-900/60 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Generated Test Cases</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Click on any row to view detailed test case information</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Test ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Feature</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Test Scenario</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Automation</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800/20 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTestCases.map((tc, idx) => (
                <tr 
                  key={idx} 
                  onClick={() => onSelectTestCase(tc)}
                  className="hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{tc.test_case_id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{tc.feature_name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{tc.test_scenario}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1.5 text-xs font-bold rounded-full
                      ${tc.test_type === 'Positive' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : ''}
                      ${tc.test_type === 'Negative' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' : ''}
                      ${tc.test_type === 'Edge Case' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' : ''}
                      ${tc.test_type === 'Boundary' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' : ''}
                    `}>
                      {tc.test_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1.5 text-xs font-bold rounded-full
                      ${tc.priority === 'Critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' : ''}
                      ${tc.priority === 'High' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' : ''}
                      ${tc.priority === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' : ''}
                      ${tc.priority === 'Low' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300' : ''}
                    `}>
                      {tc.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1.5 text-xs font-bold rounded-full
                      ${tc.automation_status === 'Automated' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : ''}
                      ${tc.automation_status === 'Manual' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300' : ''}
                      ${tc.automation_status === 'To Be Automated' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' : ''}
                    `}>
                      {tc.automation_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TestCaseTable;
