import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { activeTimeApi } from '../api/activeTime';
import { tokenUsageApi } from '../api/tokenUsage';

/**
 * 설정 페이지.
 * - 요일별 활동 시간 (시작/종료 시각)
 * - Gemini API 누적 토큰 사용량
 */
export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-7">
      <header>
        <h1 className="text-[22px] font-semibold tracking-tight">설정</h1>
      </header>

      <ActiveTimeSection />
      <TokenUsageSection />
    </div>
  );
}

// ===================================================================
// 활동 시간
// ===================================================================

const DAY_KO = {
  MONDAY: '월요일', TUESDAY: '화요일', WEDNESDAY: '수요일',
  THURSDAY: '목요일', FRIDAY: '금요일', SATURDAY: '토요일', SUNDAY: '일요일',
};

function ActiveTimeSection() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['active-time'],
    queryFn: activeTimeApi.getAll,
  });

  // 로컬 편집 상태 — 백엔드 응답을 받아 초기화
  const [edits, setEdits] = useState({});
  useEffect(() => {
    if (data) {
      const next = {};
      for (const a of data) next[a.dayOfWeek] = { start: a.startHour, end: a.endHour };
      setEdits(next);
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: ({ day, payload }) => activeTimeApi.update(day, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['active-time'] }),
  });

  const isDirty = useMemo(() => {
    if (!data) return false;
    return data.some(
      (a) =>
        edits[a.dayOfWeek] &&
        (edits[a.dayOfWeek].start !== a.startHour ||
          edits[a.dayOfWeek].end !== a.endHour)
    );
  }, [data, edits]);

  const handleChange = (day, key, value) => {
    setEdits((prev) => ({
      ...prev,
      [day]: { ...prev[day], [key]: Number(value) },
    }));
  };

  const handleSave = async () => {
    if (!data) return;
    // 변경된 요일만 PUT
    const changed = data.filter(
      (a) =>
        edits[a.dayOfWeek] &&
        (edits[a.dayOfWeek].start !== a.startHour ||
          edits[a.dayOfWeek].end !== a.endHour)
    );
    if (changed.length === 0) return;

    // 검증
    for (const a of changed) {
      const { start, end } = edits[a.dayOfWeek];
      if (start >= end) {
        toast.error(`${DAY_KO[a.dayOfWeek]}: 시작이 종료보다 빠라야 해요.`);
        return;
      }
    }

    try {
      await Promise.all(
        changed.map((a) =>
          updateMutation.mutateAsync({
            day: a.dayOfWeek,
            payload: {
              dayOfWeek: a.dayOfWeek,
              startHour: edits[a.dayOfWeek].start,
              endHour: edits[a.dayOfWeek].end,
            },
          })
        )
      );
      toast.success(`${changed.length}개 요일 저장됐어요`);
    } catch {
      toast.error('일부 저장에 실패했어요');
    }
  };

  return (
    <section>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-[14px] font-semibold">활동 시간</h2>
        <span className="text-[12px] text-muted">
          빈 시간 분석에 사용되는 기준 시간대
        </span>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {isLoading && (
          <div className="px-5 py-8 text-[13px] text-muted">불러오는 중</div>
        )}
        {!isLoading && data && (
          <>
            <ul className="divide-y divide-line">
              {data.map((a) => (
                <li
                  key={a.dayOfWeek}
                  className="flex items-center gap-4 px-5 py-3"
                >
                  <span className="w-14 text-[13px]">{DAY_KO[a.dayOfWeek]}</span>
                  <HourSelect
                    value={edits[a.dayOfWeek]?.start ?? a.startHour}
                    onChange={(v) => handleChange(a.dayOfWeek, 'start', v)}
                  />
                  <span className="text-muted">—</span>
                  <HourSelect
                    value={edits[a.dayOfWeek]?.end ?? a.endHour}
                    onChange={(v) => handleChange(a.dayOfWeek, 'end', v)}
                  />
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-line">
              <button
                onClick={handleSave}
                disabled={!isDirty || updateMutation.isPending}
                className="text-[12.5px] font-medium bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-40"
              >
                {updateMutation.isPending ? '저장 중' : '변경사항 저장'}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function HourSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-2.5 py-1.5 text-[13px] border border-border rounded-lg focus:outline-none focus:border-brand transition-colors tabular bg-surface"
    >
      {Array.from({ length: 25 }, (_, i) => i).map((h) => (
        <option key={h} value={h}>
          {String(h).padStart(2, '0')}:00
        </option>
      ))}
    </select>
  );
}

// ===================================================================
// 토큰 사용량
// ===================================================================

function TokenUsageSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['token-usage'],
    queryFn: tokenUsageApi.get,
  });

  return (
    <section>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-[14px] font-semibold">Gemini API 사용량</h2>
        <span className="text-[12px] text-muted">누적</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <UsageCard label="총합" value={data?.totalTokens} loading={isLoading} />
        <UsageCard label="프롬프트" value={data?.totalPromptTokens} loading={isLoading} />
        <UsageCard label="응답" value={data?.totalCandidateTokens} loading={isLoading} />
      </div>
    </section>
  );
}

function UsageCard({ label, value, loading }) {
  return (
    <div className="bg-surface border border-border rounded-xl px-5 py-4">
      <div className="text-[12px] text-muted">{label}</div>
      <div className="text-[20px] font-semibold tracking-tight mt-1 tabular">
        {loading ? <span className="text-muted">—</span> : (value ?? 0).toLocaleString()}
        <span className="text-[12px] text-muted font-normal ml-1">tokens</span>
      </div>
    </div>
  );
}
