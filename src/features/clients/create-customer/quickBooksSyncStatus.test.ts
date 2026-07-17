import { describe, expect, it } from 'vitest';
import { normalizeQuickBooksSyncStatus, QUICKBOOKS_SYNC_STATUS_META } from './quickBooksSyncStatus';

describe('QuickBooks customer synchronization labels', () => {
  it.each([
    ['linked', 'QuickBooks Linked'],
    ['not_linked', 'Not Linked'],
    ['link_stale', 'Link Stale'],
    ['sync_failed', 'Sync Failed'],
    ['in_progress', 'Syncing'],
  ])('maps backend status %s to %s', (status, label) => {
    const normalized = normalizeQuickBooksSyncStatus(status);
    expect(QUICKBOOKS_SYNC_STATUS_META[normalized].label).toBe(label);
  });

  it('uses the backend status even when a QuickBooks customer id exists', () => {
    expect(normalizeQuickBooksSyncStatus('sync_failed', 'qbo-123')).toBe('failed');
  });

  it('falls back to linkage only for legacy responses without a status', () => {
    expect(normalizeQuickBooksSyncStatus(undefined, 'qbo-123')).toBe('linked');
    expect(normalizeQuickBooksSyncStatus(undefined, null)).toBe('not_linked');
  });
});
