import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import HrWorkspace from './HrWorkspace';
import { hrRequest } from './hrApi';
let role = 'hr';
vi.mock('@/common/contexts/UserContext', async () => {
  const { createContext } = await import('react');
  return {
    UserContext: createContext({
      user: {
        id: 'hr',
        get role() {
          return role;
        },
      },
    }),
  };
});
vi.mock('./hrApi', () => ({ hrRequest: vi.fn() }));
const request = vi.mocked(hrRequest);
beforeEach(() => {
  role = 'hr';
  request.mockReset();
});
it('shows only the doula workspace and saves an audited background-check action through the HR API', async () => {
  const doula = {
    id: 'd',
    full_name: 'Fictional Doula',
    email: 'doula@example.test',
    phone: '5550100',
    certifications: [],
  };
  const docs = {
    documents: [
      {
        id: 'w9',
        documentType: 'w9',
        fileName: 'W9.pdf',
        fileUrl: 'https://files.example.test/w9',
        status: 'approved',
      },
      {
        id: 'deposit',
        documentType: 'direct_deposit_form',
        fileName: 'Deposit.pdf',
        fileUrl: 'https://files.example.test/deposit',
        status: 'approved',
      },
      {
        id: 'background',
        documentType: 'background_check',
        fileName: 'Historical.pdf',
        fileUrl: 'https://files.example.test/background',
        status: 'approved',
      },
    ],
    backgroundCheck: { status: 'not_cleared', setAt: null, setBy: null },
  };
  request
    .mockResolvedValueOnce({ doulas: [doula] })
    .mockResolvedValueOnce({ doula })
    .mockResolvedValueOnce(docs)
    .mockResolvedValueOnce({ success: true })
    .mockResolvedValueOnce({
      ...docs,
      backgroundCheck: {
        status: 'cleared',
        setAt: '2026-10-26T12:00:00Z',
        setBy: 'hr',
      },
    });
  render(<HrWorkspace />);
  fireEvent.click(
    await screen.findByRole('button', { name: /Fictional Doula/ })
  );
  expect(
    await screen.findByRole('link', { name: 'W9.pdf' })
  ).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Deposit.pdf' })).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: 'Historical.pdf' })
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Mark Cleared' }));
  await waitFor(() =>
    expect(request).toHaveBeenCalledWith('/doulas/d/background-check', {
      status: 'cleared',
    })
  );
  expect(await screen.findByText('Status: Cleared')).toBeInTheDocument();
  expect(screen.queryByText('Clients')).not.toBeInTheDocument();
  expect(screen.queryByText('Billing')).not.toBeInTheDocument();
});
it('rejects ordinary admins from the dedicated HR workspace', () => {
  role = 'admin';
  render(<HrWorkspace />);
  expect(screen.getByText('Access denied')).toBeInTheDocument();
  expect(request).not.toHaveBeenCalled();
});
it('shows a revoked grant error without any doula information', async () => {
  request.mockRejectedValueOnce(new Error('HR access denied.'));
  render(<HrWorkspace />);
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'HR access denied'
  );
  expect(screen.queryByText('Fictional Doula')).not.toBeInTheDocument();
});
