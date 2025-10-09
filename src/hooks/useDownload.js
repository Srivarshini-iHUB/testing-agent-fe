import { useState } from 'react';
import { testCaseApi } from '../api/testCaseApi';

export const useDownload = () => {
  const [downloading, setDownloading] = useState(false);
  
  const downloadExcel = async (frdFiles, userStoryFiles) => {
    try {
      setDownloading(true);
      
      const blob = await testCaseApi.downloadExcel(frdFiles, userStoryFiles);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      link.download = `test_cases_${timestamp}.xlsx`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download Excel file: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };
  
  const downloadJSON = (data) => {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      link.download = `test_cases_${timestamp}.json`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('JSON download failed:', err);
      alert('Failed to download JSON file: ' + err.message);
    }
  };
  
  return { downloading, downloadExcel, downloadJSON };
};
