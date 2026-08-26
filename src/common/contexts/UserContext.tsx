import type {
  IdentityMfaPending,
  LoginResult,
  UserContextType,
} from '@/common/types/auth';
import { logFailure } from '@/utils/safeLog';
import { User } from '@/common/types/user';
import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { buildUrl, fetchWithAuth } from '@/api/http';
import { ApiError } from '@/api/errors';
import { API_CONFIG } from '@/api/config';
import {
  clearSessionAccessToken,
  setSessionAccessToken,
} from '@/api/sessionAccessToken';
import { useIdleTimeout } from '@/common/hooks/auth/useIdleTimeout';
import { getFirebaseAuth } from '@/lib/firebase';
import { supabase } from '@/lib/supabase';
import {
  confirmPasswordReset,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  isLoading: false,
  login: async () => false as unknown as LoginResult,
  verifyIdentityMfa: async () => false,
  resendIdentityMfa: async () => {
    throw new Error('Not implemented');
  },
  logout: async () => {},
  checkAuth: async () => false,
  googleAuth: async () => {},
  requestPasswordReset: async () => false,
  updatePassword: async () => false,
});

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({
  children,
}: UserProviderProps): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = async (): Promise<void> => {
    try {
      if (API_CONFIG.authMode === 'supabase') {
        await supabase.auth.signOut();
      }
      if (API_CONFIG.authMode === 'identity') {
        try {
          await signOut(getFirebaseAuth());
        } catch {
          // ignore Firebase sign-out failures; clear local session anyway
        }
      }
      const response = await fetch(buildUrl('/auth/logout'), {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Logout failed');
    } catch {
      logFailure('auth', 'logout_error');
    } finally {
      clearSessionAccessToken();
      setUser(null);
      window.location.href = '/login';
    }
  };

  const checkAuth = async (options?: {
    silent?: boolean;
  }): Promise<boolean> => {
    if (!options?.silent) {
      setIsLoading(true);
    }
    try {
      // /auth/me is an unwrapped user object — do not use canonical get().
      const response = await fetchWithAuth(buildUrl('/auth/me'));
      if (!response.ok) throw new Error('Auth check failed');
      const userData = await response.json();
      setUser(userData);
      return true;
    } catch (err) {
      setUser(null);
      // Let login flow show actionable backend/network errors
      if (
        err instanceof ApiError &&
        (err.options?.code === 'NETWORK_ERROR' ||
          err.options?.code === 'MISSING_BACKEND_URL')
      ) {
        throw err;
      }
      return false;
    } finally {
      if (!options?.silent) {
        setIsLoading(false);
      }
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<LoginResult> => {
    try {
      if (API_CONFIG.authMode === 'identity') {
        const auth = getFirebaseAuth();
        // Clear stale persisted Firebase sessions (password resets / prior failed
        // logins otherwise trigger accounts:lookup 400 on init).
        try {
          await signOut(auth);
        } catch {
          // ignore
        }
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await cred.user.getIdToken(true);
        const response = await fetch(buildUrl('/auth/session'), {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(
            (data as { error?: string })?.error || 'Login failed'
          );
        }
        if ((data as { mfaRequired?: boolean }).mfaRequired) {
          return {
            mfaRequired: true,
            challengeId: String((data as { challengeId: string }).challengeId),
            emailHint: String((data as { emailHint?: string }).emailHint || ''),
            idToken,
            expiresInSec: (data as { expiresInSec?: number }).expiresInSec,
            resendAvailableInSec: (data as { resendAvailableInSec?: number })
              .resendAvailableInSec,
          };
        }
        throw new Error('Unexpected login response');
      }

      if (API_CONFIG.authMode === 'supabase') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw new Error(error.message);
        if (!data.session) throw new Error('No session after sign in');
        setSessionAccessToken(data.session.access_token);
        await checkAuth();
        return true;
      }
      // Backend: POST /auth/login, body { email, password }; success: { message, user, token } + Set-Cookie sb-access-token
      const response = await fetch(buildUrl('/auth/login'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error((data as { error?: string })?.error || 'Login failed');
      }
      // Phones often block the cross-site session cookie. The JSON token is the
      // fallback: fetchWithAuth sends it as Bearer + X-Session-Token.
      const token =
        typeof (data as { token?: unknown }).token === 'string'
          ? (data as { token: string }).token.trim()
          : '';
      if (token) {
        setSessionAccessToken(token);
      }
      const sessionOk = await checkAuth();
      if (!sessionOk) {
        clearSessionAccessToken();
        throw new Error(
          'Signed in, but the session could not be verified. If you are on a phone, confirm the API URL is reachable (not localhost) and that cookies are allowed.'
        );
      }
      return true;
    } catch (error) {
      logFailure('auth', 'login_error');
      // Surface actionable message for "Failed to fetch" (Supabase or backend)
      if (
        error instanceof ApiError &&
        (error.options?.code === 'NETWORK_ERROR' ||
          error.options?.code === 'MISSING_BACKEND_URL')
      ) {
        throw error;
      }
      if (
        error instanceof TypeError &&
        (error.message === 'Failed to fetch' || error.message === 'Load failed')
      ) {
        throw new Error(
          API_CONFIG.authMode === 'identity'
            ? 'Network error. Is the backend running at VITE_APP_BACKEND_URL (default http://localhost:5050)?'
            : 'Network error. Check: (1) Supabase URL and anon key (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY), (2) Backend URL (VITE_APP_BACKEND_URL or VITE_API_BASE_URL) and CORS.'
        );
      }
      throw error;
    }
  };

  const verifyIdentityMfa = async (
    challengeId: string,
    code: string,
    idToken: string
  ): Promise<boolean> => {
    const response = await fetch(buildUrl('/auth/mfa/verify'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, code, idToken }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        (data as { error?: string })?.error || 'Verification failed'
      );
    }
    const token =
      typeof (data as { token?: unknown }).token === 'string'
        ? (data as { token: string }).token.trim()
        : idToken;
    setSessionAccessToken(token);
    const sessionOk = await checkAuth();
    if (!sessionOk) {
      clearSessionAccessToken();
      throw new Error('Code accepted, but session could not be verified.');
    }
    return true;
  };

  const resendIdentityMfa = async (
    challengeId: string,
    idToken: string
  ): Promise<IdentityMfaPending> => {
    const response = await fetch(buildUrl('/auth/mfa/resend'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, idToken }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        (data as { error?: string })?.error || 'Could not resend code'
      );
    }
    return {
      mfaRequired: true,
      challengeId: String((data as { challengeId: string }).challengeId),
      emailHint: String((data as { emailHint?: string }).emailHint || ''),
      idToken,
      expiresInSec: (data as { expiresInSec?: number }).expiresInSec,
      resendAvailableInSec: (data as { resendAvailableInSec?: number })
        .resendAvailableInSec,
    };
  };

  const googleAuth = async (): Promise<void> => {
    if (API_CONFIG.authMode === 'identity') {
      throw new Error(
        'Google sign-in is not enabled for Identity Platform login'
      );
    }
    try {
      const opts =
        API_CONFIG.authMode === 'supabase'
          ? { redirectTo: `${window.location.origin}/auth/callback` }
          : {};
      if (API_CONFIG.authMode === 'supabase') {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: opts,
        });
        if (error) throw new Error(error.message);
        return;
      }
      const response = await fetch(buildUrl('/auth/google'), {
        credentials: 'include',
      });
      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No authorization URL received');
      }
    } catch {
      logFailure('auth', 'google_auth_error');
      throw new Error('Failed to initialize Google authentication');
    }
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    try {
      if (API_CONFIG.authMode === 'identity') {
        // Firebase hosts the reset form at __/auth/action; continueUrl is only
        // the post-success landing page. Prefer the configured production
        // frontend even when reset was requested from localhost.
        const frontendUrl = (
          import.meta.env.VITE_APP_FRONTEND_URL || window.location.origin
        ).replace(/\/+$/, '');
        const continueUrl = `${frontendUrl}/login`;
        await sendPasswordResetEmail(getFirebaseAuth(), email.trim(), {
          url: continueUrl,
          handleCodeInApp: false,
        });
        return true;
      }

      const response = await fetchWithAuth(buildUrl('/auth/reset-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Password reset request failed');
      }

      return true;
    } catch (error) {
      logFailure('auth', 'password_reset_request_error');
      throw error;
    }
  };

  const updatePassword = async (
    password: string,
    accessToken: string
  ): Promise<boolean> => {
    try {
      if (API_CONFIG.authMode === 'identity') {
        // accessToken is the Firebase oobCode from the reset link.
        await confirmPasswordReset(getFirebaseAuth(), accessToken, password);
        try {
          await signOut(getFirebaseAuth());
        } catch {
          // ignore
        }
        return true;
      }

      const response = await fetchWithAuth(buildUrl('/auth/reset-password'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Password update failed');
      }

      return true;
    } catch (error) {
      logFailure('auth', 'password_update_error');
      throw error;
    }
  };

  useEffect(() => {
    void checkAuth();
  }, []);

  // After portal or OAuth sign-in, refresh /auth/me so user.role is authoritative.
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'INITIAL_SESSION') return;
      void checkAuth({ silent: true });
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Auto-logout on inactivity with warning
  const { showWarning, acknowledgeWarning } = useIdleTimeout(logout);

  const contextValue = {
    user,
    setUser,
    isLoading,
    login,
    verifyIdentityMfa,
    resendIdentityMfa,
    logout,
    checkAuth,
    googleAuth,
    requestPasswordReset,
    updatePassword,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
      {showWarning && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='bg-white text-gray-900 rounded-lg shadow-xl p-6 max-w-sm w-full space-y-4'>
            <h2 className='text-lg font-semibold'>Session expiring soon</h2>
            <p className='text-sm text-gray-600'>
              Your session is about to expire due to inactivity. Click below to
              stay logged in.
            </p>
            <div className='flex justify-end gap-3'>
              <button
                onClick={logout}
                className='px-3 py-2 rounded-md bg-red-600 text-white text-sm'
              >
                Logout now
              </button>
              <button
                onClick={acknowledgeWarning}
                className='px-3 py-2 rounded-md bg-blue-600 text-white text-sm'
              >
                Stay logged in
              </button>
            </div>
          </div>
        </div>
      )}
    </UserContext.Provider>
  );
}
