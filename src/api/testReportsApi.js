// src/api/testReportsApi.js
import apiClient from './client';

export const testReportsApi = {
  getReports: async () => {
    const response = await apiClient.get('/reports');
    return response.data;
  },
};
