/**
 * 일정 충돌 시 사용자에게 그래도 등록할지 묻는 모달.
 */
export default function ConflictModal({ result, onConfirm, onCancel }) {
  if (!result) return null;

  const fmt = (iso) =>
    iso
      ? new Date(iso).toLocaleString('ko-KR', {
          month: 'long', day: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })
      : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md bg-surface rounded-2xl border border-border p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[15px] font-semibold mb-1">일정이 겹쳐요</h3>
        <p className="text-[13px] text-subtle mb-5">
          이 시간에 이미 다른 일정이 있어요. 그래도 등록할까요?
        </p>

        <div className="space-y-3 mb-6">
          <div>
            <div className="text-[11px] text-muted mb-1">새 일정</div>
            <div className="text-[14px]">{result.task}</div>
            <div className="text-[12px] text-muted tabular">
              {fmt(result.start)}{result.end && ` – ${fmt(result.end)}`}
            </div>
          </div>

          <div className="h-px bg-line" />

          <div>
            <div className="text-[11px] text-muted mb-1">기존 일정</div>
            <pre className="text-[12.5px] text-subtle whitespace-pre-wrap font-sans m-0">
              {result.conflictDescription?.trim()}
            </pre>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="text-[13px] text-subtle hover:text-text px-3 py-2 rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="text-[13px] font-medium bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-lg transition-colors"
          >
            그래도 등록
          </button>
        </div>
      </div>
    </div>
  );
}
