import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { schedulesApi } from '../api/schedules';
import ConflictModal from './ConflictModal';
import SuggestionCard from './SuggestionCard';
import { CATEGORIES } from '../lib/category';

/**
 * 일정 등록 — 자연어 / 직접 입력 두 탭.
 *
 * 결과(SmartResultDto.type)별 처리:
 *  - SUCCESS    : 성공 토스트 + 목록 무효화
 *  - CONFLICT   : ConflictModal 모달
 *  - SUGGESTION : SuggestionCard 인라인 카드
 *  - IGNORE     : 안내 토스트
 *  - ERROR      : 에러 토스트
 */
export default function ScheduleCreateForm() {
  const queryClient = useQueryClient();

  const [tab, setTab] = useState('smart');
  const [message, setMessage] = useState('');

  // 폼 입력
  const [task, setTask] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [alert24h, setAlert24h] = useState(false);
  const [alert1h, setAlert1h] = useState(false);
  const [category, setCategory] = useState('OTHER');

  const [pendingResult, setPendingResult] = useState(null);

  const refreshLists = () => {
    queryClient.invalidateQueries({ queryKey: ['schedules'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const handleResult = (result) => {
    switch (result.type) {
      case 'SUCCESS':
        toast.success(`${result.task} 등록됨`);
        setMessage('');
        clearForm();
        refreshLists();
        break;
      case 'CONFLICT':
      case 'SUGGESTION':
        setPendingResult(result);
        break;
      case 'IGNORE':
        toast('일정으로 이해하지 못했어요. 다시 입력해 주세요.');
        break;
      case 'ERROR':
      default:
        toast.error('분석 중 오류가 발생했어요.');
    }
  };

  const clearForm = () => {
    setTask(''); setDate(''); setTime(''); setEndTime('');
    setAlert24h(false); setAlert1h(false);
    setCategory('OTHER');
  };

  const smartMutation = useMutation({
    mutationFn: () => schedulesApi.createSmart(message),
    onSuccess: handleResult,
    onError: () => toast.error('서버 통신 실패'),
  });

  const formMutation = useMutation({
    mutationFn: () => {
      const targetTime = `${date}T${time}:00`;
      return schedulesApi.create({
        task,
        targetTime,
        endTime: endTime ? `${date}T${endTime}:00` : null,
        alert24h, alert1h,
        category,
      });
    },
    onSuccess: handleResult,
    onError: () => toast.error('서버 통신 실패'),
  });

  const confirmMutation = useMutation({
    mutationFn: (buttonId) => schedulesApi.confirm(buttonId),
    onSuccess: (task) => {
      toast.success(`${task} 등록됨`);
      setPendingResult(null);
      setMessage('');
      clearForm();
      refreshLists();
    },
    onError: () => toast.error('확정 처리 실패'),
  });

  const handleSmartSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    smartMutation.mutate();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!task.trim() || !date || !time) {
      toast('제목, 날짜, 시작 시간은 필수입니다.');
      return;
    }
    formMutation.mutate();
  };

  const isLoading =
    smartMutation.isPending || formMutation.isPending || confirmMutation.isPending;

  return (
    <section className="bg-surface rounded-xl border border-border p-5">
      <h2 className="text-[14px] font-semibold mb-4">새 일정</h2>

      {/* 탭 */}
      <div className="inline-flex gap-1 p-1 bg-line rounded-lg mb-4">
        <TabButton active={tab === 'smart'} onClick={() => setTab('smart')}>
          AI 입력
        </TabButton>
        <TabButton active={tab === 'form'} onClick={() => setTab('form')}>
          직접 입력
        </TabButton>
      </div>

      {tab === 'smart' && (
        <form onSubmit={handleSmartSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='예: "내일 오후 3시에 운동 1시간"'
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 text-[14px] border border-border rounded-lg focus:outline-none focus:border-brand transition-colors"
          />
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-muted">
              자연스럽게 입력하면 AI가 시간과 제목을 정리해드려요.
            </p>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-brand hover:bg-brand-hover text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {smartMutation.isPending ? '분석 중' : '등록'}
            </button>
          </div>
        </form>
      )}

      {tab === 'form' && (
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-3">
          <Field label="제목">
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="예: 팀 미팅"
              disabled={isLoading}
              className={inputCls}
            />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="날짜">
              <input
                type="date" value={date} onChange={(e) => setDate(e.target.value)}
                disabled={isLoading} className={inputCls}
              />
            </Field>
            <Field label="시작 시간">
              <input
                type="time" value={time} onChange={(e) => setTime(e.target.value)}
                disabled={isLoading} className={inputCls}
              />
            </Field>
            <Field label="종료 (선택)">
              <input
                type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                disabled={isLoading} className={inputCls}
              />
            </Field>
          </div>
          <Field label="카테고리">
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => {
                const selected = category === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setCategory(c.key)}
                    disabled={isLoading}
                    className={
                      'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] transition-all ' +
                      (selected
                        ? 'ring-2 ring-offset-1 ring-offset-surface font-medium'
                        : 'opacity-55 hover:opacity-100')
                    }
                    style={{
                      background: c.color + (selected ? '' : '33'),
                      color: selected ? '#18181b' : c.color,
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
          </Field>
          <div className="flex items-center gap-5 mt-1">
            <Checkbox checked={alert24h} onChange={setAlert24h} disabled={isLoading}>
              24시간 전 알림
            </Checkbox>
            <Checkbox checked={alert1h} onChange={setAlert1h} disabled={isLoading}>
              1시간 전 알림
            </Checkbox>
          </div>
          <div className="flex justify-end mt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-brand hover:bg-brand-hover text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {formMutation.isPending ? '등록 중' : '등록'}
            </button>
          </div>
        </form>
      )}

      {pendingResult?.type === 'SUGGESTION' && (
        <SuggestionCard
          result={pendingResult}
          onConfirm={() => confirmMutation.mutate(pendingResult.buttonId)}
          onCancel={() => setPendingResult(null)}
        />
      )}

      {pendingResult?.type === 'CONFLICT' && (
        <ConflictModal
          result={pendingResult}
          onConfirm={() => confirmMutation.mutate(pendingResult.buttonId)}
          onCancel={() => setPendingResult(null)}
        />
      )}
    </section>
  );
}

const inputCls =
  'w-full px-3 py-2 text-[14px] border border-border rounded-lg focus:outline-none focus:border-brand transition-colors';

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] text-subtle">{label}</span>
      {children}
    </label>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'px-3 py-1.5 text-[13px] rounded-md transition-colors',
        active
          ? 'bg-surface text-text shadow-sm'
          : 'text-subtle hover:text-text',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function Checkbox({ checked, onChange, disabled, children }) {
  return (
    <label className="flex items-center gap-2 text-[13px] cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="w-4 h-4 accent-brand"
      />
      <span className="text-subtle">{children}</span>
    </label>
  );
}
