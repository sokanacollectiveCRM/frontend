import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { BackgroundCheckStatus } from './BackgroundCheckStatus';
import { setDoulaBackgroundCheck } from '@/api/doulas/doulaService';
vi.mock('@/api/doulas/doulaService', () => ({
  setDoulaBackgroundCheck: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
const value = {
  status: 'not_cleared' as const,
  setAt: '2026-10-26T12:00:00Z',
  setBy: 'fictional-hr-admin',
};
it('shows owner read-only status and audit metadata without an upload or edit action', () => {
  render(<BackgroundCheckStatus value={value} />);
  expect(screen.getByText('Status: Not cleared')).toBeInTheDocument();
  expect(screen.getByText(/fictional-hr-admin/)).toBeInTheDocument();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/upload/i)).not.toBeInTheDocument();
});
it('does not render absent status for other admins', () => {
  render(<BackgroundCheckStatus />);
  expect(screen.queryByRole('region')).not.toBeInTheDocument();
});
it('lets authorized HR/payroll mark cleared and refreshes', async () => {
  const changed = vi.fn();
  render(
    <BackgroundCheckStatus
      value={value}
      doulaId='fictional-doula'
      canManage
      onChanged={changed}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Mark Cleared' }));
  await waitFor(() => expect(changed).toHaveBeenCalled());
  expect(setDoulaBackgroundCheck).toHaveBeenCalledWith(
    'fictional-doula',
    'cleared'
  );
});
