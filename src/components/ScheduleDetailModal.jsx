import { useState, useEffect } from 'react';

/**
 * 일정 상세 모달 — 캘린더에서 일정 클릭 시 표시.
 *
 * props:
 *  - schedule: ScheduleDto (원본 데이터)
 *  - onClose:   () => void
 *  - onSave:    (payload) => void   부분 업데이트 페이로드 전달
 *  - onComplete:() => void
 *  - onDelete:  () => void
 *  - busy:      boolean
 */
export default function ScheduleDetailModal({
  schedule, onClose, onSave, onComplete, onDelete, busy,
}) {
  const [task, setTask] = useState(schedule?.task ?? '');

  useEffect(() => {
    setTask(schedule?.task ?? '');
  }, [schedule?.id]);

  if (!schedule) return null;

  const fmt = (iso) =>
    iso
      ? new Date(iso).toLocaleString('ko-KR', {
          year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
          hour: '2-digit', minute: '2-digit',
        })
      : '시간 미정';

  const dirty = task.trim() && task !== schedule.task;

  const handleSave = () => {
    if (!dirty) return;
    onSave({ task: task.trim() });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface rounded-2xl border border-border p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-[15px] font-semibold">일정 상세</h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-text text-[18px] leading-none -mt-1"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 mb-5">
          <div>
            <div className="text-[11px] text-muted mb-1.5">제목</div>
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              disabled={busy}
              className="w-full px-3 py-2 text-[14px] border border-border rounded-lg focus:outline-none focus:border-brand transition-colors"
            />
          </div>

          <div>
            <div className="text-[11px] text-muted mb-1">시간</div>
            <div className="text-[13px] tabular">{fmt(schedule.targetTime)}</div>
            {schedule.endTime && (
              <div className="text-[12px] text-muted tabular">
                종료 · {fmt(schedule.endTime)}
              </div>
            )}
          </div>

          {schedule.repeat && (
            <div>
              <div className="text-[11px] text-muted mb-1">반복</div>
              <div className="text-[13px]">{schedule.repeatRule}</div>
            </div>
          )}

          <div className="flex items-center gap-4">
            {schedule.alert24h && (
              <span className="text-[11.5px] text-subtle">24시간 전 알림</span>
            )}
            {schedule.alert1h && (
              <span className="text-[11.5px] text-subtle">1시간 전 알림</span>
            )}
          </div>

          {schedule.completedAt && (
            <div className="text-[12px] text-muted tabular">
              완료 · {fmt(schedule.completedAt)}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-line -mx-6 px-6 pt-4">
          <button
            onClick={onDelete}
            disabled={busy}
            className="text-[12.5px] text-muted hover:text-danger px-2 py-1.5 rounded transition-colors"
          >
            삭제
          </button>

          <div className="flex items-center gap-1.5">
            {!schedule.completedAt && (
              <button
                onClick={onComplete}
                disabled={busy}
                className="text-[12.5px] text-subtle hover:text-text px-3 py-1.5 rounded-lg transition-colors"
              >
                완료
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={busy || !dirty}
              className="text-[12.5px] font-medium bg-brand hover:bg-brand-hover text-white px-3.5 py-1.5 rounded-lg transition-colors disabled:opacity-40"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
