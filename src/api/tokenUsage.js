import apiClient from './client';

/**
 * Gemini API 토큰 사용량 조회.
 */
export const tokenUsageApi = {
  /** GET /api/token-usage */
  get: () => apiClient.get('/api/token-usage').then((r) => r.data),
};
