import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import Teams from '@/features/teams/teams';
import { fetchWithAuth } from '@/api/http';
import {
  getAdminDoulaDocuments,
  partitionDoulaDocuments,
} from '@/api/doulas/doulaService';
vi.mock('@/common/contexts/UserContext', async () => {
  const { createContext } = await import('react');
  return { UserContext: createContext({ user: { role: 'admin' } }) };
});
vi.mock('@/api/http', () => ({
  buildUrl: (url: string) => url,
  fetchWithAuth: vi.fn(),
}));
vi.mock('@/api/doulas/doulaService', () => ({
  DOCUMENT_TYPE_LABELS: { training_certificate: 'Doula training certificate' },
  getAdminDoulaDocuments: vi.fn(),
  partitionDoulaDocuments: vi.fn(),
  getDoulaDocumentUrl: vi.fn(),
}));
let approved = false;
beforeEach(() => {
  vi.clearAllMocks();
  approved = false;
  vi.mocked(fetchWithAuth).mockImplementation(
    async () =>
      ({
        ok: true,
        json: async () => [
          {
            id: 'doula',
            firstname: 'Maya',
            lastname: 'Rivers',
            role: 'doula',
            email: 'maya@example.com',
            bio: 'Fictional doula bio',
            account_status: 'pending',
            profile_submitted_at: '2026-10-15',
            certifications: [],
          },
        ],
      }) as Response
  );
  vi.mocked(getAdminDoulaDocuments).mockImplementation(async () => {
    return {} as any;
  });
  vi.mocked(partitionDoulaDocuments).mockImplementation(
    () =>
      ({
        active: [
          {
            document_type: 'training_certificate',
            document_id: 'cert',
            status: approved ? 'approved' : 'uploaded',
            file_name: 'training.pdf',
          },
        ],
        archived: [],
      }) as any
  );
});
afterEach(cleanup);
it('lets an admin review the profile and certificate before approving the account', async () => {
  render(<Teams />);
  await screen.findByText(/Ready for review/);
  fireEvent.click(
    screen.getByRole('button', { name: 'Review profile & documents' })
  );
  await screen.findByText('Fictional doula bio', {
    selector: 'dd.whitespace-pre-wrap',
  });
  expect(
    screen.getByRole('button', { name: 'Approve profile' })
  ).toBeDisabled();
  approved = true;
  fireEvent.click(
    await screen.findByRole('button', { name: 'Approve document' })
  );
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: 'Approve profile' })
    ).toBeEnabled()
  );
  fireEvent.click(screen.getByRole('button', { name: 'Approve profile' }));
  await waitFor(() =>
    expect(fetchWithAuth).toHaveBeenCalledWith(
      '/clients/team/doula',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({
          account_status: 'approved',
          profile_review_version: 0,
        }),
      })
    )
  );
});
