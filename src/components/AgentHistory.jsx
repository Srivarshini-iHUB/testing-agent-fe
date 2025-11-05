import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { integrationApi } from '../api/integrationApi';
import { testCaseApi } from '../api/testCaseApi';
import { e2eApi } from '../api/e2eApi';
import { regressionApi } from '../api/regressionApi';
import { smokeApi } from '../api/smokeApi';
import { performanceApi } from '../api/performanceApi';
import { projectApi } from '../api/projectApi';

const AgentHistory = ({ currentProject }) => {
  const navigate = useNavigate();
  const [agentsForProject, setAgentsForProject] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Agent color configurations matching Dashboard.jsx style
  const agentColors = {
    'test-case-generator': {
      bg: 'bg-indigo-100 dark:bg-indigo-900/30',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-500',
      bgLight: 'bg-indigo-50 dark:bg-indigo-900/20',
      hover: 'hover:border-indigo-300 dark:hover:border-indigo-700',
      iconBg: 'bg-gradient-to-br from-indigo-200 to-purple-200 dark:from-indigo-700 dark:to-purple-700',
      iconColor: 'text-indigo-700 dark:text-indigo-300'
    },
    'unit-testing': {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500',
      bgLight: 'bg-blue-50 dark:bg-blue-900/20',
      hover: 'hover:border-blue-300 dark:hover:border-blue-700',
      iconBg: 'bg-gradient-to-br from-blue-200 to-cyan-200 dark:from-blue-700 dark:to-cyan-700',
      iconColor: 'text-blue-700 dark:text-blue-300'
    },
    'e2e-testing': {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-500',
      bgLight: 'bg-purple-50 dark:bg-purple-900/20',
      hover: 'hover:border-purple-300 dark:hover:border-purple-700',
      iconBg: 'bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-700 dark:to-pink-700',
      iconColor: 'text-purple-700 dark:text-purple-300'
    },
    'integration-testing': {
      bg: 'bg-teal-100 dark:bg-teal-900/30',
      text: 'text-teal-600 dark:text-teal-400',
      border: 'border-teal-500',
      bgLight: 'bg-teal-50 dark:bg-teal-900/20',
      hover: 'hover:border-teal-300 dark:hover:border-teal-700',
      iconBg: 'bg-gradient-to-br from-teal-200 to-emerald-200 dark:from-teal-700 dark:to-emerald-700',
      iconColor: 'text-teal-700 dark:text-teal-300'
    },
    'security-testing': {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-600 dark:text-red-400',
      border: 'border-red-500',
      bgLight: 'bg-red-50 dark:bg-red-900/20',
      hover: 'hover:border-red-300 dark:hover:border-red-700',
      iconBg: 'bg-gradient-to-br from-red-200 to-rose-200 dark:from-red-700 dark:to-rose-700',
      iconColor: 'text-red-700 dark:text-red-300'
    },
    'performance-testing': {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500',
      bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
      hover: 'hover:border-emerald-300 dark:hover:border-emerald-700',
      iconBg: 'bg-gradient-to-br from-emerald-200 to-green-200 dark:from-emerald-700 dark:to-green-700',
      iconColor: 'text-emerald-700 dark:text-emerald-300'
    },
    'regression-testing': {
      bg: 'bg-cyan-100 dark:bg-cyan-900/30',
      text: 'text-cyan-600 dark:text-cyan-400',
      border: 'border-cyan-500',
      bgLight: 'bg-cyan-50 dark:bg-cyan-900/20',
      hover: 'hover:border-cyan-300 dark:hover:border-cyan-700',
      iconBg: 'bg-gradient-to-br from-slate-200 to-gray-200 dark:from-slate-700 dark:to-gray-700',
      iconColor: 'text-slate-700 dark:text-slate-300'
    },
    'smoke-testing': {
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-500',
      bgLight: 'bg-orange-50 dark:bg-orange-900/20',
      hover: 'hover:border-orange-300 dark:hover:border-orange-700',
      iconBg: 'bg-gradient-to-br from-orange-200 to-amber-200 dark:from-orange-700 dark:to-amber-700',
      iconColor: 'text-orange-700 dark:text-orange-300'
    },
    'visual-testing': {
      bg: 'bg-violet-100 dark:bg-violet-900/30',
      text: 'text-violet-600 dark:text-violet-400',
      border: 'border-violet-500',
      bgLight: 'bg-violet-50 dark:bg-violet-900/20',
      hover: 'hover:border-violet-300 dark:hover:border-violet-700',
      iconBg: 'bg-gradient-to-br from-violet-200 to-fuchsia-200 dark:from-violet-700 dark:to-fuchsia-700',
      iconColor: 'text-violet-700 dark:text-violet-300'
    }
  };

  // Fetch agents dynamically based on test status
  useEffect(() => {
    let mounted = true;
    const fetchAgents = async () => {
      // Immediately clear previous data and show loading when project changes
      setAgentsForProject([]);
      setLoading(true);
      setError('');

      try {
        // Use currentProject prop directly instead of reading from localStorage
        const projectId = currentProject?.id;

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

        // Map test_type to agent configurations (icons match Dashboard.jsx)
        const agentConfigMap = {
          'integration': {
            id: 'integration-testing',
            name: 'Integration Testing',
            icon: 'fa-link'
          },
          'testcase_generator': {
            id: 'test-case-generator',
            name: 'Test Case Generation',
            icon: 'fa-file-alt'
          },
          'e2e': {
            id: 'e2e-testing',
            name: 'Functional Testing',
            icon: 'fa-route'
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
          },
          'unit': {
            id: 'unit-testing',
            name: 'Unit Testing',
            icon: 'fa-vial'
          },
          'security': {
            id: 'security-testing',
            name: 'Security Testing',
            icon: 'fa-shield-alt'
          },
          'visual': {
            id: 'visual-testing',
            name: 'UI Testing',
            icon: 'fa-mouse-pointer'
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
      'unit-testing': '/unit-testing',
      'security-testing': '/security-testing',
      'visual-testing': '/visual-testing',
    };

    // Check by ID first
    if (routeMap[agent.id]) {
      return routeMap[agent.id];
    }

    // Fallback: check by name (case-insensitive)
    const nameLower = agent.name?.toLowerCase() || '';
    if (nameLower.includes('integration')) return '/integration-testing';
    if (nameLower.includes('test case') || nameLower.includes('test-case')) return '/test-case-generator';
    if (nameLower.includes('functional') || nameLower.includes('e2e')) return '/e2e-testing';
    if (nameLower.includes('regression')) return '/regression-testing';
    if (nameLower.includes('smoke')) return '/smoke-testing';
    if (nameLower.includes('performance')) return '/performance-testing';
    if (nameLower.includes('unit')) return '/unit-testing';
    if (nameLower.includes('security')) return '/security-testing';
    if (nameLower.includes('visual') || nameLower.includes('ui')) return '/visual-testing';

    return null;
  };

  const handleAgentSelect = async (agent) => {
    const route = getAgentRoute(agent);
    if (!route) {
      console.warn('[AgentHistory] No route found for agent:', agent);
      return;
    }

    try {
      // Use currentProject prop directly instead of reading from localStorage
      const projectId = currentProject?.id;

      // List of routes that support #history hash
      const historyRoutes = [
        '/test-case-generator',
        '/integration-testing',
        '/e2e-testing',
        '/performance-testing',
        '/regression-testing',
        '/smoke-testing',
        '/unit-testing',
        '/security-testing',
        '/visual-testing'
      ];

      // Check if route supports history tab
      const supportsHistory = historyRoutes.includes(route);
      const targetRoute = supportsHistory ? `${route}#history` : route;

      if (!projectId) {
        console.warn('[AgentHistory] No project ID found');
        navigate(targetRoute);
        return;
      }

      // Fetch specific agent data on click
      const config = agentApiConfig[agent.id];
      if (config) {
        try {
          const data = await config.api(projectId);
          const processedData = config.dataProcessor(data);
          console.log('[AgentHistory] Fetched data for', agent.name, ':', processedData);
          navigate(targetRoute, { 
            state: { agentData: { ...agent, ...processedData } } 
          });
        } catch (apiError) {
          console.error('[AgentHistory] Failed to fetch agent data:', apiError);
          // Still navigate even on API error
          navigate(targetRoute);
        }
      } else {
        // Fallback navigation without data
        console.warn('[AgentHistory] No API config for agent:', agent.id);
        navigate(targetRoute);
      }
    } catch (e) {
      console.error('[AgentHistory] Error in handleAgentSelect:', e);
      // Navigate to route with history hash if supported
      const historyRoutes = [
        '/test-case-generator',
        '/integration-testing',
        '/e2e-testing',
        '/performance-testing',
        '/regression-testing',
        '/smoke-testing',
        '/unit-testing',
        '/security-testing',
        '/visual-testing'
      ];
      const supportsHistory = historyRoutes.includes(route);
      navigate(supportsHistory ? `${route}#history` : route);
    }
  };

  const getAgentColors = (agentId) => {
    return agentColors[agentId] || agentColors['test-case-generator'];
  };

  // Placeholder function for downloading overall report
  const handleDownloadOverallReport = () => {
    // TODO: Implement the download overall report functionality
    console.log('Download Overall Report clicked');
    alert('Download Overall Report functionality will be implemented soon');
  };

  return (
    <div>
      {/* Header with Download Overall Report Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Agent Test History
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            View test results for <span className="font-semibold text-indigo-600 dark:text-indigo-400">{currentProject?.name}</span>
          </p>
        </div>
        
        {/* Download Overall Report Button */}
        {agentsForProject.length > 0 && !loading && (
          <button
            onClick={handleDownloadOverallReport}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            <i className="fas fa-download"></i>
            <span>Download All Reports</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 shadow-sm">
          <i className="fas fa-spinner fa-spin text-4xl text-indigo-400 dark:text-gray-600 mb-4"></i>
          <p className="text-gray-700 dark:text-gray-400 text-lg font-medium mb-2">Loading agent history...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-700 shadow-sm">
          <i className="fas fa-exclamation-triangle text-4xl text-red-500 dark:text-red-400 mb-4"></i>
          <p className="text-red-700 dark:text-red-400 text-lg font-medium mb-2">Error loading agent history</p>
          <p className="text-red-600 dark:text-red-500 text-sm">{error}</p>
        </div>
      ) : agentsForProject.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 shadow-sm">
          <i className="fas fa-robot text-6xl text-indigo-300 dark:text-gray-600 mb-4"></i>
          <p className="text-gray-700 dark:text-gray-400 text-lg font-medium mb-2">No agents used yet</p>
          <p className="text-gray-600 dark:text-gray-500 text-sm">
            Run tests on this project to see agent history
          </p>
        </div>
      ) : (
        <>
          {/* Agents Used Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {agentsForProject.map((agent) => {
              const colors = getAgentColors(agent.id);
              
              return (
                <button
                  key={agent.id}
                  onClick={() => handleAgentSelect(agent)}
                  className={`text-left p-5 rounded-xl border-2 transition-all hover:shadow-xl cursor-pointer border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-gray-600 ${colors.hover} group shadow-sm hover:shadow-md`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`${colors.iconBg} ${colors.iconColor} w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 shadow-md`}>
                      <i className={`fas ${agent.icon} text-xl`}></i>
                    </div>
                    <div className="flex-1 min-w-0 ">
                      <h3 className="font-semibold text-gray-800 dark:text-white mb-1 truncate">
                        {agent.name}
                      </h3>
                      
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-700 dark:text-gray-400 flex items-center gap-1">
                      <i className="fas fa-clock"></i>
                      Last: {agent.lastRun}
                    </span>
                    <i className={`fas fa-arrow-right ${colors.text}`}></i>
                  </div>
                </button>
              );
            })}
          </div>

        </>
      )}
    </div>
  );
};

export default AgentHistory;