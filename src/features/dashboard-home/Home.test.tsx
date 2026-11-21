import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Home from './Home';
import { getDoulaDocuments, getDoulaProfile } from '@/api/doulas/doulaService';
import { useUser } from '@/common/hooks/user/useUser';

vi.mock('@/api/doulas/doulaService', () => ({
  getDoulaDocuments: vi.fn(),
  getDoulaProfile: vi.fn(),
}));
vi.mock('@/common/hooks/user/useUser', () => ({ useUser: vi.fn() }));
vi.mock('@/common/hooks/auth/useIsClientPortalUser', () => ({
  useIsClientPortalUser: () => ({
    isClientPortalUser: false,
    isLoading: false,
  }),
}));
vi.mock('./components/CalendarWidget', () => ({
  CalendarWidget: () => <h2>Due date calendar</h2>,
}));
vi.mock('./components/StatsOverview', () => ({ StatsOverview: () => null }));

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/doula-dashboard/profile' element={<h1>Profile</h1>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('doula dashboard onboarding', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useUser).mockReturnValue({
      user: { role: 'doula' },
      isLoading: false,
    });
  });

  it.each([
    ['active', false],
    ['pending', true],
  ])(
    'opens Profile when account status is %s and documents are ready: %s',
    async (accountStatus, documentsReady) => {
      vi.mocked(getDoulaProfile).mockResolvedValue({
        account_status: accountStatus,
      });
      vi.mocked(getDoulaDocuments).mockResolvedValue({
        completeness: { can_be_active: documentsReady },
      });

      renderDashboard();

      expect(
        await screen.findByRole('heading', { name: 'Profile' })
      ).toBeVisible();
      expect(
        screen.queryByRole('heading', { name: 'Due date calendar' })
      ).toBeNull();
    }
  );

  it('shows the calendar when onboarding is complete', async () => {
    vi.mocked(getDoulaProfile).mockResolvedValue({ account_status: 'active' });
    vi.mocked(getDoulaDocuments).mockResolvedValue({
      completeness: { can_be_active: true },
    });

    renderDashboard();

    expect(
      await screen.findByRole('heading', { name: 'Due date calendar' })
    ).toBeVisible();
  });
});
