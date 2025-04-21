import type { UserContextType } from '@/common/types/auth';
import { User } from '@/common/types/auth';
import React, { createContext, ReactNode, useEffect, useState } from 'react';
import {
  useAuthHandlers
} from './user-handlers/authHandlers';
import { useUserDataFetcher } from './user-handlers/dataFetchers';

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  isLoading: false,
  isAuthenticated: false,
  login: async () => false,
  logout: async () => {},
  loadUser: async () => {},
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

  const {
    isAuthenticated,
    loadUser,
    login,
    logout,
    checkAuth,
    googleAuth,
    requestPasswordReset,
    updatePassword,
  } = useAuthHandlers(user, setUser, setIsLoading, buildUrl);

  const {
    getClients
  } = useUserDataFetcher(buildUrl);

  useEffect(() => {
    checkAuth();
  }, []);

  const contextValue = {
    user,
    setUser,
    isLoading,
    isAuthenticated,
    loadUser,
    login,
    logout,
    checkAuth,
    googleAuth,
    requestPasswordReset,
    updatePassword,
    getClients,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}
