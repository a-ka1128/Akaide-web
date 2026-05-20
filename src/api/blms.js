import apiClient from './client';

/**
 * 백석대 BLMS 학사 정보 import / 조회 API.
 */
export const blmsApi = {
  /**
   * POST /api/blms/import
   * mode: 'text' | 'html'
   */
  importContent: (mode, content) =>
    apiClient.post('/api/blms/import', { mode, content }).then((r) => r.data),

  /** GET /api/blms/items */
  list: () => apiClient.get('/api/blms/items').then((r) => r.data),

  /** DELETE /api/blms/items/{id} */
  remove: (id) => apiClient.delete(`/api/blms/items/${id}`).then((r) => r.data),

  /** POST /api/blms/items/{id}/to-schedule */
  toSchedule: (id) =>
    apiClient.post(`/api/blms/items/${id}/to-schedule`).then((r) => r.data),
};
