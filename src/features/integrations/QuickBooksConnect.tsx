import { API_CONFIG } from '@/api/config';
import { getQuickBooksStatus, type QuickBooksCompany } from '@/api/quickbooks/auth/qbo';
import { withTokenRefresh } from '@/api/quickbooks/auth/utils';
import SubmitButton from '@/common/components/form/SubmitButton';
import { Card, CardContent } from '@/common/components/ui/card';
import { UserContext } from '@/common/contexts/UserContext';
import { useQuickBooksConnect } from '@/common/hooks/useQuickBooksIntegration/useQuickBooksIntegration';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  FileText,
  Link2,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Unplug,
  Users,
} from 'lucide-react';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = API_CONFIG.baseUrl.replace(/\/$/, '');

export default function QuickBooksConnectPage() {
  const { connectQuickBooks, isLoading, error } = useQuickBooksConnect();
  const [connected, setConnected] = useState<boolean | null>(null);
  const [company, setCompany] = useState<QuickBooksCompany | null>(null);
  const [companyDetailsUnavailable, setCompanyDetailsUnavailable] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user, isLoading: authLoading } = useContext(UserContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const successHandledRef = useRef(false);

  const loadStatus = useCallback(async (showToast = false) => {
    setIsRefreshing(true);
    try {
      const status = await withTokenRefresh(getQuickBooksStatus);
      setConnected(status.connected);
      setCompany(status.company);
      setCompanyDetailsUnavailable(Boolean(status.companyDetailsUnavailable));
      if (showToast) toast.success('QuickBooks connection refreshed');
    } catch (statusError) {
      console.error('Could not load QuickBooks status', statusError);
      setConnected(false);
      setCompany(null);
      if (showToast) toast.error('Could not refresh QuickBooks connection');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const success =
      searchParams.get('quickbooks') === 'connected' ||
      searchParams.get('quickbooks_connected') === '1' ||
      searchParams.get('success') === '1';
    if (!success || successHandledRef.current) return;
    successHandledRef.current = true;
    if (window.opener) {
      window.opener.postMessage({ success: true }, window.location.origin);
      window.close();
    } else {
      toast.success('QuickBooks is connected.');
      navigate('/integrations/quickbooks', { replace: true });
      void loadStatus();
    }
  }, [loadStatus, navigate, searchParams]);

  useEffect(() => {
    if (!authLoading && user?.role !== 'admin') {
      toast.error('You do not have permission to access this page.');
      navigate('/');
    }
  }, [authLoading, navigate, user]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const frontendOrigin = new URL(
        import.meta.env.VITE_APP_FRONTEND_URL || window.location.origin
      ).origin;
      const backendOrigin = new URL(
        import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5050'
      ).origin;
      if (event.origin !== frontendOrigin && event.origin !== backendOrigin) return;
      if (event.data?.success) {
        if (successHandledRef.current) return;
        successHandledRef.current = true;
        toast.success('QuickBooks is connected.');
        void loadStatus();
      } else {
        toast.error('QuickBooks connection failed');
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [loadStatus]);

  const handleConnectionAction = useCallback(async () => {
    if (isLoading) return;
    if (!connected) {
      await connectQuickBooks();
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/quickbooks/disconnect`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error((await response.text()) || 'Disconnect failed');
      setConnected(false);
      setCompany(null);
      toast.info('QuickBooks disconnected');
    } catch (disconnectError) {
      console.error('Disconnect error:', disconnectError);
      toast.error(disconnectError instanceof Error ? disconnectError.message : 'Could not disconnect QuickBooks');
    }
  }, [connectQuickBooks, connected, isLoading]);

  if (connected === null) {
    return (
      <div className='flex min-h-[60vh] items-center justify-center px-6'>
        <div className='flex flex-col items-center gap-4 text-center'>
          <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2ca01c]/10'>
            <Loader2 className='h-7 w-7 animate-spin text-[#2ca01c]' />
          </div>
          <div>
            <p className='font-semibold text-slate-900'>Checking QuickBooks</p>
            <p className='mt-1 text-sm text-slate-500'>Loading your connection details…</p>
          </div>
        </div>
      </div>
    );
  }

  const benefits = [
    { Icon: Users, label: 'Verify linked customers' },
    { Icon: FileText, label: 'Create and track invoices' },
    { Icon: ShieldCheck, label: 'Keep accounting access secure' },
  ];

  return (
    <div className='min-h-full bg-slate-50/60 px-4 py-8 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-5xl space-y-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <div className='mb-2 flex items-center gap-2 text-sm font-medium text-slate-500'>
              <Link2 className='h-4 w-4' /> Integrations
            </div>
            <h1 className='text-3xl font-bold tracking-tight text-slate-950'>QuickBooks</h1>
            <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-600'>
              Keep customer and billing information connected to your accounting workspace.
            </p>
          </div>
          {connected && (
            <button
              type='button'
              onClick={() => void loadStatus(true)}
              disabled={isRefreshing}
              className='inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60'
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh connection
            </button>
          )}
        </div>

        <Card className='overflow-hidden border-slate-200 shadow-sm'>
          <div className={`h-1.5 ${connected ? 'bg-[#2ca01c]' : 'bg-slate-300'}`} />
          <CardContent className='p-0'>
            <div className='grid lg:grid-cols-[1.35fr_0.65fr]'>
              <div className='p-6 sm:p-8'>
                <div className='flex flex-col gap-5 sm:flex-row sm:items-start'>
                  <div className='flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#2ca01c] text-2xl font-bold text-white shadow-sm'>qb</div>
                  <div className='min-w-0 flex-1'>
                    <div className='flex flex-wrap items-center gap-3'>
                      <h2 className='text-xl font-semibold text-slate-950'>QuickBooks Online</h2>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${connected ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
                        {connected ? <CheckCircle2 className='h-3.5 w-3.5' /> : <Unplug className='h-3.5 w-3.5' />}
                        {connected ? 'Connected' : 'Not connected'}
                      </span>
                    </div>
                    {connected ? (
                      <div className='mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4'>
                        <div className='flex items-start gap-3'>
                          <div className='mt-0.5 rounded-lg bg-white p-2 shadow-sm ring-1 ring-slate-200'><Building2 className='h-5 w-5 text-slate-600' /></div>
                          <div className='min-w-0'>
                            <p className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Connected company</p>
                            <p className='mt-1 truncate text-lg font-semibold text-slate-900'>{company?.name || 'QuickBooks company'}</p>
                            {company?.legalName && company.legalName !== company.name && <p className='mt-0.5 text-sm text-slate-500'>{company.legalName}</p>}
                            {(company?.email || company?.country) && <p className='mt-2 text-sm text-slate-500'>{[company.email, company.country].filter(Boolean).join(' · ')}</p>}
                          </div>
                        </div>
                        {companyDetailsUnavailable && <div className='mt-3 flex items-center gap-2 text-xs text-amber-700'><AlertCircle className='h-4 w-4' />Company details are temporarily unavailable.</div>}
                      </div>
                    ) : (
                      <p className='mt-4 max-w-xl text-sm leading-6 text-slate-600'>Connect your organization to verify customer links and keep accounting records aligned with the CRM.</p>
                    )}
                  </div>
                </div>
              </div>
              <div className='border-t border-slate-200 bg-slate-50/80 p-6 sm:p-8 lg:border-l lg:border-t-0'>
                <p className='text-sm font-semibold text-slate-900'>What this connection enables</p>
                <ul className='mt-4 space-y-3'>
                  {benefits.map(({ Icon, label }) => (
                    <li key={label} className='flex items-center gap-3 text-sm text-slate-600'>
                      <span className='flex h-7 w-7 items-center justify-center rounded-full bg-white ring-1 ring-slate-200'><Icon className='h-4 w-4 text-[#2ca01c]' /></span>
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className='flex flex-col-reverse gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between'>
          <p className='flex items-center gap-2 text-xs text-slate-500'><ShieldCheck className='h-4 w-4' />Your QuickBooks credentials are never displayed or stored in the browser.</p>
          <SubmitButton onClick={handleConnectionAction} disabled={isLoading}>
            {isLoading ? <span className='inline-flex items-center gap-2'><Loader2 className='h-4 w-4 animate-spin' />Please wait…</span> : connected ? 'Disconnect QuickBooks' : <span className='inline-flex items-center gap-2'>Connect QuickBooks <ArrowRight className='h-4 w-4' /></span>}
          </SubmitButton>
        </div>
      </div>
      <ToastContainer position='top-right' newestOnTop closeOnClick />
    </div>
  );
}
