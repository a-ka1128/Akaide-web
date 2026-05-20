import { DISCORD_LOGIN_URL } from '../api/auth';

/**
 * 로그인 페이지 — 미니멀.
 */
export default function LoginPage() {
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
