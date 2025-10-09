import apiClient from './client';

/**
 * API Service for Test Case Generation
 */
export const testCaseApi = {
  
  /**
   * Generate test cases from documents
   */
  generateTestCases: async (frdFiles, userStoryFiles, onProgress) => {
    const formData = new FormData();
    
    // Append files
    frdFiles.forEach(file => formData.append('frd_files', file));
    userStoryFiles.forEach(file => formData.append('user_story_files', file));
    
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
  downloadExcel: async (frdFiles, userStoryFiles) => {
    const formData = new FormData();
    
    frdFiles.forEach(file => formData.append('frd_files', file));
    userStoryFiles.forEach(file => formData.append('user_story_files', file));
    
    const response = await apiClient.post('/generate-test-cases/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob'
    });
    
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