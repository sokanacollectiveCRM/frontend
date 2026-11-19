import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { UserContext } from '@/common/contexts/UserContext';
import type { UserContextType } from '@/common/types/auth';
import { PrivateRoute, PublicOnlyRoute } from './ProtectedRoutes';
vi.mock('@/common/hooks/auth/useClientAuth', () => ({
  useClientAuth: () => ({ client: null, isLoading: false }),
}));
const Destination = () => <p>Choice destination: {useLocation().search}</p>;
afterEach(cleanup);
it.each(['/clients?view=active', '/login?next=%2Fhours'])(
  'routes multi-organization sessions to the chooser before protected content (%s)',
  async (path) => {
    render(
      <UserContext.Provider
        value={{
          ...({} as UserContextType),
          user: null,
          isLoading: false,
          organizations: [
            { id: 'org-a', slug: 'org-a', name: 'First Org' },
            { id: 'org-b', slug: 'org-b', name: 'Second Org' },
          ],
        }}
      >
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route element={<PrivateRoute />}>
              <Route path='/clients' element={<div>Private data</div>} />
            </Route>
            <Route element={<PublicOnlyRoute />}>
              <Route path='/login' element={<div>Password form</div>} />
            </Route>
            <Route path='/choose-organization' element={<Destination />} />
          </Routes>
        </MemoryRouter>
      </UserContext.Provider>
    );
    expect(await screen.findByText(/Choice destination:/)).toHaveTextContent(
      'next='
    );
    expect(screen.queryByText('Private data')).not.toBeInTheDocument();
    expect(screen.queryByText('Password form')).not.toBeInTheDocument();
  }
);
