import apiClient from './client';

/**
 * API Service for Test Case Generation
 */
export const testCaseApi = {
  /**
   * Generate test cases from documents (URLs or files)
   * @param {FormData} formData - FormData containing URLs or files
   * @param {Function} onProgress - Callback for upload progress
   */
  generateTestCases: async (formData, onProgress) => {
    try {
      const response = await apiClient.post('/generate-test-cases', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error generating test cases:', error);
      throw error.response?.data?.detail || error.message || 'Failed to generate test cases';
    }
  },

  /**
   * Download test cases as Excel
   * @param {FormData} formData - FormData containing URLs or files
   */
  downloadExcel: async (formData) => {
    try {
      const response = await apiClient.post('/generate-test-cases/excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading Excel:', error);
      throw error.response?.data?.detail || error.message || 'Failed to download Excel';
    }
  },

  /**
   * Get test case generations by project ID
   * @param {string} projectId - Project ID
   */
  getProjectTestCaseGenerations: async (projectId) => {
    try {
      const response = await apiClient.get(`/api/testcase-generator/project/${encodeURIComponent(projectId)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching test case generations:', error);
      throw error.response?.data?.detail || error.message || 'Failed to fetch test case generations';
    }
  },

  /**
   * Get test case generation by ID
   * @param {string} testcaseId - Test case generation ID
   */
  getTestCaseGeneration: async (testcaseId) => {
    try {
      const response = await apiClient.get(`/api/testcase-generator/${encodeURIComponent(testcaseId)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching test case generation:', error);
      throw error.response?.data?.detail || error.message || 'Failed to fetch test case generation';
    }
  },

  /**
   * Health check
   */
  healthCheck: async () => {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('Error checking health:', error);
      throw error.response?.data?.detail || error.message || 'Failed to check health';
    }
  }
};