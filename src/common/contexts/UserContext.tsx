import type {
  IdentityMfaPending,
  LoginResult,
  UserContextType,
} from '@/common/types/auth';
import { logFailure } from '@/utils/safeLog';
import { User } from '@/common/types/user';
import React, {
  createContext,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { buildUrl, fetchWithAuth } from '@/api/http';
import {
  getSelectedOrganization,
  setSelectedOrganization,
  organizationChoices,
  type OrganizationChoice,
} from '@/api/organizationContext';
import { ApiError } from '@/api/errors';
import { clearSessionAccessToken } from '@/api/sessionAccessToken';
import { useIdleTimeout } from '@/common/hooks/auth/useIdleTimeout';
import { getFirebaseAuth } from '@/lib/firebase';
import {
  confirmPasswordReset,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

export const UserContext = createContext<UserContextType>({
  user: null,
  organizations: [],
  loadOrganizations: async () => [],
  selectOrganization: async () => {},
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
  const authenticationInProgress = useRef(false);
  const sessionGeneration = useRef(0);
  const [organizations, setOrganizations] = useState<OrganizationChoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const logout = async (): Promise<void> => {
    try {
      try {
        await signOut(getFirebaseAuth());
      } catch {
        // ignore Firebase sign-out failures; clear the API cookie anyway
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
      setSelectedOrganization(null);
      setOrganizations([]);
      setUser(null);
      window.location.href = '/login';
    }
  };

  const loadOrganizations = async (): Promise<OrganizationChoice[]> => {
    // Deliberately omit the tenant header to request all permitted memberships.
    const response = await fetch(buildUrl('/auth/me'), {
      credentials: 'include',
    });
    const data = await response.json();
    if (response.status === 409 && data.code === 'TENANT_SELECTION_REQUIRED') {
      const choices = organizationChoices(data.tenants);
      if (!choices.length) throw new Error('No organizations are available.');
      setOrganizations(choices);
      return choices;
    }
    if (!response.ok)
      throw new Error(data.error || 'Could not load organizations.');
    const choices = data.tenant ? organizationChoices([data.tenant]) : [];
    setOrganizations(choices);
    return choices;
  };

  const selectOrganization = async (id: string): Promise<void> => {
    if (!organizations.some((org) => org.id === id))
      throw new Error('Choose an available organization.');
    const response = await fetch(buildUrl('/auth/me'), {
      credentials: 'include',
      headers: { 'X-Tenant-Id': id },
    });
    const data = await response.json();
    if (!response.ok || data.tenant?.id !== id) {
      throw new Error(
        data.error || 'This organization is no longer available.'
      );
    }
    setSelectedOrganization(id);
    setUser(data);
  };

  const acceptSession = async (
    response: Response,
    generation = sessionGeneration.current
  ): Promise<boolean> => {
    const data = await response.json();
    if (generation !== sessionGeneration.current) return false;
    if (response.status === 409 && data.code === 'TENANT_SELECTION_REQUIRED') {
      const choices = organizationChoices(data.tenants);
      if (!choices.length) throw new Error('No organizations are available.');
      setSelectedOrganization(null);
      setUser(null);
      setOrganizations(choices);
      return true;
    }
    if (!response.ok) {
      setUser(null);
      setOrganizations([]);
      return false;
    }
    setUser(data);
    return true;
  };

  const checkAuth = async (options?: {
    silent?: boolean;
  }): Promise<boolean> => {
    const generation = sessionGeneration.current;
    if (!options?.silent) {
      setIsLoading(true);
    }
    try {
      // /auth/me is an unwrapped user object — do not use canonical get().
      let response = await fetchWithAuth(buildUrl('/auth/me'));
      if (response.status === 403 && getSelectedOrganization()) {
        setSelectedOrganization(null);
        response = await fetchWithAuth(buildUrl('/auth/me'));
      }
      return await acceptSession(response, generation);
    } catch (err) {
      if (generation !== sessionGeneration.current) return false;
      setUser(null);
      setOrganizations([]);
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
      sessionGeneration.current += 1;
      authenticationInProgress.current = true;
      setSelectedOrganization(null);
      setOrganizations([]);
      setUser(null);
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
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        mfaRequired?: boolean;
        challengeId?: string;
        emailHint?: string;
        expiresInSec?: number;
        resendAvailableInSec?: number;
      };
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      if (!data.mfaRequired || !data.challengeId) {
        throw new Error('Login did not start email verification');
      }
      return {
        mfaRequired: true,
        challengeId: data.challengeId,
        emailHint: data.emailHint || '',
        idToken,
        expiresInSec: data.expiresInSec,
        resendAvailableInSec: data.resendAvailableInSec,
      };
    } catch (error) {
      authenticationInProgress.current = false;
      logFailure('auth', 'login_error');
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
          'Network error. Could not reach the backend. Check VITE_APP_BACKEND_URL and confirm the backend is running.'
        );
      }
      throw error;
    }
  };

  const resolveIdentityIdToken = async (fallback: string): Promise<string> => {
    try {
      const auth = getFirebaseAuth();
      const current = auth.currentUser;
      if (current) {
        return await current.getIdToken(true);
      }
    } catch {
      // Fall back to the token captured at password sign-in.
    }
    return fallback;
  };

  const verifyIdentityMfa = async (
    challengeId: string,
    code: string,
    idToken: string
  ): Promise<boolean> => {
    const freshIdToken = await resolveIdentityIdToken(idToken);
    const response = await fetch(buildUrl('/auth/mfa/verify'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, code, idToken: freshIdToken }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        (data as { error?: string })?.error || 'Verification failed'
      );
    }

    const meResponse = await fetchWithAuth(buildUrl('/auth/me'), {
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${freshIdToken}`,
        'X-Session-Token': freshIdToken,
      },
    });
    authenticationInProgress.current = false;
    if (!(await acceptSession(meResponse))) {
      clearSessionAccessToken();
      throw new Error('Code accepted, but session could not be verified.');
    }
    return true;
  };

  const resendIdentityMfa = async (
    challengeId: string,
    idToken: string
  ): Promise<IdentityMfaPending> => {
    const freshIdToken = await resolveIdentityIdToken(idToken);
    const response = await fetch(buildUrl('/auth/mfa/resend'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, idToken: freshIdToken }),
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
      idToken: freshIdToken,
      expiresInSec: (data as { expiresInSec?: number }).expiresInSec,
      resendAvailableInSec: (data as { resendAvailableInSec?: number })
        .resendAvailableInSec,
    };
  };

  const googleAuth = async (): Promise<void> => {
    throw new Error('Google sign-in is not enabled');
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    try {
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
      // accessToken is the Firebase oobCode from the reset link.
      await confirmPasswordReset(getFirebaseAuth(), accessToken, password);
      try {
        await signOut(getFirebaseAuth());
      } catch {
        // ignore
      }
      return true;
    } catch (error) {
      logFailure('auth', 'password_update_error');
      throw error;
    }
  };

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const auth = getFirebaseAuth();
      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        void (async () => {
          const generation = ++sessionGeneration.current;
          if (!firebaseUser) {
            setUser(null);
            setOrganizations([]);
            setIsLoading(false);
            return;
          }
          if (authenticationInProgress.current) return;
          const sessionOk = await checkAuth({ silent: true });
          if (generation !== sessionGeneration.current) return;
          if (!sessionOk) {
            setUser(null);
          }
          setIsLoading(false);
        })();
      });
    } catch {
      setIsLoading(false);
    }
    return () => unsubscribe();
  }, []);

  // Auto-logout on inactivity with warning
  const { showWarning, acknowledgeWarning } = useIdleTimeout(logout);

  const contextValue = {
    user,
    organizations,
    loadOrganizations,
    selectOrganization,
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
