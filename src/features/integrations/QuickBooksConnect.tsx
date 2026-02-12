// src/integrations/quickbooks/QuickBooksConnectPage.tsx
import { getQuickBooksStatus } from '@/api/quickbooks/auth/qbo';
import { withTokenRefresh } from '@/api/quickbooks/auth/utils';
import SubmitButton from '@/common/components/form/SubmitButton';
import { LoadingOverlay } from '@/common/components/loading/LoadingOverlay';
import { UserContext } from '@/common/contexts/UserContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/common/components/ui/card';
import { useQuickBooksConnect } from '@/common/hooks/useQuickBooksIntegration/useQuickBooksIntegration';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE =
  import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5050';

export default function QuickBooksConnectPage() {
  const { connectQuickBooks, isLoading, error } = useQuickBooksConnect();
  const [connected, setConnected] = useState<boolean | null>(null);
  const { user, isLoading: authLoading } = useContext(UserContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const successHandledRef = useRef(false);

  // OAuth callback: backend redirects here (popup or main window) with success params.
  useEffect(() => {
    const success =
      searchParams.get('quickbooks') === 'connected' ||
      searchParams.get('quickbooks_connected') === '1' ||
      searchParams.get('success') === '1';
    if (!success || successHandledRef.current) return;
    successHandledRef.current = true;

    if (window.opener) {
      // Popup flow: post to opener so it shows toast and navigates
      window.opener.postMessage({ success: true }, window.location.origin);
      window.close();
    } else {
      // Main-window redirect: show toast and stay on QuickBooks page (clean URL)
      setConnected(true);
      toast.success('QuickBooks is connected. You can use it for invoicing and customers.');
      navigate('/integrations/quickbooks', { replace: true });
    }
  }, [searchParams, navigate]);

  // Redirect non‑admins away
  useEffect(() => {
    if (!authLoading && user?.role !== 'admin') {
      toast.error('You do not have permission to access this page.');
      navigate('/');
    }
  }, [authLoading, user, navigate]);

  // Fetch initial connection status
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { connected: isConn } =
          await withTokenRefresh(getQuickBooksStatus);
        if (alive) setConnected(isConn);
      } catch (err) {
        console.error('Could not load QuickBooks status', err);
        if (alive) setConnected(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Show errors from the hook
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // Listen for the popup's postMessage
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      // Get allowed origins from environment or use defaults
      const frontendUrl =
        import.meta.env.VITE_APP_FRONTEND_URL || window.location.origin;
      const backendUrl =
        import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5050';

      // Extract origin from URLs
      const frontendOrigin = new URL(frontendUrl).origin;
      const backendOrigin = new URL(backendUrl).origin;

      // Only accept messages from your frontend or backend origins
      if (e.origin !== frontendOrigin && e.origin !== backendOrigin) {
        return;
      }
      if (e.data?.success) {
        if (successHandledRef.current) return;
        successHandledRef.current = true;
        setConnected(true);
        toast.success('QuickBooks is connected. You can use it for invoicing and customers.');
        navigate('/integrations/quickbooks', { replace: true });
      } else {
        toast.error('QuickBooks connection failed');
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const handleClick = useCallback(async () => {
    if (isLoading) return;

    if (!connected) {
      // Connect flow
      await connectQuickBooks();
      return;
    }

    // Disconnect flow
    try {
      const res = await fetch(`${API_BASE}/quickbooks/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Disconnect failed');
      }

      setConnected(false);
      toast.info('QuickBooks disconnected');
    } catch (err: any) {
      console.error('Disconnect error:', err);
      toast.error(err.message || 'Could not disconnect QuickBooks');
    }
  }, [connected, connectQuickBooks, isLoading]);

  // Loading: single indicator centered in the viewport
  if (connected === null) {
    return (
      <div className='min-h-[60vh] relative'>
        <LoadingOverlay isLoading={true} />
      </div>
    );
  }

  // Loaded: content higher on page, in a card
  return (
    <div className='px-4 pt-6 pb-8'>
      <div className='max-w-[480px] mx-auto'>
        <Card>
          <CardHeader className='space-y-1.5'>
            <CardTitle className='text-2xl'>QuickBooks Integration</CardTitle>
            <CardDescription>
              {connected
                ? 'Your QuickBooks account is connected.'
                : 'QuickBooks is currently disconnected.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SubmitButton onClick={handleClick} disabled={isLoading}>
              {isLoading
                ? connected
                  ? 'Disconnecting…'
                  : 'Connecting…'
                : connected
                  ? 'Disconnect QuickBooks'
                  : 'Connect QuickBooks'}
            </SubmitButton>
          </CardContent>
        </Card>
      </div>

      <ToastContainer position='top-right' newestOnTop closeOnClick />
    </div>
  );
}
