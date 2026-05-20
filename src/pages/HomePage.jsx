import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { schedulesApi } from '../api/schedules';
import { dashboardApi } from '../api/dashboard';
import ScheduleCreateForm from '../components/ScheduleCreateForm';
import StatCard from '../components/StatCard';

/**
 * 홈 페이지.
 * 상단에 통계 카드 4개, 그 아래 일정 등록 폼, 마지막에 내 일정 리스트.
 */
export default function HomePage() {
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardApi.getStats,
  });

  const { data: schedules, isLoading, error } = useQuery({
    queryKey: ['schedules', 'all'],
    queryFn: schedulesApi.getAll,
  });

  const completeMutation = useMutation({
    mutationFn: (id) => schedulesApi.complete(id),
    onSuccess: () => {
      toast.success('완료 처리됨');
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: () => toast.error('완료 처리 실패'),
  });

  const removeMutation = useMutation({
    mutationFn: (id) => schedulesApi.remove(id),
    onSuccess: () => {
      toast.success('일정이 삭제됐어요');
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: () => toast.error('삭제 실패'),
  });

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });

  const completionPercent = stats
    ? Math.round((stats.completionRate ?? 0) * 100)
    : 0;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-7">
      <header>
        <div className="text-[12px] text-muted">{today}</div>
        <h1 className="text-[22px] font-semibold tracking-tight mt-1">홈</h1>
      </header>

      {/* 통계 카드 */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="오늘"
          value={`${stats?.todayCount ?? 0}건`}
          loading={statsLoading}
        />
        <StatCard
          label="이번 주"
          value={`${stats?.thisWeekCount ?? 0}건`}
          loading={statsLoading}
        />
        <StatCard
          label="완료율"
          value={`${completionPercent}%`}
          hint={
            stats
              ? `완료 ${stats.completedSchedules} · 대기 ${stats.pendingSchedules}`
              : undefined
          }
          loading={statsLoading}
        />
        <StatCard
          label="전체"
          value={`${stats?.totalSchedules ?? 0}건`}
          loading={statsLoading}
        />
      </section>

      <ScheduleCreateForm />

      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-[14px] font-semibold">내 일정</h2>
          <span className="text-[12px] text-muted tabular">
            {schedules?.length ?? 0}개
          </span>
        </div>

        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          {isLoading && (
            <div className="px-5 py-8 text-[13px] text-muted">불러오는 중</div>
          )}
          {error && (
            <div className="px-5 py-8 text-[13px] text-danger">
              일정을 불러오지 못했어요.
            </div>
          )}
          {!isLoading && !error && schedules?.length === 0 && (
            <div className="px-5 py-10 text-center text-[13px] text-muted">
              아직 등록된 일정이 없습니다.
            </div>
          )}

          <ul className="divide-y divide-line">
            {schedules?.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-line/60 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-[14px] truncate ${
                      s.completedAt ? 'line-through text-muted' : ''
                    }`}
                  >
                    {s.task}
                  </div>
                  <div className="text-[12px] text-muted mt-0.5 tabular">
                    {s.repeat
                      ? `반복 · ${s.repeatRule}`
                      : s.targetTime
                      ? new Date(s.targetTime).toLocaleString('ko-KR', {
                          month: 'long', day: 'numeric', weekday: 'short',
                          hour: '2-digit', minute: '2-digit',
                        })
                      : '시간 미정'}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!s.completedAt && (
                    <button
                      onClick={() => completeMutation.mutate(s.id)}
                      disabled={completeMutation.isPending}
                      className="text-[12px] text-subtle hover:text-text px-2 py-1 rounded transition-colors"
                    >
                      완료
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm(`"${s.task}" 일정을 삭제할까요?`)) {
                        removeMutation.mutate(s.id);
                      }
                    }}
                    disabled={removeMutation.isPending}
                    className="text-[12px] text-muted hover:text-danger px-2 py-1 rounded transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
