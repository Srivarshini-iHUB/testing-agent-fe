import { useState } from 'react';
import { testCaseApi } from '../api/testCaseApi';

export const useTestCaseGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const generate = async (frdFiles, userStoryFiles) => {
    try {
      setLoading(true);
      setError(null);
      setProgress(0);
      
      // Validate files
      if (!frdFiles || frdFiles.length === 0) {
        throw new Error('Please upload FRD files');
      }
      if (!userStoryFiles || userStoryFiles.length === 0) {
        throw new Error('Please upload User Story files');
      }
      
      // Call API
      const data = await testCaseApi.generateTestCases(
        frdFiles, 
        userStoryFiles,
        'PROJ_1',
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
