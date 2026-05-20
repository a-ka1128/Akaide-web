import apiClient from './client';

/**
 * 일정 관련 API 함수들.
 * 컴포넌트에서는 useQuery / useMutation 으로 감싸서 쓴다.
 */
export const schedulesApi = {
  /** GET /api/schedules — 본인의 전체 일정 */
  getAll: () => apiClient.get('/api/schedules').then((r) => r.data),

  /** GET /api/schedules/today — 본인의 오늘 일정 */
  getToday: () => apiClient.get('/api/schedules/today').then((r) => r.data),

  /** GET /api/schedules/date/{YYYY-MM-DD} */
  getByDate: (date) =>
    apiClient.get(`/api/schedules/date/${date}`).then((r) => r.data),

  /** GET /api/schedules/range?start=&end= (캘린더용) */
  getByRange: (start, end) =>
    apiClient
      .get('/api/schedules/range', { params: { start, end } })
      .then((r) => r.data),

  /** POST /api/schedules/{id}/complete */
  complete: (id) =>
    apiClient.post(`/api/schedules/${id}/complete`).then((r) => r.data),

  /** DELETE /api/schedules/{id} */
  remove: (id) => apiClient.delete(`/api/schedules/${id}`).then((r) => r.data),

  /**
   * POST /api/schedules — 폼으로 직접 등록
   * body: { task, targetTime, endTime?, alert24h?, alert1h? }
   * 응답: SmartResultDto (type: SUCCESS / CONFLICT)
   */
  create: (payload) =>
    apiClient.post('/api/schedules', payload).then((r) => r.data),

  /**
   * POST /api/schedules/smart — 자연어로 등록 (Gemini 분석)
   * body: { message }
   * 응답: SmartResultDto (type: SUCCESS / CONFLICT / SUGGESTION / IGNORE / ERROR)
   */
  createSmart: (message) =>
    apiClient.post('/api/schedules/smart', { message }).then((r) => r.data),

  /**
   * POST /api/schedules/confirm/{buttonId} — 충돌/추천 확정 ("그래도 등록")
   */
  confirm: (buttonId) =>
    apiClient.post(`/api/schedules/confirm/${buttonId}`).then((r) => r.data),

  /**
   * PATCH /api/schedules/{id} — 부분 수정
   * payload: { task?, targetTime?, endTime?, alert24h?, alert1h? }
   */
  update: (id, payload) =>
    apiClient.patch(`/api/schedules/${id}`, payload).then((r) => r.data),
};
