import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

/**
 * 로그인 후 모든 페이지의 공통 레이아웃.
 *
 * 본문 너비는 각 페이지가 직접 결정한다 (max-w 자유).
 * 여기서는 좌우 패딩과 상단 여백만 통일.
 */
export default function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
