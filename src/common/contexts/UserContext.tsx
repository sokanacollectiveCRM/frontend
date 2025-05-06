import type { UserContextType } from '@/common/types/auth';
import { User } from '@/common/types/user';
import React, { createContext, ReactNode, useEffect, useState } from 'react';
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
};

export function UserProvider({ children }: UserProviderProps): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const buildUrl = (endpoint: string): string =>
    `${import.meta.env.VITE_APP_BACKEND_URL.replace(/\/$/, '')}${endpoint}`;

  const checkAuth = async (): Promise<boolean> => {
    const token = localStorage.getItem('authToken');
    console.log('Token from localStorage:', token);

    try {
      const response = await fetch(buildUrl('/auth/me'), {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem('authToken');
        throw new Error('Auth check failed');
      }

      const userData = await response.json();
      console.log('User data:', userData);
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

  const login = async (email: string, password:string): Promise<boolean> => {
    try {
      const response = await fetch(buildUrl('/auth/login'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      const { token } = await response.json();
      console.log('Token received:', token);
      localStorage.setItem('authToken', token);
      await checkAuth();
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const response = await fetch(buildUrl('/auth/logout'), {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      setUser(null);
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const googleAuth = async (): Promise<void> => {
    try {
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

  const updatePassword = async (password:string , accessToken: string): Promise<boolean> => {
    try {
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
    } catch (error) {
      console.error('Password update error:', error);
      throw error;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

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
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}