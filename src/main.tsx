import App from '@/App';
import { HeroUIProvider } from '@heroui/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Force all fetch calls to include cookies (needed for HttpOnly auth)
const originalFetch = window.fetch;
window.fetch = (input: RequestInfo | URL, init?: RequestInit) =>
  originalFetch(input, {
    ...init,
    credentials: init?.credentials ?? 'include',
  });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HeroUIProvider>
      <App />
    </HeroUIProvider>
  </StrictMode>
);
