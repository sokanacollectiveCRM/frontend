import { Badge } from '@/common/components/ui/badge';
import { useState } from 'react';
import { Button } from '@/common/components/ui/button';
import {
  type BackgroundCheck,
  setDoulaBackgroundCheck,
} from '@/api/doulas/doulaService';
import { BACKGROUND_CHECK_REQUIRED } from '@/domain/documentPolicy';
import { toast } from 'sonner';
export function BackgroundCheckStatus({
  value,
  doulaId,
  canManage = false,
  onChanged,
}: {
  value?: BackgroundCheck;
  doulaId?: string;
  canManage?: boolean;
  onChanged?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  if (!value) return null;
  const change = async () => {
    if (!doulaId) return;
    setBusy(true);
    try {
      await setDoulaBackgroundCheck(
        doulaId,
        value.status === 'cleared' ? 'not_cleared' : 'cleared'
      );
      toast.success('Background check status saved. Profile needs review.');
      onChanged?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not save status.'
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <section
      aria-label='Background check'
      className={
        BACKGROUND_CHECK_REQUIRED && value.status !== 'cleared'
          ? 'rounded-md border-l-4 border-amber-500 p-4'
          : 'rounded-md border p-4'
      }
    >
      <p className='font-medium'>
        Background check{' '}
        {BACKGROUND_CHECK_REQUIRED ? (
          <Badge className='bg-red-50 text-red-600'>Required</Badge>
        ) : (
          <Badge variant='outline'>Optional</Badge>
        )}
      </p>
      <p>Status: {value.status === 'cleared' ? 'Cleared' : 'Not cleared'}</p>
      {value.setAt && (
        <p className='text-sm text-gray-600'>
          Set {new Date(value.setAt).toLocaleString()} by {value.setBy}
        </p>
      )}
      <p className='text-sm text-gray-600'>HR/payroll manages this status.</p>
      {canManage && doulaId && (
        <Button type='button' disabled={busy} onClick={() => void change()}>
          {busy
            ? 'Saving...'
            : value.status === 'cleared'
              ? 'Mark Not cleared'
              : 'Mark Cleared'}
        </Button>
      )}
    </section>
  );
}
