import apiClient from './client';

/**
 * API Service for Smoke Testing
 */
export const smokeApi = {
  /**
   * Get smoke tests by project ID
   */
  getProjectSmokeTests: async (projectId) => {
    const response = await apiClient.get(`/api/smoke-tests/project/${encodeURIComponent(projectId)}`);
    return response.data;
  },

  /**
   * Get a specific smoke test by ID
   */
  getSmokeTest: async (testId) => {
    const response = await apiClient.get(`/api/smoke-tests/${encodeURIComponent(testId)}`);
    return response.data;
  },
};

