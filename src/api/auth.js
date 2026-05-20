import apiClient from './client';

/**
 * 인증 관련 API 함수들.
 */
export const authApi = {
  /** GET /api/auth/me — 현재 로그인된 사용자 정보 */
  me: () => apiClient.get('/api/auth/me').then((r) => r.data),
};

/** Discord OAuth2 로그인 진입 URL (백엔드가 처리) */
export const DISCORD_LOGIN_URL = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/discord`;
