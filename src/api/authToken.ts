/**
 * Token provider: read Supabase session after sign-in and return access_token.
 * Persist/refresh: Supabase client uses persistSession + autoRefreshToken; getSession()
 * returns the current (possibly refreshed) session.
 */

import { API_CONFIG } from './config';

export type GetToken = () => Promise<string | null>;

async function getSupabaseToken(): Promise<string | null> {
  try {
    const { supabase } = await import('@/lib/supabase');
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  } catch {
    return null;
  }
}

export async function getAuthToken(): Promise<string | null> {
  if (API_CONFIG.authMode === 'cookie') return null;
  return getSupabaseToken();
}
