import { User } from '@/common/types/user';
import React from 'react';

export interface SignupRequest {
  email: string;
  password: string;
  username?: string;
  firstname?: string;
  lastname?: string;
}

/** Returned when Identity Platform password OK but email OTP is required. */
export interface IdentityMfaPending {
  mfaRequired: true;
  challengeId: string;
  emailHint: string;
  idToken: string;
  expiresInSec?: number;
  /** Seconds until resend is allowed; UI should countdown from this. */
  resendAvailableInSec?: number;
}

export type LoginResult = true | IdentityMfaPending;

export interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  verifyIdentityMfa: (
    challengeId: string,
    code: string,
    idToken: string
  ) => Promise<boolean>;
  resendIdentityMfa: (
    challengeId: string,
    idToken: string
  ) => Promise<IdentityMfaPending>;
  logout: () => Promise<void>;
  checkAuth: (options?: { silent?: boolean }) => Promise<boolean>;
  googleAuth: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  updatePassword: (password: string, token: string) => Promise<boolean>;
}
