import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { schedulesApi } from '../api/schedules';
import ScheduleDetailModal from '../components/ScheduleDetailModal';
import '../styles/fullcalendar-overrides.css';

/**
 * 캘린더 페이지.
 *
 * - FullCalendar 월/주/일 뷰
 * - 일정 클릭 → 상세 모달 (수정/완료/삭제)
 * - 드래그/리사이즈 → PATCH 호출
 * - 뷰 이동 시 자동으로 해당 범위의 일정만 다시 로딩 (range 캐싱)
 */
export default function CalendarPage() {
  const queryClient = useQueryClient();
  const calendarRef = useRef(null);

  // FullCalendar가 datesSet 콜백으로 알려주는 현재 뷰 범위 (YYYY-MM-DD)
  const [range, setRange] = useState(null);

  // 모달 상태
  const [selected, setSelected] = useState(null);

  const { data: events = [] } = useQuery({
    queryKey: ['schedules', 'range', range?.start, range?.end],
    queryFn: () => schedulesApi.getByRange(range.start, range.end),
    enabled: !!range,
    select: (list) => list.map(toEvent),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['schedules'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  // ===== mutations =====
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => schedulesApi.update(id, payload),
    onSuccess: () => invalidate(),
    onError: () => toast.error('수정 실패'),
  });

  const completeMutation = useMutation({
    mutationFn: (id) => schedulesApi.complete(id),
    onSuccess: () => {
      toast.success('완료 처리됨');
      invalidate();
      setSelected(null);
    },
    onError: () => toast.error('완료 처리 실패'),
  });

  const removeMutation = useMutation({
    mutationFn: (id) => schedulesApi.remove(id),
    onSuccess: () => {
      toast.success('일정이 삭제됐어요');
      invalidate();
      setSelected(null);
    },
    onError: () => toast.error('삭제 실패'),
  });

  // ===== 이벤트 핸들러 =====
  const handleDatesSet = (info) => {
    const start = toIsoDate(info.start);
    const end = toIsoDate(info.end);
    if (range?.start !== start || range?.end !== end) {
      setRange({ start, end });
    }
  };

  const handleEventClick = (info) => {
    setSelected(info.event.extendedProps.raw);
  };

  // 드래그로 시간 이동
  const handleEventDrop = (info) => {
    const id = Number(info.event.id);
    const newStart = info.event.start;
    if (!newStart) {
      info.revert();
      return;
    }
    // endTime이 원래 있었으면 같은 길이 유지
    const newEnd = info.event.end ? toLocalIso(info.event.end) : null;
    updateMutation.mutate(
      {
        id,
        payload: {
          targetTime: toLocalIso(newStart),
          ...(newEnd ? { endTime: newEnd } : {}),
        },
      },
      {
        onSuccess: () => toast.success('시간이 변경됐어요'),
        onError: () => {
          info.revert();
          toast.error('시간 변경 실패');
        },
      }
    );
  };

  // 리사이즈로 종료 시간 변경
  const handleEventResize = (info) => {
    const id = Number(info.event.id);
    const newEnd = info.event.end;
    if (!newEnd) {
      info.revert();
      return;
    }
    updateMutation.mutate(
      { id, payload: { endTime: toLocalIso(newEnd) } },
      {
        onSuccess: () => toast.success('종료 시간이 변경됐어요'),
        onError: () => {
          info.revert();
          toast.error('변경 실패');
        },
      }
    );
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-5">
      <header>
        <h1 className="text-[22px] font-semibold tracking-tight">캘린더</h1>
        <p className="text-[12px] text-muted mt-1">
          일정을 클릭하면 상세를 볼 수 있고, 끌어서 시간을 옮길 수 있어요.
        </p>
      </header>

      <div className="bg-surface border border-border rounded-xl p-3">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="ko"
          firstDay={0}
          height="auto"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          buttonText={{
            today: '오늘',
            month: '월',
            week: '주',
            day: '일',
          }}
          dayMaxEvents={3}
          events={events}
          editable
          eventResizableFromStart={false}
          datesSet={handleDatesSet}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          allDaySlot={false}
        />
      </div>

      {selected && (
        <ScheduleDetailModal
          schedule={selected}
          busy={updateMutation.isPending || completeMutation.isPending || removeMutation.isPending}
          onClose={() => setSelected(null)}
          onSave={(payload) =>
            updateMutation.mutate(
              { id: selected.id, payload },
              {
                onSuccess: (saved) => {
                  toast.success('저장됐어요');
                  setSelected(saved);  // 최신 상태로 갱신
                },
              }
            )
          }
          onComplete={() => completeMutation.mutate(selected.id)}
          onDelete={() => {
            if (confirm(`"${selected.task}" 일정을 삭제할까요?`)) {
              removeMutation.mutate(selected.id);
            }
          }}
        />
      )}
    </div>
  );
}

// =====================================================
// 변환 헬퍼
// =====================================================

/** ScheduleDto → FullCalendar event */
function toEvent(s) {
  const classNames = [];
  if (s.completedAt) classNames.push('akaide-completed');
  if (s.repeat) classNames.push('akaide-repeat');

  return {
    id: String(s.id),
    title: s.task,
    start: s.targetTime,
    end: s.endTime ?? undefined,
    classNames,
    extendedProps: { raw: s },
  };
}

/** Date → "YYYY-MM-DD" (range 쿼리용) */
function toIsoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Date → "YYYY-MM-DDTHH:mm:ss" (백엔드 LocalDateTime 호환, 타임존 없음) */
function toLocalIso(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return (
    d.getFullYear() +
    '-' + pad(d.getMonth() + 1) +
    '-' + pad(d.getDate()) +
    'T' + pad(d.getHours()) +
    ':' + pad(d.getMinutes()) +
    ':' + pad(d.getSeconds())
  );
}
