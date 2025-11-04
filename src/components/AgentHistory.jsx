import React, { useState, useEffect } from 'react';
import IntegrationHistory from './agentHistory/IntegrationHistory';
import PerformanceHistory from './agentHistory/PerformanceHistory';
import TestCaseHistory from './agentHistory/TestCaseHistory';
import E2EHistory from './agentHistory/E2EHistory';
import RegressionHistory from './agentHistory/RegressionHistory';
import SmokeHistory from './agentHistory/SmokeHistory';
import { integrationApi } from '../api/integrationApi';
import { testCaseApi } from '../api/testCaseApi';
import { e2eApi } from '../api/e2eApi';
import { regressionApi } from '../api/regressionApi';
import { smokeApi } from '../api/smokeApi';
import { performanceApi } from '../api/performanceApi';
import { projectApi } from '../api/projectApi';

const AgentHistory = ({ currentProject }) => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [agentsForProject, setAgentsForProject] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  // Fetch agents dynamically based on test status
  useEffect(() => {
    let mounted = true;
    const fetchAgents = async () => {
      setLoading(true);
      setError('');

      try {
        // Get project ID from localStorage
        const proj = JSON.parse(localStorage.getItem('project') || 'null');
        const projectId = proj?.id;

        if (!projectId) {
          if (mounted) {
            setAgentsForProject([]);
            setLoading(false);
          }
          return;
        }

        // Get the test status to see which agents have been run
        const testStatusData = await projectApi.getProjectTestStatus(projectId);
        const testStatuses = testStatusData?.test_statuses || [];

        // Filter only agents that have been run (runned: true)
        const runnedAgents = testStatuses.filter(status => status.runned === true);

        const agents = [];

        // Map test_type to agent configurations
        const agentConfigMap = {
          'integration': {
            id: 'integration-testing',
            name: 'Integration Testing',
            icon: 'fa-route'
          },
          'testcase_generator': {
            id: 'test-case-generator',
            name: 'Test Case Generation',
            icon: 'fa-file-alt'
          },
          'e2e': {
            id: 'e2e-testing',
            name: 'Functional Testing',
            icon: 'fa-check-circle'
          },
          'regression': {
            id: 'regression-testing',
            name: 'Regression Testing',
            icon: 'fa-undo'
          },
          'smoke': {
            id: 'smoke-testing',
            name: 'Smoke Testing',
            icon: 'fa-fire'
          },
          'performance': {
            id: 'performance-testing',
            name: 'Performance Testing',
            icon: 'fa-tachometer-alt'
          }
        };

        // Process each runned agent
        for (const status of runnedAgents) {
          const config = agentConfigMap[status.test_type];
          if (config) {
            const lastRun = status.last_run_date
              ? new Date(status.last_run_date).toISOString().split('T')[0]
              : 'N/A';

            agents.push({
              id: config.id,
              name: config.name,
              icon: config.icon,
              lastRun: lastRun,
            });
          }
        }

        if (mounted) {
          setAgentsForProject(agents);
          setLoading(false);
        }
      } catch (e) {
        if (mounted) {
          setError(e?.message || 'Failed to load agent history');
          setLoading(false);
        }
      }
    };

    fetchAgents();

    return () => {
      mounted = false;
    };
  }, [currentProject?.id]);

  // Agent API configurations for on-click fetching
  const agentApiConfig = {
    'integration-testing': {
      api: integrationApi.getProjectTestRuns,
      dataProcessor: (data) => ({
        totalTests: data.total_test_runs || data.test_runs.length,
        lastRun: data.test_runs[0]?.created_at
          ? new Date(data.test_runs[0].created_at).toISOString().split('T')[0]
          : 'N/A'
      })
    },
    'test-case-generator': {
      api: testCaseApi.getProjectTestCaseGenerations,
      dataProcessor: (data) => ({
        totalTests: data.length,
        lastRun: data[0]?.created_at
          ? new Date(data[0].created_at).toISOString().split('T')[0]
          : 'N/A'
      })
    },
    'e2e-testing': {
      api: e2eApi.getProjectE2EReports,
      dataProcessor: (data) => ({
        totalTests: data.reports.length,
        lastRun: data.reports[0]?.created_at
          ? new Date(data.reports[0].created_at).toISOString().split('T')[0]
          : 'N/A'
      })
    },
    'regression-testing': {
      api: regressionApi.getProjectRegressionTests,
      dataProcessor: (data) => ({
        totalTests: data.regression_test.regression_runs.length,
        lastRun: data.regression_test.regression_runs[0]?.created_at
          ? new Date(data.regression_test.regression_runs[0].created_at).toISOString().split('T')[0]
          : 'N/A'
      })
    },
    'smoke-testing': {
      api: smokeApi.getProjectSmokeTests,
      dataProcessor: (data) => ({
        totalTests: data.length,
        lastRun: data[0]?.created_at
          ? new Date(data[0].created_at).toISOString().split('T')[0]
          : 'N/A'
      })
    },
    'performance-testing': {
      api: performanceApi.getProjectTestRuns,
      dataProcessor: (data) => {
        const totalRuns = data.items.reduce((sum, item) => sum + (item.runs?.length || 0), 0);
        let latestTimestamp = null;
        data.items.forEach(item => {
          if (item.runs && item.runs.length > 0) {
            item.runs.forEach(run => {
              if (run.timestamp && (!latestTimestamp || new Date(run.timestamp) > new Date(latestTimestamp))) {
                latestTimestamp = run.timestamp;
              }
            });
          }
        });
        return {
          totalTests: totalRuns,
          lastRun: latestTimestamp
            ? new Date(latestTimestamp).toISOString().split('T')[0]
            : 'N/A'
        };
      }
    }
  };

  // Map agent IDs/names to their routes
  const getAgentRoute = (agent) => {
    const routeMap = {
      'integration-testing': '/integration-testing',
      'test-case-generator': '/test-case-generator',
      'e2e-testing': '/e2e-testing',
      'regression-testing': '/regression-testing',
      'smoke-testing': '/smoke-testing',
      'performance-testing': '/performance-testing',
    };

    // Check by ID first
    if (routeMap[agent.id]) {
      return routeMap[agent.id];
    }
  };

  const handleAgentSelect = async (agent) => {
    const route = getAgentRoute(agent);
    if (route) {
      try {
        // Get project ID
        const proj = JSON.parse(localStorage.getItem('project') || 'null');
        const projectId = proj?.id;

        if (!projectId) {
          console.warn('[AgentHistory] No project ID found');
          navigate(route);
          return;
        }

        // Fetch specific agent data on click
        const config = agentApiConfig[agent.id];
        if (config) {
          const data = await config.api(projectId);
          const processedData = config.dataProcessor(data);

          console.log('[AgentHistory] Fetched data for', agent.name, ':', processedData);

          // Navigate with processed data in state
          if (route === '/test-case-generator') {
            navigate('/test-case-generator#history', { 
              state: { agentData: { ...agent, ...processedData } } 
            });
          } else {
            navigate(route, { 
              state: { agentData: { ...agent, ...processedData } } 
            });
          }
        } else {
          // Fallback navigation without data
          console.warn('[AgentHistory] No API config for agent:', agent.id);
          navigate(route);
        }
      } catch (e) {
        console.error('[AgentHistory] Failed to fetch agent data:', e);
        // Still navigate even on error
        if (route === '/test-case-generator') {
          navigate('/test-case-generator#history');
        } else {
          navigate(route);
        }
      }
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

      {loading ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
          <i className="fas fa-spinner fa-spin text-4xl text-gray-400 dark:text-gray-600 mb-4"></i>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium mb-2">Loading agent history...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-300 dark:border-red-700">
          <i className="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
          <p className="text-red-600 dark:text-red-400 text-lg font-medium mb-2">Error loading agent history</p>
          <p className="text-red-500 dark:text-red-500 text-sm">{error}</p>
        </div>
      ) : agentsForProject.length === 0 ? (
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
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
                      <i className={`fas ${agent.icon} ${colors.text} text-xl`}></i>
                    </div>
                    <div className="flex-1 min-w-0 ">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
                        {agent.name}
                      </h3>
                      
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

              {(selectedAgent?.id === 'test-case-generator' || selectedAgent?.name?.toLowerCase().includes('test case') || selectedAgent?.name?.toLowerCase().includes('performance')) && (
                <div className="mb-6">
                  {(() => {
                    try {
                      const proj = JSON.parse(localStorage.getItem('project') || 'null');
                      const projectId = proj?.id;
                      return projectId ? (
                        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <h4 className="font-semibold text-gray-900 dark:text-white">Performance Testing - Project Runs</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Project ID: {projectId}</p>
                          </div>
                          <div className="bg-white dark:bg-gray-800">
                            <PerformanceHistory />
                            <h4 className="font-semibold text-gray-900 dark:text-white">Test Case Generation - History</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Project ID: {projectId}</p>
                          </div>
                          <div className="bg-white dark:bg-gray-800">
                            <TestCaseHistory projectId={projectId} />
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

              {(selectedAgent?.id === 'e2e-testing' || selectedAgent?.name?.toLowerCase().includes('functional')) && (
                <div className="mb-6">
                  {(() => {
                    try {
                      const proj = JSON.parse(localStorage.getItem('project') || 'null');
                      const projectId = proj?.id;
                      return projectId ? (
                        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <h4 className="font-semibold text-gray-900 dark:text-white">Functional Testing - History</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Project ID: {projectId}</p>
                          </div>
                          <div className="bg-white dark:bg-gray-800">
                            <E2EHistory projectId={projectId} />
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

              {(selectedAgent?.id === 'regression-testing' || selectedAgent?.name?.toLowerCase().includes('regression')) && (
                <div className="mb-6">
                  {(() => {
                    try {
                      const proj = JSON.parse(localStorage.getItem('project') || 'null');
                      const projectId = proj?.id;
                      return projectId ? (
                        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <h4 className="font-semibold text-gray-900 dark:text-white">Regression Testing - History</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Project ID: {projectId}</p>
                          </div>
                          <div className="bg-white dark:bg-gray-800">
                            <RegressionHistory projectId={projectId} />
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

              {(selectedAgent?.id === 'smoke-testing' || selectedAgent?.name?.toLowerCase().includes('smoke')) && (
                <div className="mb-6">
                  {(() => {
                    try {
                      const proj = JSON.parse(localStorage.getItem('project') || 'null');
                      const projectId = proj?.id;
                      return projectId ? (
                        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <h4 className="font-semibold text-gray-900 dark:text-white">Smoke Testing - History</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Project ID: {projectId}</p>
                          </div>
                          <div className="bg-white dark:bg-gray-800">
                            <SmokeHistory projectId={projectId} />
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