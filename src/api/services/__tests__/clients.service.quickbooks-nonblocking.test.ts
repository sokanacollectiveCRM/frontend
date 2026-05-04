import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('../../http', () => {
  return {
    put: vi.fn(),
    get: vi.fn(),
  };
});

vi.mock('@/common/utils/syncQuickBooksCustomer', () => {
  return {
    syncQuickBooksCustomerFromClient: vi.fn(),
  };
});

import { put } from '../../http';
import { syncQuickBooksCustomerFromClient } from '@/common/utils/syncQuickBooksCustomer';
import { updateClientStatus } from '../clients.service';

describe('clients.service — QuickBooks sync is non-blocking', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns updated client even when QB sync reports failure', async () => {
    vi.mocked(put).mockResolvedValue({
      id: 'client-1',
      first_name: 'Test',
      last_name: 'Client',
      email: 'test@example.com',
      phone_number: '555-000-0000',
      status: 'matched',
      matched_at: new Date().toISOString(),
      qbo_customer_id: null,
    } as any);

    vi.mocked(syncQuickBooksCustomerFromClient).mockResolvedValue({
      success: false,
      error: 'QuickBooks unavailable',
    });

    const result = await updateClientStatus('client-1', 'matched');
    expect(result.id).toBe('client-1');
    expect(result.status).toBe('matched');
    expect(syncQuickBooksCustomerFromClient).toHaveBeenCalledTimes(1);
  });

  it('does not attempt QB sync when status is not matched/customer', async () => {
    vi.mocked(put).mockResolvedValue({
      id: 'client-1',
      first_name: 'Test',
      last_name: 'Client',
      email: 'test@example.com',
      phone_number: '555-000-0000',
      status: 'lead',
    } as any);

    vi.mocked(syncQuickBooksCustomerFromClient).mockResolvedValue({ success: false });

    const result = await updateClientStatus('client-1', 'lead');
    expect(result.status).toBe('lead');
    expect(syncQuickBooksCustomerFromClient).toHaveBeenCalledTimes(0);
  });
});

