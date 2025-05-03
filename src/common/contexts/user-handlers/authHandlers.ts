import { User } from '@/common/types/auth';
import { Dispatch, SetStateAction } from 'react';

export function useAuthHandlers(
  user: User | null,
  setUser: Dispatch<SetStateAction<User | null>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  buildUrl: (url: string) => string) {

  const isAuthenticated = !!user;

  const loadUser = async () => { await checkAuth };

  const checkAuth = async (): Promise<boolean> => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(buildUrl('/auth/me'), {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Auth check failed');

      const userData = await response.json();
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
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

    const { token } = await response.json();
    localStorage.setItem('authToken', token);
    await checkAuth();
    return true;
  };

  const logout = async (): Promise<void> => {
    await fetch(buildUrl('/auth/logout'), {
      method: 'POST',
      credentials: 'include',
    });

    setUser(null);
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  const googleAuth = async (): Promise<void> => {
    const response = await fetch(buildUrl('/auth/google'), {
      credentials: 'include',
    });
    const { url } = await response.json();
    if (url) {
      window.location.href = url;
    } else {
      throw new Error('No authorization URL received');
    }
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    const response = await fetch(buildUrl('/auth/reset-password'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Password reset request failed');
    }

    return true;
  };

  const updatePassword = async (
    password: string,
    accessToken: string
  ): Promise<boolean> => {
    const response = await fetch(buildUrl('/auth/reset-password'), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Password update failed');
    }

    return true;
  };

  return {
    isAuthenticated,
    loadUser,
    login,
    logout,
    checkAuth,
    googleAuth,
    requestPasswordReset,
    updatePassword,
  };
}