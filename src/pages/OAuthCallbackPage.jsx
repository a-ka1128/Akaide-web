import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tokenStorage } from '../api/client';

/**
 * OAuth2 콜백 페이지.
 *
 * 백엔드 OAuth2SuccessHandler가 발급한 JWT를
 * URL 쿼리 ?token=... 에 담아 이 경로로 리다이렉트한다.
 *
 * 여기서 토큰을 localStorage에 저장하고 홈으로 이동.
 */
export default function OAuthCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      tokenStorage.set(token);
      navigate('/', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [params, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-muted">로그인 처리 중...</div>
    </div>
  );
}
