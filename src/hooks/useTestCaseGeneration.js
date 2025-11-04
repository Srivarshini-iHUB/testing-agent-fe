import { useState } from 'react';
import { testCaseApi } from '../api/testCaseApi';

/**
 * React Hook for Test Case Generation
 */
export const useTestCaseGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Generate test cases from files or URLs
   * @param {File[]} frdFiles - FRD files to upload (optional if using URLs)
   * @param {File[]} userStoryFiles - User Story files to upload (optional if using URLs)
   * @param {string[]} frdUrls - FRD URLs from database (optional if using files)
   * @param {string[]} userStoryUrls - User Story URLs from database (optional if using files)
   * @param {string} projectId - Project ID (required)
   * @param {string} userId - User ID (optional, only needed when creating new project)
   */
  const generate = async (frdFiles = [], userStoryFiles = [], frdUrls = [], userStoryUrls = [], projectId = null, userId = null) => {
    setLoading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();

      // Add project_id (required)
      if (!projectId) {
        // Try to get from localStorage
        const proj = JSON.parse(localStorage.getItem('project') || 'null');
        projectId = proj?.id || proj?.projectId || null;
      }

      if (!projectId) {
        throw new Error('Project ID is required. Please select a project first.');
      }

      formData.append('project_id', projectId);

      // Add user_id if provided
      if (userId) {
        formData.append('user_id', userId);
      }

      // Handle FRD: Use URLs if provided, otherwise use files
      if (frdUrls && frdUrls.length > 0) {
        // Backend expects a single URL string, but we can send the first one
        // If multiple URLs, we could join them or send as array
        // Based on backend, it expects a single frd_url
        const frdUrl = Array.isArray(frdUrls) ? frdUrls[0] : frdUrls;
        if (frdUrl) {
          formData.append('frd_url', frdUrl);
        }
      } else if (frdFiles && frdFiles.length > 0) {
        // Add FRD files
        frdFiles.forEach((file) => {
          formData.append('frd_file', file);
        });
      }

      // Handle User Story: Use URLs if provided, otherwise use files
      if (userStoryUrls && userStoryUrls.length > 0) {
        // Backend expects a single URL string
        const userStoryUrl = Array.isArray(userStoryUrls) ? userStoryUrls[0] : userStoryUrls;
        if (userStoryUrl) {
          formData.append('user_story_url', userStoryUrl);
        }
      } else if (userStoryFiles && userStoryFiles.length > 0) {
        // Add User Story files
        userStoryFiles.forEach((file) => {
          formData.append('user_story_file', file);
        });
      }

      // Validate that we have either FRD or User Story
      if (!frdUrls.length && !frdFiles.length) {
        throw new Error('Please provide FRD documents (either from project or upload new files)');
      }
      if (!userStoryUrls.length && !userStoryFiles.length) {
        throw new Error('Please provide User Story documents (either from project or upload new files)');
      }

      const response = await testCaseApi.generateTestCases(formData, (percent) => {
        setProgress(percent);
      });

      setResult(response);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to generate test cases';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return {
    loading,
    progress,
    result,
    error,
    generate,
  };
};
