import { Navigate } from 'react-router-dom';
import { tokenStorage } from '../api/client';

/**
 * 로그인이 필요한 라우트를 감싸는 래퍼.
 * 토큰이 없으면 /login 으로 보낸다.
 *
 * 토큰 검증은 axios 응답 인터셉터가 처리하므로
 * 여기서는 단순히 "토큰이 있긴 한가" 만 체크한다.
 */
export default function ProtectedRoute({ children }) {
  const token = tokenStorage.get();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
