import { act, render, cleanup } from '@testing-library/react';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { UserProvider } from '@/common/contexts/UserContext';
import { useUser } from '@/common/hooks/user/useUser';
import type { UserContextType } from '@/common/types/auth';
import {
  getSelectedOrganization,
  setSelectedOrganization,
} from '@/api/organizationContext';

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  callback: null as null | ((user: unknown) => void),
}));
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (_auth: unknown, callback: (user: unknown) => void) => {
    mocks.callback = callback;
    callback(null);
    return () => {};
  },
  signOut: vi.fn(async () => {}),
  signInWithEmailAndPassword: mocks.signIn,
  confirmPasswordReset: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));
vi.mock('@/lib/firebase', () => ({
  getFirebaseAuth: () => ({
    currentUser: { getIdToken: async () => 'fresh-id-token' },
  }),
}));
vi.mock('@/common/hooks/auth/useIdleTimeout', () => ({
  useIdleTimeout: () => ({ showWarning: false, acknowledgeWarning: vi.fn() }),
}));
let context: UserContextType;
const Capture = () => {
  context = useUser();
  return null;
};
const fetchMock = vi.fn();
const A = { id: 'org-a', slug: 'first-org', name: 'First Organization' };
const B = { id: 'org-b', slug: 'sokana360', name: 'Sokana 360' };
const selectedUser = {
  id: 'doula-b',
  firstname: 'Dana',
  lastname: 'Doula',
  email: 'doula@example.test',
  role: 'doula',
  tenant: { ...B, role: 'doula' },
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status });
const selectionRequired = () =>
  json({ code: 'TENANT_SELECTION_REQUIRED', tenants: [A, B] }, 409);
beforeEach(() => {
  vi.clearAllMocks();
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  setSelectedOrganization(null);
});
afterEach(() => {
  cleanup();
  setSelectedOrganization(null);
  vi.unstubAllGlobals();
});

it('keeps a valid multi-organization session and waits for an explicit choice', async () => {
  fetchMock.mockImplementation(async () => selectionRequired());
  render(
    <UserProvider>
      <Capture />
    </UserProvider>
  );
  let ok = false;
  await act(async () => {
    ok = await context.checkAuth();
  });
  expect(ok).toBe(true);
  expect(context.user).toBeNull();
  expect(context.organizations).toEqual([A, B]);
  fetchMock.mockResolvedValueOnce(json(selectedUser));
  await act(async () => {
    await context.selectOrganization(B.id);
  });
  expect(context.user).toMatchObject({ id: 'doula-b', tenant: B });
  expect(getSelectedOrganization()).toBe(B.id);
  expect(fetchMock.mock.calls.at(-1)![1].headers).toEqual({
    'X-Tenant-Id': B.id,
  });
});

it('does not commit an unavailable organization or change the selected workspace', async () => {
  fetchMock.mockImplementation(async () => selectionRequired());
  render(
    <UserProvider>
      <Capture />
    </UserProvider>
  );
  await act(async () => {
    await context.loadOrganizations();
  });
  setSelectedOrganization(A.id);
  fetchMock.mockResolvedValueOnce(
    json({ error: 'Membership is inactive' }, 403)
  );
  await expect(context.selectOrganization(B.id)).rejects.toThrow(
    'Membership is inactive'
  );
  expect(getSelectedOrganization()).toBe(A.id);
  await expect(context.selectOrganization('unlisted')).rejects.toThrow(
    'Choose an available'
  );
});

it('restores a selected organization using its header on auth checks', async () => {
  setSelectedOrganization(B.id);
  fetchMock.mockResolvedValueOnce(json(selectedUser));
  render(
    <UserProvider>
      <Capture />
    </UserProvider>
  );
  await act(async () => {
    await context.checkAuth();
  });
  const headers = fetchMock.mock.calls[0][1].headers as Headers;
  expect(headers.get('X-Tenant-Id')).toBe(B.id);
  expect(context.user?.id).toBe('doula-b');
});

it('recovers from stale membership selection by requesting currently permitted organizations', async () => {
  setSelectedOrganization('revoked-org');
  fetchMock
    .mockResolvedValueOnce(json({ error: 'Forbidden' }, 403))
    .mockImplementationOnce(async () => selectionRequired());
  render(
    <UserProvider>
      <Capture />
    </UserProvider>
  );
  await act(async () => {
    await context.checkAuth();
  });
  expect(context.organizations).toEqual([A, B]);
  expect(context.user).toBeNull();
  expect(getSelectedOrganization()).toBeNull();
  expect(
    (fetchMock.mock.calls[1][1].headers as Headers).has('X-Tenant-Id')
  ).toBe(false);
});

it('completes MFA with a selection-required session rather than reporting login failure', async () => {
  fetchMock
    .mockResolvedValueOnce(json({}))
    .mockImplementationOnce(async () => selectionRequired());
  render(
    <UserProvider>
      <Capture />
    </UserProvider>
  );
  await act(async () => {
    expect(
      await context.verifyIdentityMfa('challenge', '123456', 'id-token')
    ).toBe(true);
  });
  expect(context.organizations).toEqual([A, B]);
  expect(context.user).toBeNull();
});

it('does not fetch a prior cookie session while password sign-in is waiting for MFA', async () => {
  mocks.signIn.mockResolvedValue({
    user: { getIdToken: async () => 'id-token' },
  });
  fetchMock.mockResolvedValueOnce(
    json({ mfaRequired: true, challengeId: 'challenge' })
  );
  render(
    <UserProvider>
      <Capture />
    </UserProvider>
  );
  await act(async () => {
    await context.login('doula@example.test', 'password');
  });
  await act(async () => {
    mocks.callback?.({ uid: 'new-user' });
  });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(context.organizations).toEqual([]);
});

it('ignores a late auth response from a previous login after sign-out', async () => {
  let respond: (response: Response) => void = () => {};
  fetchMock.mockImplementationOnce(
    () =>
      new Promise<Response>((resolve) => {
        respond = resolve;
      })
  );
  render(
    <UserProvider>
      <Capture />
    </UserProvider>
  );
  let checking: Promise<boolean>;
  await act(async () => {
    checking = context.checkAuth();
  });
  await act(async () => {
    mocks.callback?.(null);
  });
  await act(async () => {
    respond(json(selectedUser));
    await checking;
  });
  expect(context.user).toBeNull();
  expect(context.organizations).toEqual([]);
});
