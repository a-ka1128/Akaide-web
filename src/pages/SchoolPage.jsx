import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { blmsApi } from '../api/blms';

/**
 * 학교(백석대 BLMS) 학사 항목 관리 페이지.
 *
 * 흐름:
 *   1. 사용자가 BLMS '학습활동 > 과제/토론/온라인 강의' 페이지를 복사
 *   2. 텍스트 또는 HTML 로 붙여넣기
 *   3. 서버가 추출 (텍스트=Gemini, HTML=Jsoup)
 *   4. 마감일이 있는 과제/토론/공지만 보여줌
 *   5. "일정 등록" 클릭 시 Schedule 테이블에 추가
 */
export default function SchoolPage() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState('text');
  const [content, setContent] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL / ASSIGNMENT / FORUM / NOTICE

  const { data: items, isLoading } = useQuery({
    queryKey: ['blms', 'items'],
    queryFn: blmsApi.list,
  });

  const filtered = useMemo(() => {
    if (!items) return [];
    if (filter === 'ALL') return items;
    return items.filter((i) => i.kind === filter);
  }, [items, filter]);

  const importMutation = useMutation({
    mutationFn: () => blmsApi.importContent(mode, content),
    onSuccess: (data) => {
      if (data.length === 0) {
        toast('가져올 항목을 찾지 못했어요. 다른 페이지에서 시도해 보세요.');
      } else {
        toast.success(`${data.length}개 항목을 가져왔어요`);
      }
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['blms'] });
    },
    onError: () => toast.error('가져오기 실패'),
  });

  const removeMutation = useMutation({
    mutationFn: (id) => blmsApi.remove(id),
    onSuccess: () => {
      toast.success('삭제됨');
      queryClient.invalidateQueries({ queryKey: ['blms'] });
    },
    onError: () => toast.error('삭제 실패'),
  });

  const toScheduleMutation = useMutation({
    mutationFn: (id) => blmsApi.toSchedule(id),
    onSuccess: () => {
      toast.success('일정으로 등록됐어요');
      queryClient.invalidateQueries({ queryKey: ['blms'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err) => {
      const msg =
        err.response?.status === 400
          ? '시간 정보가 없어 등록할 수 없어요.'
          : '일정 등록 실패';
      toast.error(msg);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast('내용을 붙여넣어 주세요.');
      return;
    }
    importMutation.mutate();
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-7">
      <header>
        <h1 className="text-[22px] font-semibold tracking-tight">학교</h1>
        <p className="text-[12px] text-muted mt-1">
          백석대 사이버캠퍼스(BLMS)에서 마감일이 있는 과제·토론·공지를 모아드려요.
        </p>
      </header>

      {/* 가이드 카드 */}
      <section className="bg-line/60 rounded-xl border border-border px-5 py-4">
        <div className="text-[13px] font-semibold mb-2">어디서 복사해야 하나요?</div>
        <ol className="text-[12.5px] text-subtle leading-relaxed space-y-1 list-decimal pl-5">
          <li>BLMS 로그인 후 <b>강의실 → 학습활동</b> 메뉴로 이동</li>
          <li>
            <b>과제 / 토론 / 온라인 강의</b> 페이지를 각각 열어서
            본문 영역을 <code>Ctrl+A → Ctrl+C</code> 로 복사
          </li>
          <li>아래에 붙여넣고 <b>가져오기</b> 클릭</li>
        </ol>
        <p className="text-[11.5px] text-muted mt-3">
          이번 주만 보이는 메인 페이지보다 <b>학습활동 내부 페이지</b>가
          전체 학기 항목이 다 나와서 더 정확해요.
        </p>
      </section>

      {/* import 패널 */}
      <section className="bg-surface rounded-xl border border-border p-5">
        <h2 className="text-[14px] font-semibold mb-4">불러오기</h2>

        <div className="inline-flex gap-1 p-1 bg-line rounded-lg mb-4">
          <TabButton active={mode === 'text'} onClick={() => setMode('text')}>
            텍스트
          </TabButton>
          <TabButton active={mode === 'html'} onClick={() => setMode('html')}>
            HTML
          </TabButton>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={importMutation.isPending}
            rows={mode === 'html' ? 10 : 8}
            placeholder={
              mode === 'text'
                ? '학습활동 > 과제(또는 토론/온라인 강의) 페이지를 Ctrl+A → Ctrl+C 한 내용을 붙여넣어 주세요.'
                : 'F12 → Elements → 본문 영역 우클릭 → Copy → Copy outerHTML 한 결과를 붙여넣어 주세요.'
            }
            className="w-full px-3.5 py-3 text-[13px] font-mono border border-border rounded-lg focus:outline-none focus:border-brand transition-colors resize-y"
          />
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-muted">
              {mode === 'text'
                ? 'AI가 마감일 있는 과제·토론·공지만 골라냅니다.'
                : 'HTML 카드 구조를 직접 파싱합니다. 학교 사이트 변경 시 깨질 수 있어요.'}
            </p>
            <button
              type="submit"
              disabled={importMutation.isPending}
              className="bg-brand hover:bg-brand-hover text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {importMutation.isPending ? '분석 중' : '가져오기'}
            </button>
          </div>
        </form>
      </section>

      {/* 항목 목록 */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-[14px] font-semibold">학사 항목</h2>
          <span className="text-[12px] text-muted tabular">
            {filtered.length}개
          </span>
        </div>

        {/* 종류 필터 탭 */}
        <div className="inline-flex gap-1 p-1 bg-line rounded-lg mb-3">
          <FilterButton active={filter === 'ALL'} onClick={() => setFilter('ALL')}>
            전체
          </FilterButton>
          <FilterButton active={filter === 'ASSIGNMENT'} onClick={() => setFilter('ASSIGNMENT')}>
            과제
          </FilterButton>
          <FilterButton active={filter === 'FORUM'} onClick={() => setFilter('FORUM')}>
            토론
          </FilterButton>
          <FilterButton active={filter === 'NOTICE'} onClick={() => setFilter('NOTICE')}>
            공지
          </FilterButton>
        </div>

        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          {isLoading && (
            <div className="px-5 py-8 text-[13px] text-muted">불러오는 중</div>
          )}
          {!isLoading && filtered.length === 0 && (
            <div className="px-5 py-10 text-center text-[13px] text-muted">
              {items?.length
                ? '이 종류에 해당하는 항목이 없습니다.'
                : '아직 가져온 항목이 없습니다.'}
            </div>
          )}

          <ul className="divide-y divide-line">
            {filtered.map((it) => (
              <li
                key={it.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-line/60 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <KindBadge kind={it.kind} />
                    <div className="text-[14px] truncate">{it.title}</div>
                  </div>
                  <div className="text-[12px] text-muted mt-1 tabular flex items-center gap-3 flex-wrap">
                    {it.courseName && <span>{it.courseName}</span>}
                    {it.endAt && (
                      <span>
                        · 마감{' '}
                        {new Date(it.endAt).toLocaleString('ko-KR', {
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                    {it.status && <span>· {it.status}</span>}
                    {it.linkedScheduleId && (
                      <span className="text-success">· 일정 등록됨</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {!it.linkedScheduleId && (
                    <button
                      onClick={() => toScheduleMutation.mutate(it.id)}
                      disabled={toScheduleMutation.isPending}
                      className="text-[12px] text-subtle hover:text-text px-2 py-1 rounded transition-colors"
                    >
                      일정 등록
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm(`"${it.title}" 항목을 삭제할까요?`)) {
                        removeMutation.mutate(it.id);
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

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'px-3 py-1.5 text-[13px] rounded-md transition-colors',
        active ? 'bg-surface text-text shadow-sm' : 'text-subtle hover:text-text',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'px-3 py-1 text-[12.5px] rounded-md transition-colors',
        active ? 'bg-surface text-text shadow-sm' : 'text-subtle hover:text-text',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function KindBadge({ kind }) {
  const map = {
    ASSIGNMENT: { label: '과제', cls: 'bg-red-50 text-red-700 border-red-200' },
    FORUM: { label: '토론', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    NOTICE: { label: '공지', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    LESSON: { label: '학습', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    UNKNOWN: { label: '기타', cls: 'bg-line text-subtle border-border' },
  };
  const m = map[kind] ?? map.UNKNOWN;
  return (
    <span
      className={`inline-flex items-center text-[11px] px-1.5 py-0.5 rounded border ${m.cls}`}
    >
      {m.label}
    </span>
  );
}
