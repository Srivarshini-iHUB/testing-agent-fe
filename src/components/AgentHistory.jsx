import React, { useState } from 'react';

const AgentHistory = ({ currentProject }) => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);

  // Agent test history for current project (this should come from API/context)
  const projectAgentHistory = {
    'project-1': [
      {
        id: 'test-case-generator',
        name: 'Test Case Generation',
        icon: 'fa-file-alt',
        color: 'indigo',
        totalTests: 12,
        lastRun: '2025-10-24',
        tests: [
          { 
            id: 't1', 
            name: 'Login Page Tests', 
            date: '2025-10-24',
            time: '10:30 AM',
            status: 'passed',
            coverage: '95%',
            duration: '2m 15s',
            report: 'Comprehensive test cases for login functionality including edge cases, security checks, and validation scenarios. All 24 test cases passed successfully.'
          },
          { 
            id: 't2', 
            name: 'Cart Functionality', 
            date: '2025-10-23',
            time: '03:45 PM',
            status: 'passed',
            coverage: '88%',
            duration: '3m 45s',
            report: 'Test cases covering add to cart, remove from cart, cart persistence, and checkout scenarios. 18 out of 20 test cases passed.'
          },
          { 
            id: 't3', 
            name: 'Checkout Flow', 
            date: '2025-10-22',
            time: '11:20 AM',
            status: 'failed',
            coverage: '76%',
            duration: '4m 10s',
            report: 'End-to-end checkout process testing with payment gateway integration. Found 3 critical issues in payment validation.'
          },
        ],
      },
      {
        id: 'unit-testing',
        name: 'Unit Testing',
        icon: 'fa-vial',
        color: 'blue',
        totalTests: 8,
        lastRun: '2025-10-23',
        tests: [
          { 
            id: 't4', 
            name: 'Product Component', 
            date: '2025-10-23',
            time: '02:15 PM',
            status: 'passed',
            coverage: '92%',
            duration: '1m 30s',
            report: 'Unit test results for product display component with 92% code coverage. All component methods tested successfully.'
          },
          { 
            id: 't5', 
            name: 'Search Function', 
            date: '2025-10-22',
            time: '09:00 AM',
            status: 'passed',
            coverage: '87%',
            duration: '2m 05s',
            report: 'Search functionality validation with various input scenarios including edge cases and special characters.'
          },
        ],
      },
      {
        id: 'e2e-testing',
        name: 'End-to-End Testing',
        icon: 'fa-route',
        color: 'purple',
        totalTests: 6,
        lastRun: '2025-10-21',
        tests: [
          { 
            id: 't6', 
            name: 'User Registration Flow', 
            date: '2025-10-21',
            time: '04:30 PM',
            status: 'passed',
            coverage: '100%',
            duration: '5m 20s',
            report: 'Complete user registration flow tested from landing page to email confirmation. All steps validated successfully.'
          },
        ],
      },
    ],
    'project-2': [
      {
        id: 'e2e-testing',
        name: 'End-to-End Testing',
        icon: 'fa-route',
        color: 'purple',
        totalTests: 5,
        lastRun: '2025-10-24',
        tests: [
          { 
            id: 't7', 
            name: 'Feed Loading', 
            date: '2025-10-24',
            time: '11:00 AM',
            status: 'passed',
            coverage: '94%',
            duration: '3m 40s',
            report: 'E2E test for feed loading performance and data accuracy. Average load time: 1.2s.'
          },
        ],
      },
    ],
    'project-3': [
      {
        id: 'security-testing',
        name: 'Security Testing',
        icon: 'fa-shield-alt',
        color: 'red',
        totalTests: 10,
        lastRun: '2025-10-24',
        tests: [
          { 
            id: 't8', 
            name: 'Authentication Security', 
            date: '2025-10-24',
            time: '09:15 AM',
            status: 'warning',
            coverage: '85%',
            duration: '6m 30s',
            report: 'Security vulnerability scan for authentication mechanisms. Found 2 medium-severity issues requiring attention.'
          },
        ],
      },
    ],
  };

  const agentsForProject = projectAgentHistory[currentProject.id] || [];

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
    setSelectedTest(null);
  };

  const handleTestSelect = (test) => {
    setSelectedTest(test);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'passed': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'failed': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      case 'warning': return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'passed': return 'fa-check-circle';
      case 'failed': return 'fa-times-circle';
      case 'warning': return 'fa-exclamation-triangle';
      default: return 'fa-circle';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Agent Test History
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          View test results for <span className="font-semibold text-indigo-600 dark:text-indigo-400">{currentProject.name}</span>
        </p>
      </div>

      {agentsForProject.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
          <i className="fas fa-robot text-6xl text-gray-400 dark:text-gray-600 mb-4"></i>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium mb-2">No agents used yet</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            Run tests on this project to see agent history
          </p>
        </div>
      ) : (
        <>
          {/* Agents Used Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {agentsForProject.map((agent) => (
              <button
                key={agent.id}
                onClick={() => handleAgentSelect(agent)}
                className={`text-left p-5 rounded-xl border-2 transition-all hover:shadow-lg ${
                  selectedAgent?.id === agent.id
                    ? `border-${agent.color}-500 bg-${agent.color}-50 dark:bg-${agent.color}-900/20 shadow-md`
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-12 h-12 bg-${agent.color}-100 dark:bg-${agent.color}-900/30 rounded-xl flex items-center justify-center`}>
                    <i className={`fas ${agent.icon} text-${agent.color}-600 dark:text-${agent.color}-400 text-xl`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
                      {agent.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {agent.totalTests} test run{agent.totalTests !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <i className="fas fa-clock"></i>
                    Last: {agent.lastRun}
                  </span>
                  {selectedAgent?.id === agent.id && (
                    <i className="fas fa-chevron-right text-indigo-600 dark:text-indigo-400"></i>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Test History List */}
          {selectedAgent && (
            <div className="mb-8 animate-fadeIn">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 bg-${selectedAgent.color}-100 dark:bg-${selectedAgent.color}-900/30 rounded-lg flex items-center justify-center`}>
                  <i className={`fas ${selectedAgent.icon} text-${selectedAgent.color}-600 dark:text-${selectedAgent.color}-400`}></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedAgent.name} - Test History
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedAgent.tests.length} test execution{selectedAgent.tests.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {selectedAgent.tests.map((test) => (
                  <button
                    key={test.id}
                    onClick={() => handleTestSelect(test)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedTest?.id === test.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {test.name}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(test.status)}`}>
                            <i className={`fas ${getStatusIcon(test.status)}`}></i>
                            {test.status}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <i className="fas fa-calendar-alt"></i>
                            {test.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <i className="fas fa-clock"></i>
                            {test.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <i className="fas fa-hourglass-half"></i>
                            {test.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <i className="fas fa-chart-pie"></i>
                            Coverage: {test.coverage}
                          </span>
                        </div>
                      </div>
                      
                      {selectedTest?.id === test.id && (
                        <i className="fas fa-chevron-down text-indigo-600 dark:text-indigo-400 text-lg"></i>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Test Report */}
          {selectedTest && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fadeIn">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 p-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      Test Report: {selectedTest.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Executed on {selectedTest.date} at {selectedTest.time}
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2">
                    <i className="fas fa-download"></i>
                    Download
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {/* Test Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Status</p>
                    <p className={`text-lg font-bold ${getStatusColor(selectedTest.status)}`}>
                      {selectedTest.status.toUpperCase()}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Duration</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedTest.duration}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Coverage</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedTest.coverage}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Agent</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{selectedAgent.name}</p>
                  </div>
                </div>

                {/* Report Details */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <i className="fas fa-file-alt text-indigo-600 dark:text-indigo-400"></i>
                    Detailed Report
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {selectedTest.report}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AgentHistory;
