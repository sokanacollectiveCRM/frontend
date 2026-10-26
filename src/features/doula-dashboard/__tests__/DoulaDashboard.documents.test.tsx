import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import DoulaDashboard from '../DoulaDashboard';
import { getDoulaDocuments } from '@/api/doulas/doulaService';
vi.mock('@/common/components/user/ProfileDropdown', () => ({
  ProfileDropdown: () => null,
}));
vi.mock('@/api/doulas/doulaService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/api/doulas/doulaService')>()),
  getDoulaProfile: vi.fn().mockResolvedValue({
    firstname: 'Test',
    lastname: 'Doula',
    address: 'Address',
    city: 'City',
    state: 'IL',
    zip_code: '60601',
    bio: 'Bio',
    phone_number: '3125550199',
  }),
  getDoulaDocuments: vi.fn(),
}));
beforeEach(() => vi.clearAllMocks());
it('flags missing and rejected required documents at the dashboard top and refreshes after changes', async () => {
  vi.mocked(getDoulaDocuments).mockResolvedValue({
    documents: [
      { documentType: 'w9', status: 'rejected' },
      { documentType: 'w9', status: 'approved' },
    ] as never,
    backgroundCheck: { status: 'not_cleared', setAt: null, setBy: null },
  });
  render(
    <MemoryRouter>
      <DoulaDashboard />
    </MemoryRouter>
  );
  expect(await screen.findByText(/Upload or replace:/)).toHaveTextContent(
    /W-9/
  );
  expect(screen.getByText(/Upload or replace:/)).toHaveTextContent(
    /Direct deposit/i
  );
  expect(
    screen.getByText(/awaiting HR\/payroll clearance/)
  ).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: 'Review Documents' })
  ).toHaveAttribute('href', '/doula-dashboard/profile?step=documents');
  expect(screen.queryByText(/liability insurance/i)).not.toBeInTheDocument();
  vi.mocked(getDoulaDocuments).mockResolvedValue({
    documents: ['training_certificate', 'w9', 'direct_deposit_form'].map(
      (documentType) => ({ documentType, status: 'uploaded' })
    ) as never,
    backgroundCheck: { status: 'cleared', setAt: null, setBy: null },
  });
  fireEvent(window, new Event('doula-documents-changed'));
  await waitFor(() =>
    expect(
      screen.queryByText('Required documents need attention')
    ).not.toBeInTheDocument()
  );
});
it('shows a retry path if document status cannot be loaded', async () => {
  vi.mocked(getDoulaDocuments).mockRejectedValue(new Error('offline'));
  render(
    <MemoryRouter>
      <DoulaDashboard />
    </MemoryRouter>
  );
  expect(
    await screen.findByText(/couldn’t check your documents/)
  ).toBeInTheDocument();
});
