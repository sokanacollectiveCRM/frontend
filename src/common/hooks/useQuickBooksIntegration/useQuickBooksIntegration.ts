// src/hooks/useQuickBooksConnect.ts
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { getQuickBooksAuthUrl } from '@/api/quickbooks/auth/route';

/**
 * Hook to initiate the QuickBooks OAuth pop-up flow.
 */
export function useQuickBooksConnect() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const connectQuickBooks = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // 1️⃣ Fetch the Intuit consent URL from backend (supports route variants).
      const url = await getQuickBooksAuthUrl();

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
