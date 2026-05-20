import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { freeTimeApi } from '../api/freeTime';

/**
 * 빈 시간 히트맵.
 *
 * 가로: 시간 (활동 시간대 범위 안에서 시간 단위 라벨)
 * 세로: 요일 (월~일)
 * 각 칸: 30분 단위. 일정 있으면 진하게, 없으면 옅게.
 *        활동 시간 범위 밖 칸은 빗금/회색 처리 (사용자가 "쉬는 시간"이라 선언한 영역)
 */
export default function FreeTimePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['free-time'],
    queryFn: freeTimeApi.getMatrix,
  });

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-5">
      <header>
        <h1 className="text-[22px] font-semibold tracking-tight">빈 시간</h1>
        <p className="text-[12px] text-muted mt-1">
          이번 주의 시간대별 일정 점유 현황입니다. 옅은 칸이 비어 있는 시간이에요.
        </p>
      </header>

      <div className="bg-surface border border-border rounded-xl p-4">
        {isLoading && (
          <div className="py-12 text-center text-[13px] text-muted">불러오는 중</div>
        )}
        {error && (
          <div className="py-12 text-center text-[13px] text-danger">
            데이터를 불러오지 못했어요.
          </div>
        )}
        {data && <Heatmap data={data} />}
      </div>

      <Legend />
    </div>
  );
}

// ===================================================================
// Heatmap
// ===================================================================

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_KO = {
  MONDAY: '월', TUESDAY: '화', WEDNESDAY: '수',
  THURSDAY: '목', FRIDAY: '금', SATURDAY: '토', SUNDAY: '일',
};

function Heatmap({ data }) {
  // 가로축: 0시~24시 전체를 일단 보이게 (활동시간 밖은 회색)
  // 슬롯은 30분 단위(48개). 시각 라벨은 정시(2칸 간격)마다 표시.
  const hours = useMemo(() => Array.from({ length: 25 }, (_, i) => i), []);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[820px]">
        {/* 시간 라벨 (상단) */}
        <div className="flex items-end pl-9 mb-1">
          {hours.map((h, idx) => (
            <div
              key={h}
              className="text-[10.5px] text-muted tabular w-[34px] text-center select-none"
              style={{
                visibility: idx === hours.length - 1 ? 'hidden' : 'visible',
              }}
            >
              {h}
            </div>
          ))}
        </div>

        {/* 각 요일 행 */}
        <div className="flex flex-col gap-1">
          {DAYS.map((day) => (
            <Row key={day} day={day} data={data} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ day, data }) {
  const occ = data.occupancy[day] ?? new Array(48).fill(0);
  const [startHour, endHour] = data.activeRange[day] ?? [0, 24];

  return (
    <div className="flex items-center">
      <div className="w-9 text-[11.5px] text-subtle select-none">{DAY_KO[day]}</div>
      <div className="flex gap-[2px] flex-1">
        {Array.from({ length: 48 }, (_, slot) => {
          const hour = Math.floor(slot / 2);
          const inActiveRange = hour >= startHour && hour < endHour;
          const occupied = occ[slot] === 1;

          let cls;
          if (!inActiveRange) {
            cls = 'bg-line/60';   // 활동 시간 밖
          } else if (occupied) {
            cls = 'bg-brand';      // 일정 있음
          } else {
            cls = 'bg-line';       // 활동 시간 안 + 비어있음
          }

          const title = `${DAY_KO[day]}요일 ${formatSlot(slot)} ${
            !inActiveRange ? '· 활동 시간 외' : occupied ? '· 일정 있음' : '· 비어있음'
          }`;

          return (
            <div
              key={slot}
              title={title}
              className={`flex-1 h-7 rounded-[2px] ${cls}`}
            />
          );
        })}
      </div>
    </div>
  );
}

function formatSlot(slot) {
  const h = Math.floor(slot / 2);
  const m = slot % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
}

function Legend() {
  return (
    <div className="flex items-center gap-5 text-[11.5px] text-muted">
      <LegendItem className="bg-line/60" label="활동 시간 외" />
      <LegendItem className="bg-line" label="비어 있음" />
      <LegendItem className="bg-brand" label="일정 있음" />
    </div>
  );
}

function LegendItem({ className, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-block w-3.5 h-3.5 rounded-[2px] ${className}`} />
      <span>{label}</span>
    </div>
  );
}
