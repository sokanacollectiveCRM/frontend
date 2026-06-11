import { ApiError } from '@/api/errors';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getLimitedContractPaymentSchedule } = vi.hoisted(() => ({
  getLimitedContractPaymentSchedule: vi.fn(),
}));

vi.mock('@/features/billing-portal/billingPortalApi', () => ({
  getLimitedContractPaymentSchedule,
}));

import BillingContractDetailPage from '@/features/billing-portal/BillingContractDetailPage';

describe('BillingContractDetailPage', () => {
  beforeEach(() => {
    getLimitedContractPaymentSchedule.mockReset();
  });

  it('renders only billing-safe contract and payment schedule fields', async () => {
    getLimitedContractPaymentSchedule.mockResolvedValue({
      contractId: 'contract-1',
      clientName: 'Jamie Smith',
      contractType: 'Postpartum Doula',
      contractStatus: 'signed',
      totalAmount: 4200,
      depositAmount: 500,
      installmentCount: 3,
      paymentSchedule: 'Monthly',
      installments: [
        {
          installmentNumber: 1,
          dueDate: '2026-07-01',
          amount: 1233.33,
          status: 'pending',
          invoiceId: 'INV-100',
          invoiceStatus: 'open',
        },
      ],
      invoiceStatus: 'open',
      quickBooksSyncStatus: 'synced',
      createdAt: '2026-06-01',
      sentAt: '2026-06-02',
      signedAt: '2026-06-03',
      limitedViewUrl: '/billing/contracts/contract-1',
    });

    render(
      <MemoryRouter initialEntries={['/billing/contracts/contract-1']}>
        <Routes>
          <Route path='/billing/contracts/:contractId' element={<BillingContractDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Jamie Smith')).toBeInTheDocument();
    expect(screen.getByText('Postpartum Doula')).toBeInTheDocument();
    expect(screen.getByText('Monthly')).toBeInTheDocument();
    expect(screen.getByText('INV-100')).toBeInTheDocument();
    expect(screen.getByText('QuickBooks sync')).toBeInTheDocument();
    expect(screen.queryByText('Health information')).not.toBeInTheDocument();
    expect(screen.queryByText('Pregnancy history')).not.toBeInTheDocument();
    expect(screen.queryByText('Admin settings')).not.toBeInTheDocument();
  });

  it('renders loading and empty-installment states', async () => {
    getLimitedContractPaymentSchedule.mockResolvedValue({
      contractId: 'contract-2',
      clientName: 'Alex Doe',
      contractType: 'Birth Doula',
      contractStatus: 'active',
      totalAmount: 3000,
      installments: [],
    });

    render(
      <MemoryRouter initialEntries={['/billing/contracts/contract-2']}>
        <Routes>
          <Route path='/billing/contracts/:contractId' element={<BillingContractDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Loading payment schedule')).toBeInTheDocument();
    expect(await screen.findByText('No installments available.')).toBeInTheDocument();
    expect(screen.getByText('No invoice connected')).toBeInTheDocument();
    expect(screen.getByText('QuickBooks sync unavailable')).toBeInTheDocument();
  });

  it('renders access denied and load errors', async () => {
    getLimitedContractPaymentSchedule.mockRejectedValueOnce(new ApiError('Forbidden', 403));

    render(
      <MemoryRouter initialEntries={['/billing/contracts/contract-3']}>
        <Routes>
          <Route path='/billing/contracts/:contractId' element={<BillingContractDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Access denied')).toBeInTheDocument();
  });

  it('renders a generic load error state', async () => {
    getLimitedContractPaymentSchedule.mockRejectedValueOnce(new Error('boom'));

    render(
      <MemoryRouter initialEntries={['/billing/contracts/contract-3']}>
        <Routes>
          <Route path='/billing/contracts/:contractId' element={<BillingContractDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Unable to load billing information')).toBeInTheDocument();
  });
});
