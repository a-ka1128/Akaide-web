import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App.jsx';

/**
 * 전역 React Query 클라이언트.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        {/* 전역 토스트 — 우측 하단, 검정 톤, 짧게 */}
        <Toaster
          position="bottom-right"
          gutter={8}
          toastOptions={{
            duration: 2500,
            style: {
              background: '#18181b',
              color: '#fafafa',
              fontSize: '13px',
              padding: '10px 14px',
              borderRadius: '8px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            },
            success: {
              iconTheme: { primary: '#16a34a', secondary: '#fafafa' },
            },
            error: {
              iconTheme: { primary: '#dc2626', secondary: '#fafafa' },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
