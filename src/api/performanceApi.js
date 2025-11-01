import apiClient from './client';

// API Service for Performance Testing
export const performanceApi = {
  // Run a performance test (load or stress)
  runTest: async (payload) => {
    const response = await apiClient.post('/api/performance/test', payload);
    return response.data;
  },

  // Get all performance test runs for a project
  getProjectTestRuns: async (projectId) => {
    const response = await apiClient.get(`/api/performance/test-runs/${encodeURIComponent(projectId)}`);
    return response.data;
  },

  // Optional: health check for dependencies
  health: async () => {
    const response = await apiClient.get('/api/performance/health');
    return response.data;
  },
};

export default performanceApi;


