/**
 * 일정 카테고리 메타 — 한 곳에서만 관리한다.
 *
 * 백엔드의 ScheduleCategory enum 과 키가 정확히 같아야 한다 (대소문자 포함).
 * 색은 캘린더 이벤트 배경 + 모달 컬러 칩에서 같이 사용.
 */
export const CATEGORIES = [
  { key: 'SCHOOL', label: '학교',      color: '#EF4444' },
  { key: 'WORK',   label: '작업',      color: '#22C55E' },
  { key: 'WOW',    label: '와우',      color: '#E5D3B3' },
  { key: 'HOBBY',  label: '취미+약속', color: '#C084FC' },
  { key: 'OTHER',  label: '기타',      color: '#9CA3AF' },
];

/** key → 메타 (없으면 OTHER 로 fallback) */
export function categoryOf(key) {
  return CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[CATEGORIES.length - 1];
}

/** key → 색 (없으면 OTHER 색) */
export function colorOf(key) {
  return categoryOf(key).color;
}

/** key → 라벨 (없으면 OTHER 라벨) */
export function labelOf(key) {
  return categoryOf(key).label;
}
