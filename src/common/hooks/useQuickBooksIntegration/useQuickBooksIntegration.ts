// src/hooks/useQuickBooksConnect.ts
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';

/**
 * Hook to initiate the QuickBooks OAuth pop‑up flow via the /auth/url endpoint.
 */
export function useQuickBooksConnect() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const connectQuickBooks = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // 1️⃣ Fetch the JSON URL from your backend (/quickbooks/auth/url)
      const base = (
        import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5050'
      ).replace(/\/$/, '');
      const response = await fetch(`${base}/quickbooks/auth/url`, {
        method: 'GET',
        credentials: 'include', // Include session cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        const errorMsg =
          errorText || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(`Could not fetch QuickBooks auth URL: ${errorMsg}`);
      }

      // 2️⃣ Extract the Intuit consent URL
      const { url } = (await response.json()) as { url: string };

      // 3️⃣ Open the OAuth consent screen in a popup
      const popup = window.open(url, '_blank', 'width=600,height=700');

      // 4️⃣ Listen for the postMessage from your callback handler (opener may redirect to dashboard and show toast there)
      const onMessage = (e: MessageEvent) => {
        if (e.origin !== window.location.origin) return;
        popup?.close();
        window.removeEventListener('message', onMessage);
        // Toast is shown on dashboard after redirect from QuickBooksConnect
      };

      window.addEventListener('message', onMessage);
    } catch (err: any) {
      const msg =
        err instanceof Error ? err.message : 'Error connecting QuickBooks';
      console.error(msg);
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { connectQuickBooks, isLoading, error };
}
