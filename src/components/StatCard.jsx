/**
 * 대시보드 통계 카드.
 *
 * props:
 *  - label: 작은 라벨 (예: "오늘")
 *  - value: 큰 숫자/문자 (예: 3, "67%")
 *  - hint:  하단 부가 설명 (선택, 예: "1건 완료")
 *  - loading: 로딩 상태일 때 자리 표시
 */
export default function StatCard({ label, value, hint, loading }) {
  return (
    <div className="bg-surface border border-border rounded-xl px-5 py-4">
      <div className="text-[12px] text-muted">{label}</div>
      <div className="text-[24px] font-semibold tracking-tight mt-1 tabular">
        {loading ? <span className="text-muted">—</span> : value}
      </div>
      {hint && (
        <div className="text-[11.5px] text-muted mt-1">{hint}</div>
      )}
    </div>
  );
}
