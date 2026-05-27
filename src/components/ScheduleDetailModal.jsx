import { useState, useEffect } from 'react';
import { CATEGORIES } from '../lib/category';

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
  schedule, onClose, onSave, onComplete, onUncomplete, onDelete, busy,
}) {
  const [task, setTask] = useState(schedule?.task ?? '');
  const [category, setCategory] = useState(schedule?.category ?? 'OTHER');
  const [alert24h, setAlert24h] = useState(!!schedule?.alert24h);
  const [alert1h, setAlert1h] = useState(!!schedule?.alert1h);

  useEffect(() => {
    setTask(schedule?.task ?? '');
    setCategory(schedule?.category ?? 'OTHER');
    setAlert24h(!!schedule?.alert24h);
    setAlert1h(!!schedule?.alert1h);
  }, [schedule?.id]);

  if (!schedule) return null;

  const fmt = (iso) =>
    iso
      ? new Date(iso).toLocaleString('ko-KR', {
          year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
          hour: '2-digit', minute: '2-digit',
        })
      : '시간 미정';

  const dirty =
    (task.trim() && task !== schedule.task) ||
    category !== (schedule.category ?? 'OTHER') ||
    alert24h !== !!schedule.alert24h ||
    alert1h !== !!schedule.alert1h;

  const handleSave = () => {
    if (!dirty) return;
    const payload = {};
    if (task.trim() && task !== schedule.task) payload.task = task.trim();
    if (category !== (schedule.category ?? 'OTHER')) payload.category = category;
    if (alert24h !== !!schedule.alert24h) payload.alert24h = alert24h;
    if (alert1h !== !!schedule.alert1h) payload.alert1h = alert1h;
    onSave(payload);
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
            <div className="text-[11px] text-muted mb-1.5">카테고리</div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => {
                const selected = category === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setCategory(c.key)}
                    disabled={busy}
                    className={
                      'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] transition-all ' +
                      (selected
                        ? 'ring-2 ring-offset-1 ring-offset-surface font-medium'
                        : 'opacity-55 hover:opacity-100')
                    }
                    style={{
                      background: c.color + (selected ? '' : '33'), // 비선택 시 알파
                      color: selected ? '#18181b' : c.color,
                      // 선택 시 ring 색을 카테고리 색으로
                      ...(selected ? { '--tw-ring-color': c.color } : {}),
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: c.color }}
                    />
                    {c.label}
                  </button>
                );
              })}
            </div>
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

          <div>
            <div className="text-[11px] text-muted mb-1.5">알림</div>
            <div className="flex items-center gap-5">
              <label className="flex items-center gap-2 text-[13px] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={alert24h}
                  onChange={(e) => setAlert24h(e.target.checked)}
                  disabled={busy}
                  className="w-4 h-4 accent-brand"
                />
                <span className="text-subtle">24시간 전</span>
              </label>
              <label className="flex items-center gap-2 text-[13px] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={alert1h}
                  onChange={(e) => setAlert1h(e.target.checked)}
                  disabled={busy}
                  className="w-4 h-4 accent-brand"
                />
                <span className="text-subtle">1시간 전</span>
              </label>
            </div>
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
            {schedule.completedAt ? (
              <button
                onClick={onUncomplete}
                disabled={busy}
                className="text-[12.5px] text-subtle hover:text-text px-3 py-1.5 rounded-lg transition-colors"
              >
                완료 취소
              </button>
            ) : (
              <button
                onClick={onComplete}
                disabled={busy}
                className="text-[12.5px] text-subtle hover:text-text px-3 py-1.5 rounded-lg transition-colors"
              >
                일정 완료
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
