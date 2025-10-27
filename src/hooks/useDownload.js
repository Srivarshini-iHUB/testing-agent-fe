import { useState } from 'react';
import { ExcelFormatter } from '../utils/excelFormatter';

export const useDownload = () => {
  const [downloading, setDownloading] = useState(false);

  /**
   * Download test cases as Excel (Frontend generation)
   */
  const downloadExcel = async (testCases) => {
    setDownloading(true);
    
    try {
      // Generate timestamp for filename
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `test_cases_${timestamp}.xlsx`;

      // Generate and download Excel on frontend
      ExcelFormatter.downloadExcel(testCases, filename);

      console.log('✅ Excel downloaded successfully');
    } catch (error) {
      console.error('❌ Excel download failed:', error);
      alert('Failed to download Excel file. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  /**
   * Download detailed Excel with multiple sheets
   */
  const downloadDetailedExcel = async (result) => {
    setDownloading(true);
    
    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `test_cases_detailed_${timestamp}.xlsx`;

      ExcelFormatter.downloadDetailedExcel(result, filename);

      console.log('✅ Detailed Excel downloaded successfully');
    } catch (error) {
      console.error('❌ Detailed Excel download failed:', error);
      alert('Failed to download detailed Excel file. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  /**
   * Download test cases as JSON
   */
  const downloadJSON = (testCaseData) => {
    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `test_cases_${timestamp}.json`;

      // Convert to JSON string
      const jsonString = JSON.stringify(testCaseData, null, 2);

      // Create blob and download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('✅ JSON downloaded successfully');
    } catch (error) {
      console.error('❌ JSON download failed:', error);
      alert('Failed to download JSON file. Please try again.');
    }
  };

  return {
    downloading,
    downloadExcel,
    downloadDetailedExcel,
    downloadJSON
  };
};
