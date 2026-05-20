import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import HomePage from './pages/HomePage';
import CalendarPage from './pages/CalendarPage';
import FreeTimePage from './pages/FreeTimePage';
import SettingsPage from './pages/SettingsPage';
import SchoolPage from './pages/SchoolPage';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import './App.css';

/**
 * 라우트 정의 — 중첩 구조.
 *
 * - /login, /oauth/callback : 인증 흐름 전용 (레이아웃 없음)
 * - 그 외 모든 보호 라우트 : ProtectedRoute → AppLayout → 페이지
 */
function App() {
  return (
    <Routes>
      {/* 공개 라우트 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

      {/* 보호 라우트 (모두 사이드바 레이아웃을 공유) */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/school" element={<SchoolPage />} />
        <Route path="/free-time" element={<FreeTimePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* 알 수 없는 경로는 홈으로 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
