import {
  fireEvent,
  render,
  screen,
  waitFor,
  cleanup,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { UserContext } from '@/common/contexts/UserContext';
import type { UserContextType } from '@/common/types/auth';
import AcceptInvite from '@/features/auth/AcceptInvite';
import ChooseOrganization from '@/features/auth/ChooseOrganization';

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  enter: vi.fn(),
  select: vi.fn(),
  load: vi.fn(),
  setUser: vi.fn(),
}));
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: mocks.signIn,
  signOut: mocks.signOut,
}));
vi.mock('@/lib/firebase', () => ({ getFirebaseAuth: () => ({}) }));
vi.mock('@/api/organizationContext', async (original) => ({
  ...(await original<object>()),
  enterOrganization: mocks.enter,
}));
vi.mock('@/common/components/brand/Sokana360Logo', () => ({
  AuthFormLogo: () => <div>Brand</div>,
}));
const fetchMock = vi.fn();
const A = { id: 'org-a', slug: 'first-org', name: 'First Organization' };
const B = { id: 'org-b', slug: 'sokana360', name: 'Sokana 360' };
const preview = {
  email: 'doula@example.test',
  firstname: 'Dana',
  lastname: 'Doula',
  role: 'doula',
  organizationName: B.name,
  requiresSignIn: true,
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status });
function mount(element: React.ReactNode, path: string) {
  return render(
    <UserContext.Provider
      value={{
        ...({} as UserContextType),
        user: null,
        setUser: mocks.setUser,
        organizations: [A, B],
        loadOrganizations: mocks.load,
        selectOrganization: mocks.select,
      }}
    >
      <MemoryRouter initialEntries={[path]}>{element}</MemoryRouter>
    </UserContext.Provider>
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
  mocks.signOut.mockResolvedValue(undefined);
  mocks.signIn.mockResolvedValue({
    user: { getIdToken: async () => 'owner-id-token' },
  });
  mocks.select.mockResolvedValue(undefined);
  mocks.load.mockResolvedValue([A, B]);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('invitation ownership', () => {
  it('signs in an existing account and accepts with its ID token, never a new password or old cookie', async () => {
    fetchMock.mockImplementation(async (url: string) =>
      json(
        url.includes('preview')
          ? preview
          : url.includes('accept')
            ? { requiresEmailVerification: false }
            : {}
      )
    );
    mount(<AcceptInvite />, '/accept-invite?token=invitation');
    fireEvent.change(await screen.findByLabelText('Existing password'), {
      target: { value: 'existing-password' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Sign in and accept invitation' })
    );
    expect(
      await screen.findByText(/Your invitation to Sokana 360 is accepted/)
    ).toBeInTheDocument();
    expect(mocks.signIn).toHaveBeenCalledWith(
      expect.anything(),
      preview.email,
      'existing-password'
    );
    const [, init] = fetchMock.mock.calls.find(([url]) =>
      url.includes('/invitations/accept')
    )!;
    expect(JSON.parse(init.body)).toEqual({
      token: 'invitation',
      idToken: 'owner-id-token',
    });
    expect(init.credentials).toBe('omit');
    expect(mocks.signOut).toHaveBeenCalled();
    expect(mocks.setUser).toHaveBeenCalledWith(null);
    expect(
      screen.queryByText(/Check your verification email/)
    ).not.toBeInTheDocument();
  });

  it('keeps the invitation pending when the existing password is incorrect', async () => {
    fetchMock.mockResolvedValue(json(preview));
    mocks.signIn.mockRejectedValue(
      Object.assign(new Error('bad password'), {
        code: 'auth/invalid-credential',
      })
    );
    mount(<AcceptInvite />, '/accept-invite?token=invitation');
    fireEvent.change(await screen.findByLabelText('Existing password'), {
      target: { value: 'wrong-password' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Sign in and accept invitation' })
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Check your existing password'
    );
    expect(
      fetchMock.mock.calls.filter(([url]) =>
        url.includes('/invitations/accept')
      )
    ).toHaveLength(0);
  });

  it('preserves new-account provisioning and verification instructions', async () => {
    fetchMock.mockImplementation(async (url: string) =>
      json(
        url.includes('preview')
          ? { ...preview, requiresSignIn: false }
          : { requiresEmailVerification: true }
      )
    );
    mount(<AcceptInvite />, '/accept-invite?token=new-invitation');
    fireEvent.change(await screen.findByLabelText('Choose a password'), {
      target: { value: 'new-password' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Accept invitation', exact: true })
    );
    expect(
      await screen.findByText(/Check your verification email/)
    ).toBeInTheDocument();
    const [, init] = fetchMock.mock.calls.find(([url]) =>
      url.includes('/invitations/accept')
    )!;
    expect(JSON.parse(init.body)).toEqual({
      token: 'new-invitation',
      password: 'new-password',
    });
    expect(mocks.signIn).not.toHaveBeenCalled();
  });
});

describe('organization chooser', () => {
  it('shows authorized organizations and reloads into the selected workspace', async () => {
    mount(
      <ChooseOrganization />,
      '/choose-organization?next=%2Fdoula-dashboard'
    );
    fireEvent.click(await screen.findByRole('button', { name: B.name }));
    await waitFor(() =>
      expect(mocks.enter).toHaveBeenCalledWith('/doula-dashboard')
    );
    expect(mocks.select).toHaveBeenCalledWith(B.id);
  });
  it('does not navigate when access to an organization was revoked', async () => {
    mocks.select.mockRejectedValue(
      new Error('This organization is no longer available.')
    );
    mount(<ChooseOrganization />, '/choose-organization');
    fireEvent.click(await screen.findByRole('button', { name: B.name }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'no longer available'
    );
    expect(mocks.enter).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: A.name })).toBeEnabled();
  });
  it('ignores external redirect destinations', async () => {
    mount(
      <ChooseOrganization />,
      '/choose-organization?next=https%3A%2F%2Fexample.com'
    );
    fireEvent.click(await screen.findByRole('button', { name: B.name }));
    await waitFor(() => expect(mocks.enter).toHaveBeenCalledWith('/'));
  });
});
