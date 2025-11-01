import apiClient from './client';

// API Service for Integration Testing workflows
export const integrationApi = {
  // Generate scenarios for a project (DB-driven: uses URLs stored in project)
  generateScenarios: async (projectId) => {
    const response = await apiClient.post('/generate-scenarios', null, {
      params: { project_id: projectId },
    });
    return response.data;
  },

  // Generate test script for a specific scenario inside a test run (scenarios doc)
  generateTestScript: async (testRunId, scenarioName) => {
    const response = await apiClient.post('/generate-test-script', null, {
      params: { test_run_id: testRunId, scenario_name: scenarioName },
    });
    return response.data;
  },

  // Execute a pre-generated scenario
  runScenario: async (scenariosDocId, scenarioName) => {
    const url = `/run-scenario/${encodeURIComponent(scenariosDocId)}/${encodeURIComponent(scenarioName)}`;
    const response = await apiClient.post(url);
    return response.data;
  },

  // Fetch all test runs (scenarios docs) for a project
  getProjectTestRuns: async (projectId) => {
    const response = await apiClient.get(`/test-runs/${encodeURIComponent(projectId)}`);
    return response.data;
  },
};


