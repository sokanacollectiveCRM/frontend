import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import RequestPasswordReset from '../RequestPasswordReset';
const { reset } = vi.hoisted(() => ({
  reset: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@/common/hooks/user/useUser', () => ({
  useUser: () => ({ requestPasswordReset: reset }),
}));
it('prefills the invited email and retains a return link without sending a reset automatically', async () => {
  render(
    <MemoryRouter
      initialEntries={[
        '/forgot-password?email=doula%40example.test&invitation=fixture-token',
      ]}
    >
      <RequestPasswordReset />
    </MemoryRouter>
  );
  expect(screen.getByLabelText('Email')).toHaveValue('doula@example.test');
  expect(
    screen.getByRole('link', { name: 'return to your invitation' })
  ).toHaveAttribute('href', '/accept-invite?token=fixture-token');
  expect(reset).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));
  await waitFor(() => expect(reset).toHaveBeenCalledWith('doula@example.test'));
  expect(await screen.findByText('Check your email')).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: 'return to your invitation' })
  ).toBeInTheDocument();
});
