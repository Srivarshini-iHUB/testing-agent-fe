import apiClient from './client';

/**
 * API Service for Test Case Generation
 */
export const testCaseApi = {
  /**
   * Generate test cases from documents
   */
  generateTestCases: async (frdFiles, userStoryFiles, projectId, onProgress) => {
    const formData = new FormData();

    // Append files
    frdFiles.forEach(file => formData.append('frd_files', file));
    userStoryFiles.forEach(file => formData.append('user_story_files', file));

    // Append project ID
    formData.append('project_id', projectId);

    const response = await apiClient.post('/generate-test-cases', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      }
    });

    return response.data;
  },

  /**
   * Download test cases as Excel
   */
  downloadExcel: async (frdFiles, userStoryFiles, projectId) => {
    const formData = new FormData();

    frdFiles.forEach(file => formData.append('frd_files', file));
    userStoryFiles.forEach(file => formData.append('user_story_files', file));

    // Append project ID
    formData.append('project_id', projectId);

    const response = await apiClient.post('/generate-test-cases/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob'
    });

    return response.data;
  },

  /**
   * Get test case generations by project ID
   */
  getProjectTestCaseGenerations: async (projectId) => {
    const response = await apiClient.get(`/api/testcase-generator/project/${encodeURIComponent(projectId)}`);
    return response.data;
  },

  /**
   * Get test case generation by ID
   */
  getTestCaseGeneration: async (testcaseId) => {
    const response = await apiClient.get(`/api/testcase-generator/${encodeURIComponent(testcaseId)}`);
    return response.data;
  },

  /**
   * Health check
   */
  healthCheck: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  }
};
