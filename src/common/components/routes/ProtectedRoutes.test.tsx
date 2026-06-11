import { UserContext } from '@/common/contexts/UserContext';
import { BillingPortalRoute, NonBillingOnlyRoute } from '@/common/components/routes/ProtectedRoutes';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/common/hooks/auth/useClientAuth', () => ({
  useClientAuth: vi.fn(() => ({ client: null, isLoading: false })),
}));

function renderWithUser(role: string, initialPath: string, element: ReactNode) {
  return render(
    <UserContext.Provider
      value={{
        user: {
          id: '1',
          firstname: 'Bill',
          lastname: 'User',
          email: 'billing@example.com',
          role,
        },
        setUser: vi.fn(),
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
        googleAuth: vi.fn(),
        requestPasswordReset: vi.fn(),
        updatePassword: vi.fn(),
      }}
    >
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>{element}</Routes>
      </MemoryRouter>
    </UserContext.Provider>
  );
}

describe('billing route guards', () => {
  it('redirects billing-only users away from full CRM routes', async () => {
    renderWithUser(
      'billing',
      '/clients',
      <>
        <Route element={<NonBillingOnlyRoute />}>
          <Route path='/clients' element={<div>Clients</div>} />
        </Route>
        <Route path='/billing/contracts' element={<div>Billing home</div>} />
      </>
    );

    expect(await screen.findByText('Billing home')).toBeInTheDocument();
    expect(screen.queryByText('Clients')).not.toBeInTheDocument();
  });

  it('shows access denied when a non-billing staff role opens the billing portal', async () => {
    renderWithUser(
      'doula',
      '/billing/contracts',
      <Route element={<BillingPortalRoute />}>
        <Route path='/billing/contracts' element={<div>Billing contracts</div>} />
      </Route>
    );

    expect(await screen.findByText('Access denied')).toBeInTheDocument();
    expect(screen.queryByText('Billing contracts')).not.toBeInTheDocument();
  });
});
