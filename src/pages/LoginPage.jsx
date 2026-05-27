import { Navigate } from 'react-router-dom';
import { DISCORD_LOGIN_URL } from '../api/auth';
import { tokenStorage } from '../api/client';

/**
 * 로그인 페이지 — 미니멀.
 */
export default function LoginPage() {
  // 이미 로그인된 상태(토큰 보유)면 로그인 폼을 보여주지 않고 홈으로 보낸다.
  // /login 을 직접 열거나 북마크로 들어와도 "재로그인"처럼 보이지 않도록.
  if (tokenStorage.get()) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = () => {
    window.location.href = DISCORD_LOGIN_URL;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-[360px]">
        <div className="text-[20px] font-semibold tracking-tight mb-1">Akaide</div>
        <div className="text-[13px] text-muted mb-10">
          일정 비서 대시보드
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-brand hover:bg-brand-hover text-white text-[14px] font-medium py-3 rounded-lg transition-colors"
        >
          Discord로 계속하기
        </button>

        <p className="text-[12px] text-muted mt-6 leading-relaxed">
          Discord 봇과 동일한 계정으로 로그인됩니다.
        </p>
      </div>
    </div>
  );
}
