import apiClient from './client';

/**
 * 요일별 활동 시간 API.
 */
export const activeTimeApi = {
  /** GET /api/active-time — 월~일 7개 배열 */
  getAll: () => apiClient.get('/api/active-time').then((r) => r.data),

  /**
   * PUT /api/active-time/{day} — 한 요일 갱신
   * body: { dayOfWeek, startHour, endHour }
   */
  update: (day, payload) =>
    apiClient.put(`/api/active-time/${day}`, payload).then((r) => r.data),
};
