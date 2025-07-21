import { User } from '@/common/types/user';
import React from 'react';

export interface SignupRequest {
  email: string;
  password: string;
  username?: string;
  firstname?: string;
  lastname?: string;
}

export interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  googleAuth: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  updatePassword: (password: string, token: string) => Promise<boolean>;
}
