import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import StaffPermissionsPage from './StaffPermissionsPage';
import { staffRequest } from './staffPermissionsApi';
vi.mock('./staffPermissionsApi', () => ({ staffRequest: vi.fn() }));
const request = vi.mocked(staffRequest);
const data = {
  admins: [
    {
      id: 'a',
      name: 'Fictional Admin',
      email: 'admin@example.test',
      hr: false,
      payroll: false,
    },
  ],
  lastChange: null,
};
beforeEach(() => {
  request.mockReset();
});
it('lists both capabilities, saves a grant and displays the audit event', async () => {
  request
    .mockResolvedValueOnce(data)
    .mockResolvedValueOnce({ changed: true })
    .mockResolvedValueOnce({
      ...data,
      admins: [{ ...data.admins[0], hr: true }],
      lastChange: {
        actor_email: 'manager@example.test',
        admin_email: 'admin@example.test',
        capability: 'hr',
        old_value: false,
        new_value: true,
        changed_at: '2026-10-26T12:00:00Z',
      },
    });
  render(<StaffPermissionsPage />);
  fireEvent.click(
    await screen.findByRole('checkbox', { name: 'HR for admin@example.test' })
  );
  await waitFor(() =>
    expect(request).toHaveBeenCalledWith('/a', {
      capability: 'hr',
      enabled: true,
    })
  );
  expect(
    await screen.findByText(/manager@example.test changed HR/)
  ).toBeInTheDocument();
  expect(
    screen.getByRole('checkbox', { name: 'HR for admin@example.test' })
  ).toBeChecked();
  expect(
    screen.getByRole('checkbox', { name: 'Payroll for admin@example.test' })
  ).not.toBeChecked();
});
it('denies access without rendering staff or controls', async () => {
  request.mockRejectedValue(new Error('Staff permissions access denied.'));
  render(<StaffPermissionsPage />);
  expect(await screen.findByRole('alert')).toHaveTextContent('access denied');
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
});
it('shows the last-holder rejection and leaves the saved toggle on', async () => {
  request
    .mockResolvedValueOnce({
      ...data,
      admins: [{ ...data.admins[0], hr: true }],
    })
    .mockRejectedValueOnce(
      new Error(
        'Cannot remove the last person with HR/payroll access. Grant access to another admin first.'
      )
    );
  render(<StaffPermissionsPage />);
  fireEvent.click(
    await screen.findByRole('checkbox', { name: 'HR for admin@example.test' })
  );
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Cannot remove the last person'
  );
  expect(
    screen.getByRole('checkbox', { name: 'HR for admin@example.test' })
  ).toBeChecked();
});
it('revokes Payroll and rechecks access after the save', async () => {
  request
    .mockResolvedValueOnce({
      ...data,
      admins: [{ ...data.admins[0], payroll: true }],
    })
    .mockResolvedValueOnce({ changed: true })
    .mockRejectedValueOnce(new Error('Staff permissions access denied.'));
  render(<StaffPermissionsPage />);
  fireEvent.click(
    await screen.findByRole('checkbox', {
      name: 'Payroll for admin@example.test',
    })
  );
  expect(await screen.findByRole('alert')).toHaveTextContent('access denied');
  expect(request).toHaveBeenCalledWith('/a', {
    capability: 'payroll',
    enabled: false,
  });
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
});
