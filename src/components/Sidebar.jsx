import { NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { tokenStorage } from '../api/client';

/**
 * 좌측 사이드바 — 미니멀 톤.
 * 텍스트 위주, 아이콘 없음, 액티브 표시는 굵기와 좌측 라인으로.
 */
export default function Sidebar() {
  const navigate = useNavigate();
  const { data: me } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
  });

  const handleLogout = () => {
    tokenStorage.clear();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-surface flex flex-col">
      {/* 로고 — 텍스트만 */}
      <div className="px-6 pt-7 pb-5">
        <div className="text-[15px] font-semibold tracking-tight">Akaide</div>
      </div>

      {/* 메뉴 */}
      <nav className="px-3 flex flex-col gap-0.5">
        <NavItem to="/" end label="홈" />
        <NavItem to="/calendar" label="캘린더" />
        <NavItem to="/school" label="학교" />
        <NavItem to="/free-time" label="빈 시간" />
        <NavItem to="/settings" label="설정" />
      </nav>

      <div className="flex-1" />

      {/* 사용자 영역 */}
      <div className="px-6 py-5 border-t border-line">
        <div className="text-[11px] text-muted mb-1">로그인 계정</div>
        <div className="text-[13px] truncate mb-3">{me?.userId ?? '—'}</div>
        <button
          onClick={handleLogout}
          className="text-[12px] text-muted hover:text-text transition-colors"
        >
          로그아웃
        </button>
      </div>
    </aside>
  );
}

/** active일 때 좌측에 얇은 라인 + 진한 글자. */
function NavItem({ to, end, label }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'relative px-3 py-2 text-[13.5px] rounded-md transition-colors',
          isActive
            ? 'text-text font-semibold bg-line'
            : 'text-subtle hover:text-text hover:bg-line/60',
        ].join(' ')
      }
    >
      {label}
    </NavLink>
  );
}
