/**
 * Gemini가 시간을 추천했을 때 표시되는 인라인 카드.
 */
export default function SuggestionCard({ result, onConfirm, onCancel }) {
  if (!result) return null;

  const fmt = (iso) =>
    iso
      ? new Date(iso).toLocaleString('ko-KR', {
          month: 'long', day: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })
      : '';

  return (
    <div className="mt-3 border border-border rounded-xl bg-line/60 p-4">
      <div className="text-[11px] text-muted mb-1">추천</div>
      <p className="text-[13px] mb-3">{result.text}</p>

      <div className="bg-surface border border-border rounded-lg px-3 py-2.5 mb-3">
        <div className="text-[13.5px]">{result.task}</div>
        <div className="text-[12px] text-muted tabular mt-0.5">
          {fmt(result.start)}{result.end && ` – ${fmt(result.end)}`}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onCancel}
          className="text-[12.5px] text-subtle hover:text-text px-3 py-1.5 rounded-lg transition-colors"
        >
          다음에
        </button>
        <button
          onClick={onConfirm}
          className="text-[12.5px] font-medium bg-brand hover:bg-brand-hover text-white px-3.5 py-1.5 rounded-lg transition-colors"
        >
          이대로 등록
        </button>
      </div>
    </div>
  );
}
