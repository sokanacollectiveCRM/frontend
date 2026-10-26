import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import AcceptInvite from '@/features/auth/AcceptInvite';
import { signInWithEmailAndPassword } from 'firebase/auth';
vi.mock('firebase/auth', () => ({ signInWithEmailAndPassword: vi.fn() }));
vi.mock('@/lib/firebase', () => ({ getFirebaseAuth: () => ({}) }));
vi.mock('@/api/http', () => ({ buildUrl: (p: string) => p }));
const fetchMock = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());
it('accepts an organization invitation using the existing login without sending or changing its password', async () => {
  fetchMock
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        email: 'member@example.test',
        firstname: 'Member',
        lastname: 'Fixture',
        role: 'doula',
        organizationName: 'Organization B',
        existingAccount: true,
      }),
    })
    .mockResolvedValueOnce({ ok: true, json: async () => ({}) });
  vi.mocked(signInWithEmailAndPassword).mockResolvedValue({
    user: { getIdToken: async () => 'verified-id-token' },
  } as never);
  render(
    <MemoryRouter initialEntries={['/accept-invite?token=one-time-invite']}>
      <AcceptInvite />
    </MemoryRouter>
  );
  const password = await screen.findByLabelText('Password');
  expect(
    screen.getByRole('link', { name: /Forgot your password/ })
  ).toHaveAttribute(
    'href',
    '/forgot-password?email=member%40example.test&invitation=one-time-invite'
  );
  expect(password).toHaveAttribute('autocomplete', 'current-password');
  fireEvent.change(password, { target: { value: 'existing-password' } });
  fireEvent.click(
    screen.getByRole('button', { name: 'Sign in and accept invitation' })
  );
  await waitFor(() =>
    expect(fetchMock).toHaveBeenCalledWith(
      '/auth/invitations/accept',
      expect.objectContaining({
        body: JSON.stringify({
          token: 'one-time-invite',
          idToken: 'verified-id-token',
        }),
      })
    )
  );
  expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
    expect.anything(),
    'member@example.test',
    'existing-password'
  );
  expect(
    await screen.findByText(/Your invitation is accepted/)
  ).toBeInTheDocument();
});
