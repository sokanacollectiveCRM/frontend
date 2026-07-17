export type QuickBooksSyncStatus =
  | 'linked'
  | 'not_linked'
  | 'stale'
  | 'failed'
  | 'syncing';

export const QUICKBOOKS_SYNC_STATUS_META: Record<
  QuickBooksSyncStatus,
  { label: string; className: string }
> = {
  linked: {
    label: 'QuickBooks Linked',
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  not_linked: {
    label: 'Not Linked',
    className: 'bg-muted text-muted-foreground',
  },
  stale: {
    label: 'Link Stale',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  },
  failed: {
    label: 'Sync Failed',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
  syncing: {
    label: 'Syncing',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
};

/** Normalize the backend enum while remaining compatible with older API spellings. */
export function normalizeQuickBooksSyncStatus(
  value: string | null | undefined,
  qboCustomerId?: string | null
): QuickBooksSyncStatus {
  const normalized = value?.trim().toLowerCase().replace(/[\s-]+/g, '_');

  switch (normalized) {
    case 'linked':
    case 'synced':
    case 'success':
    case 'quickbooks_linked':
      return 'linked';
    case 'stale':
    case 'link_stale':
      return 'stale';
    case 'failed':
    case 'error':
    case 'sync_failed':
      return 'failed';
    case 'syncing':
    case 'pending':
    case 'in_progress':
      return 'syncing';
    case 'not_linked':
    case 'unlinked':
    case 'not_synced':
      return 'not_linked';
    default:
      // Compatibility fallback for API responses from before the status field existed.
      return qboCustomerId ? 'linked' : 'not_linked';
  }
}
