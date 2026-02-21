import App from '@/App';
import { HeroUIProvider } from '@heroui/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Force all fetch calls to include cookies (needed for HttpOnly auth)
const originalFetch = window.fetch.bind(window);
window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  const url =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;
  const isSupabaseRequest = url.includes('.supabase.co/');

  return originalFetch(input, {
    ...init,
    credentials: init?.credentials ?? (isSupabaseRequest ? 'omit' : 'include'),
  });
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HeroUIProvider>
      <App />
    </HeroUIProvider>
  </StrictMode>
);
