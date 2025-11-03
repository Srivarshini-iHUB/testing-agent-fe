import { useState } from 'react';
import { testCaseApi } from '../api/testCaseApi';

export const useTestCaseGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const generate = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      setProgress(0);

      // Validate formData
      if (!formData) {
        throw new Error('No data provided for test case generation');
      }

      // Check if project_id is included
      if (!formData.get('project_id')) {
        throw new Error('Project ID is missing');
      }

      // Check if at least one FRD source is provided
      if (!formData.get('frd_url') && !formData.get('frd_file')) {
        throw new Error('Please provide FRD (URL or file)');
      }

      // Check if at least one User Story source is provided
      if (!formData.get('user_story_url') && !formData.get('user_story_file')) {
        throw new Error('Please provide User Story (URL or file)');
      }

      // Call the API with formData
      const data = await testCaseApi.generateTestCases(
        formData,
        (percent) => setProgress(percent)
      );

      setResult(data);
      setProgress(100);
      return data;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setProgress(0);
    setResult(null);
    setError(null);
  };

  return { loading, progress, result, error, generate, reset };
};
