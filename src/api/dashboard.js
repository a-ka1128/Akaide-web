import apiClient from './client';

export const dashboardApi = {
  /** GET /api/dashboard/stats */
  getStats: () => apiClient.get('/api/dashboard/stats').then((r) => r.data),
};
