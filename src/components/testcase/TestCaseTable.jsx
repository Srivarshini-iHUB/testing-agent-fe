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
    <div className="space-y-6">
      
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-gray-700">Filter by Type:</span>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="Positive">Positive</option>
              <option value="Negative">Negative</option>
              <option value="Edge Case">Edge Case</option>
              <option value="Boundary">Boundary</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-gray-700">Filter by Priority:</span>
            <select 
              value={filterPriority} 
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          
          <div className="ml-auto">
            <span className="text-sm text-gray-600">
              Showing <span className="font-bold text-indigo-600">{filteredTestCases.length}</span> of <span className="font-bold">{testCases.length}</span> test cases
            </span>
          </div>
        </div>
      </div>
      
      {/* Test Cases Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">Generated Test Cases</h3>
          <p className="text-sm text-gray-600 mt-1">Click on any row to view detailed test case information</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Test ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Feature</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Test Scenario</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Automation</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTestCases.map((tc, idx) => (
                <tr 
                  key={idx} 
                  onClick={() => onSelectTestCase(tc)}
                  className="hover:bg-indigo-50 cursor-pointer transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-indigo-600">{tc.test_case_id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">{tc.feature_name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">{tc.test_scenario}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1.5 text-xs font-bold rounded-full
                      ${tc.test_type === 'Positive' ? 'bg-green-100 text-green-800' : ''}
                      ${tc.test_type === 'Negative' ? 'bg-red-100 text-red-800' : ''}
                      ${tc.test_type === 'Edge Case' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${tc.test_type === 'Boundary' ? 'bg-blue-100 text-blue-800' : ''}
                    `}>
                      {tc.test_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1.5 text-xs font-bold rounded-full
                      ${tc.priority === 'Critical' ? 'bg-red-100 text-red-800' : ''}
                      ${tc.priority === 'High' ? 'bg-orange-100 text-orange-800' : ''}
                      ${tc.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${tc.priority === 'Low' ? 'bg-gray-100 text-gray-800' : ''}
                    `}>
                      {tc.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1.5 text-xs font-bold rounded-full
                      ${tc.automation_status === 'Automated' ? 'bg-green-100 text-green-800' : ''}
                      ${tc.automation_status === 'Manual' ? 'bg-gray-100 text-gray-800' : ''}
                      ${tc.automation_status === 'To Be Automated' ? 'bg-blue-100 text-blue-800' : ''}
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
