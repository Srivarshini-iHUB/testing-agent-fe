import apiClient from './client';

/**
 * API Service for E2E (Functional) Testing
 */
export const e2eApi = {
  /**
   * Get E2E reports by project ID
   */
  getProjectE2EReports: async (projectId) => {
    const response = await apiClient.get(`/e2e-reports`, {
      params: { project_id: projectId }
    });
    return response.data;
  },

  /**
   * Get a specific E2E report by ID
   */
  getE2EReport: async (reportId) => {
    const response = await apiClient.get(`/e2e-reports/${encodeURIComponent(reportId)}`);
    return response.data;
  },

  /**
   * Get test results for a specific E2E report
   */
  getE2EReportTestResults: async (reportId) => {
    const response = await apiClient.get(`/e2e-reports/${encodeURIComponent(reportId)}/test-results`);
    return response.data;
  },

  /**
   * Get test cases for a specific E2E report
   */
  getE2EReportTestCases: async (reportId) => {
    const response = await apiClient.get(`/e2e-reports/${encodeURIComponent(reportId)}/test-cases`);
    return response.data;
  },
};

