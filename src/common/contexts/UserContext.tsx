import type { UserContextType } from '@/common/types/auth';
import { User } from '@/common/types/user';
import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { get, buildUrl } from '@/api/http';
import { ApiError } from '@/api/errors';
import { API_CONFIG } from '@/api/config';
import { useIdleTimeout } from '@/common/hooks/auth/useIdleTimeout';
import { supabase } from '@/lib/supabase';

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  isLoading: false,
  login: async () => false,
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
      const response = await fetch(buildUrl('/auth/logout'), {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Logout failed');
      setUser(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      window.location.href = '/login';
    }
  };

  const checkAuth = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (API_CONFIG.authMode === 'supabase') {
        const userData = await get<User>('/auth/me');
        setUser(userData);
        return true;
      }
      const response = await fetch(buildUrl('/auth/me'), {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Auth check failed');
      const userData = await response.json();
      setUser(userData);
      return true;
    } catch (err) {
      setUser(null);
      // Let login flow show actionable backend/network errors
      if (err instanceof ApiError && (err.options?.code === 'NETWORK_ERROR' || err.options?.code === 'MISSING_BACKEND_URL')) {
        throw err;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (API_CONFIG.authMode === 'supabase') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message);
        if (!data.session) throw new Error('No session after sign in');
        await checkAuth();
        return true;
      }
      const response = await fetch(buildUrl('/auth/login'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }
      await checkAuth();
      return true;
    } catch (error) {
      console.error('Login error:', error);
      // Surface actionable message for "Failed to fetch" (Supabase or backend)
      if (error instanceof ApiError && (error.options?.code === 'NETWORK_ERROR' || error.options?.code === 'MISSING_BACKEND_URL')) {
        throw error;
      }
      if (error instanceof TypeError && (error.message === 'Failed to fetch' || error.message === 'Load failed')) {
        throw new Error(
          'Network error. Check: (1) Supabase URL and anon key (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY), (2) Backend URL (VITE_API_URL) and CORS / Cloud Run invoker.'
        );
      }
      throw error;
    }
  };

  const googleAuth = async (): Promise<void> => {
    try {
      const opts = API_CONFIG.authMode === 'supabase'
        ? { redirectTo: `${window.location.origin}/auth/callback` }
        : {};
      if (API_CONFIG.authMode === 'supabase') {
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: opts });
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
    } catch (error) {
      console.error('Google auth error:', error);
      throw new Error('Failed to initialize Google authentication');
    }
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(buildUrl('/auth/reset-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        console.log(data);
        throw new Error(data.error || 'Password reset request failed');
      }

      return true;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  };

  const updatePassword = async (
    password: string,
    accessToken: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(buildUrl('/auth/reset-password'), {
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
      console.error('Password update error:', error);
      throw error;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Auto-logout on inactivity with warning
  const { showWarning, acknowledgeWarning } = useIdleTimeout(logout);

  const contextValue = {
    user,
    setUser,
    isLoading,
    login,
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
              Your session is about to expire due to inactivity. Click below to stay logged in.
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
