// src/api/testReportsApi.js
import apiClient from './client';

export const testReportsApi = {
  getReports: async () => {
    const response = await apiClient.get('/reports');
    return response.data;
  },
  
  getReportByUrl: async (reportUrl) => {
    // If it's a relative URL, use apiClient; otherwise fetch directly
    if (reportUrl.startsWith('http://') || reportUrl.startsWith('https://')) {
      const response = await fetch(reportUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch report: ${response.status}`);
      }
      return response.json();
    } else {
      const response = await apiClient.get(reportUrl);
      return response.data;
    }
  },

  getArtifactReport: async (artifactId, reportPath = 'report.json') => {
    const url = `/artifacts/${artifactId}/reports/${reportPath}`;
    const response = await apiClient.get(url);
    return response.data;
  },
};
