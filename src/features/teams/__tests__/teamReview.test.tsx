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
  getDoulaDocumentUrl,
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
let documentFileName = 'training.pdf';
let approved = false;
beforeEach(() => {
  vi.clearAllMocks();
  approved = false;
  documentFileName = 'training.pdf';
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
            phone_number: '5555550100',
            address: '100 Fictional Way',
            unit_number: 'Apt 4B',
            city: 'Chicago',
            state: 'IL',
            zip_code: '60601',
            country: 'United States',
            bio: 'Fictional doula bio',
            account_status: 'pending',
            profile_submitted_at: '2026-10-15',
            certifications: [
              {
                name: 'Fictional birth training',
                issuingOrganization: 'Example Training',
                expiration_date: '2028-03-31',
                no_expiration: false,
              },
            ],
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
          { document_type: 'w9', status: 'approved' },
          { document_type: 'direct_deposit_form', status: 'approved' },
          {
            document_type: 'training_certificate',
            document_id: 'cert',
            status: approved ? 'approved' : 'uploaded',
            file_name: documentFileName,
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
  expect(screen.getByText('555-555-0100')).toBeInTheDocument();
  expect(
    screen.getByText('100 Fictional Way, Apt 4B, Chicago, IL 60601')
  ).toBeInTheDocument();
  expect(screen.queryByText('United States')).not.toBeInTheDocument();
  expect(screen.getByText('Fictional birth training')).toBeInTheDocument();
  expect(
    screen.getByText('Example Training · Expires Mar 31, 2028')
  ).toBeInTheDocument();
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

it.each(['JPG', 'PNG', 'PDF'])(
  'previews %s inside Review profile & documents',
  async (extension) => {
    documentFileName = `fictional.${extension}`;
    vi.mocked(getDoulaDocumentUrl).mockResolvedValue(
      'https://example.test/signed-document'
    );
    render(<Teams />);
    fireEvent.click(
      await screen.findByRole('button', { name: 'Review profile & documents' })
    );
    fireEvent.click(await screen.findByRole('button', { name: /^View$/ }));
    if (extension === 'PDF') {
      expect(await screen.findByTitle('PDF document preview')).toHaveAttribute(
        'src',
        'https://example.test/signed-document'
      );
    } else {
      expect(await screen.findByAltText(documentFileName)).toHaveAttribute(
        'src',
        'https://example.test/signed-document'
      );
    }
  }
);
it('offers HR as an invite role to an ordinary admin', async () => {
  render(<Teams />);
  fireEvent.click(await screen.findByRole('button', { name: /invite/i }));
  const roleSelect = await screen.findByLabelText('Role');
  fireEvent.change(roleSelect, { target: { value: 'hr' } });
  expect(roleSelect).toHaveValue('hr');
  expect(
    screen.getByRole('option', { name: /HR — doula profiles/ })
  ).toBeInTheDocument();
});
it('shows a pending invitation without offering profile review before acceptance', async () => {
  vi.mocked(fetchWithAuth).mockResolvedValue({
    ok: true,
    json: async () => [
      {
        id: 'pending-invite',
        firstname: 'Pending',
        lastname: 'Doula',
        email: 'pending@example.test',
        role: 'doula',
        invitation_status: 'pending',
        account_status: 'pending',
      },
    ],
  } as Response);
  render(<Teams />);
  expect(await screen.findByText('pending@example.test')).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Review profile & documents' })
  ).not.toBeInTheDocument();
});

it('allows document rejection in Teams with a required reason', async () => {
  render(<Teams />);
  fireEvent.click(
    await screen.findByRole('button', { name: 'Review profile & documents' })
  );
  const reject = await screen.findByRole('button', { name: 'Reject document' });
  expect(reject).toBeDisabled();
  fireEvent.change(
    screen.getByLabelText('Requested changes / rejection reason'),
    { target: { value: 'Please upload a readable certificate.' } }
  );
  expect(reject).toBeEnabled();
  fireEvent.click(reject);
  await waitFor(() =>
    expect(fetchWithAuth).toHaveBeenCalledWith(
      '/api/admin/doulas/doula/documents/cert/review',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          status: 'rejected',
          rejection_reason: 'Please upload a readable certificate.',
        }),
      })
    )
  );
});
it('permits profile approval with the visible training approval and leaves private requirements to the backend', async () => {
  approved = true;
  vi.mocked(partitionDoulaDocuments).mockReturnValue({
    active: [
      {
        document_type: 'training_certificate',
        document_id: 'cert',
        status: 'approved',
      },
    ],
    archived: [],
  } as never);
  render(<Teams />);
  fireEvent.click(
    await screen.findByRole('button', { name: 'Review profile & documents' })
  );
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: 'Approve profile' })
    ).toBeEnabled()
  );
  expect(screen.queryByText('w9')).not.toBeInTheDocument();
});
