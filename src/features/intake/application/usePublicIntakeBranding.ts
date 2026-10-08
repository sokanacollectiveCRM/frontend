import { apiBaseUrl } from '@/config/env';
import { useEffect, useState } from 'react';

export type PublicIntakeBrandingResponse = {
  slug: string;
  name: string;
  branding: {
    displayName: string;
    logoPath: string;
    markPath: string | null;
    pageTitle: string;
    primaryColor: string;
    accentColor: string;
  };
};

type State =
  | { status: 'loading' }
  | { status: 'ready'; data: PublicIntakeBrandingResponse }
  | { status: 'error'; message: string };

export function usePublicIntakeBranding(tenantSlug: string): State {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    const slug = tenantSlug.trim();
    if (!slug) {
      setState({ status: 'error', message: 'Organization not found' });
      return;
    }

    setState({ status: 'loading' });

    void (async () => {
      try {
        const response = await fetch(
          `${apiBaseUrl}/requestService/public/${encodeURIComponent(slug)}`,
          { credentials: 'omit' }
        );
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        if (!response.ok) {
          if (!cancelled) {
            setState({
              status: 'error',
              message: body.error || 'Organization not found',
            });
          }
          return;
        }
        if (!cancelled) {
          setState({
            status: 'ready',
            data: body as PublicIntakeBrandingResponse,
          });
        }
      } catch {
        if (!cancelled) {
          setState({
            status: 'error',
            message: 'Unable to load this intake form.',
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tenantSlug]);

  return state;
}
