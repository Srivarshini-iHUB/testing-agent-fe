import React, { useState } from 'react';
import IntegrationHistory from './agentHistory/IntegrationHistory';

const AgentHistory = ({ currentProject }) => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);

  // Agent color configurations matching your agents
  const agentColors = {
    'test-case-generator': {
      bg: 'bg-indigo-100 dark:bg-indigo-900/30',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-500',
      bgLight: 'bg-indigo-50 dark:bg-indigo-900/20',
      hover: 'hover:border-indigo-300 dark:hover:border-indigo-700'
    },
    'unit-testing': {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500',
      bgLight: 'bg-blue-50 dark:bg-blue-900/20',
      hover: 'hover:border-blue-300 dark:hover:border-blue-700'
    },
    'e2e-testing': {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-500',
      bgLight: 'bg-purple-50 dark:bg-purple-900/20',
      hover: 'hover:border-purple-300 dark:hover:border-purple-700'
    },
    'security-testing': {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-600 dark:text-red-400',
      border: 'border-red-500',
      bgLight: 'bg-red-50 dark:bg-red-900/20',
      hover: 'hover:border-red-300 dark:hover:border-red-700'
    },
    'performance-testing': {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500',
      bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
      hover: 'hover:border-emerald-300 dark:hover:border-emerald-700'
    },
    'smoke-testing': {
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-500',
      bgLight: 'bg-orange-50 dark:bg-orange-900/20',
      hover: 'hover:border-orange-300 dark:hover:border-orange-700'
    }
  };

  // Agent test history data
  const projectAgentHistory = {
    'project-1': [
      {
        id: 'test-case-generator',
        name: 'Test Case Generation',
        icon: 'fa-file-alt',
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
            report: 'Functional checkout process testing with payment gateway integration. Found 3 critical issues in payment validation.'
          },
        ],
      },
      {
        id: 'unit-testing',
        name: 'Unit Testing',
        icon: 'fa-vial',
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
        name: 'Functional Testing',
        icon: 'fa-route',
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
        name: 'Integration Testing',
        icon: 'fa-route',
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
      {
        id: 'e2e-testing',
        name: 'Performance Testing',
        icon: 'fa-route',
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

  const agentsForProject = projectAgentHistory[currentProject?.id] || projectAgentHistory["project-2"];

  const handleAgentSelect = (agent) => {
    // Toggle agent selection
    if (selectedAgent?.id === agent.id) {
      console.log('[AgentHistory] Deselected agent:', agent?.name || agent?.id);
      setSelectedAgent(null);
      setSelectedTest(null);
    } else {
      console.log('[AgentHistory] Selected agent:', agent?.name || agent?.id);
      setSelectedAgent(agent);
      setSelectedTest(null);
    }
  };

  const handleTestSelect = (test) => {
    // Toggle test selection
    if (selectedTest?.id === test.id) {
      setSelectedTest(null);
    } else {
      setSelectedTest(test);
    }
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

  const getAgentColors = (agentId) => {
    return agentColors[agentId] || agentColors['test-case-generator'];
  };

  return (
    <div>
      {/* Header with Clear All */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Agent Test History
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            View test results for <span className="font-semibold text-indigo-600 dark:text-indigo-400">{currentProject?.name}</span>
          </p>
        </div>
        
        {(selectedAgent || selectedTest) && (
          <button
            onClick={() => {
              setSelectedAgent(null);
              setSelectedTest(null);
            }}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
          >
            <i className="fas fa-times"></i>
            Clear Selection
          </button>
        )}
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
            {agentsForProject.map((agent) => {
              const colors = getAgentColors(agent.id);
              const isSelected = selectedAgent?.id === agent.id;
              
              return (
                <button
                  key={agent.id}
                  onClick={() => handleAgentSelect(agent)}
                  className={`text-left p-5 rounded-xl border-2 transition-all hover:shadow-lg ${
                    isSelected
                      ? `${colors.border} ${colors.bgLight} shadow-md`
                      : `border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${colors.hover}`
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
                      <i className={`fas ${agent.icon} ${colors.text} text-xl`}></i>
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
                    <i className={`fas fa-chevron-${isSelected ? 'up' : 'right'} ${colors.text}`}></i>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Test History List */}
          {selectedAgent && (
            <div className="mb-8 animate-fadeIn">

              {selectedAgent?.name?.toLowerCase().includes('integration') && (
                <div className="mb-6">
                  {(() => {
                    try {
                      const proj = JSON.parse(localStorage.getItem('project') || 'null');
                      const projectId = proj?.id;
                      return projectId ? (
                        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <h4 className="font-semibold text-gray-900 dark:text-white">Integration Testing - Project Runs</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Project ID: {projectId}</p>
                          </div>
                          <div className="bg-white dark:bg-gray-800">
                            <IntegrationHistory projectId={projectId} />
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                          No project selected in localStorage under key "project".
                        </div>
                      );
                    } catch (e) {
                      return (
                        <div className="p-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                          Failed to read project from localStorage.
                        </div>
                      );
                    }
                  })()}
                </div>
              )}

             
            </div>
          )}

        
        </>
      )}
    </div>
  );
};

export default AgentHistory;
