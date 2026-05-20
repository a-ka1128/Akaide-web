import axios from 'axios';

/**
 * 백엔드 API 통신용 axios 인스턴스.
 *
 * - baseURL: .env에서 가져옴 (개발: http://localhost:8080)
 * - 요청 인터셉터: localStorage의 JWT를 자동으로 Authorization 헤더에 첨부
 * - 응답 인터셉터: 401 응답 시 localStorage 비우고 /login으로 강제 이동
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: false, // JWT를 헤더로 보내니까 쿠키는 안 씀
});

// 토큰 저장/조회 헬퍼 (다른 파일에서도 재사용)
export const tokenStorage = {
  get: () => localStorage.getItem('akaide_token'),
  set: (token) => localStorage.setItem('akaide_token', token),
  clear: () => localStorage.removeItem('akaide_token'),
};

// ===== 요청 인터셉터 =====
// 매 요청에 JWT를 자동 첨부
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===== 응답 인터셉터 =====
// 401(인증 실패)이면 토큰 만료/위조로 간주하고 로그인 페이지로
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenStorage.clear();
      // 이미 로그인 페이지면 무한 리다이렉트 방지
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
