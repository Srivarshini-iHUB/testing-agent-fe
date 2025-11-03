import apiClient from './client';

/**
 * API Service for Regression Testing
 */
export const regressionApi = {
  /**
   * Get regression tests by project ID
   */
  getProjectRegressionTests: async (projectId) => {
    const response = await apiClient.get(`/regression-tests`, {
      params: { project_id: projectId }
    });
    return response.data;
  },
};

