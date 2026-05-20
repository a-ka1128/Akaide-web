import apiClient from './client';

/**
 * 빈 시간(가용 시간) 히트맵 데이터.
 *
 * 응답 형식:
 *   {
 *     slotMinutes: 30,
 *     activeRange: { MONDAY: [9, 23], ... },
 *     occupancy:   { MONDAY: [0,0,1,1,...], ... }   // 길이 48
 *   }
 */
export const freeTimeApi = {
  getMatrix: () => apiClient.get('/api/free-time').then((r) => r.data),
};
