/**
 * Ticket 1: Doula Hours Logging — Distinguish Prenatal vs Postpartum hours
 * Component tests for TotalHoursHoverCard
 *
 * Verifies the hover card correctly renders prenatal and postpartum
 * hour breakdowns as separate visible items.
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TotalHoursHoverCard } from '@/features/hours/components/total-hours-hover-card';

describe('Ticket 1 — TotalHoursHoverCard component', () => {
  it('renders the "View total hours" trigger button', () => {
    render(
      <TotalHoursHoverCard
        totalHours={5}
        prenatalHours={3}
        postpartumHours={2}
      />
    );
    expect(screen.getByRole('button', { name: /view total hours/i })).toBeDefined();
  });

  it('hover card content shows total, prenatal, and postpartum labels', async () => {
    const user = userEvent.setup();
    render(
      <TotalHoursHoverCard
        totalHours={5}
        prenatalHours={3}
        postpartumHours={2}
      />
    );

    const trigger = screen.getByRole('button', { name: /view total hours/i });
    await user.hover(trigger);

    await waitFor(() => {
      expect(document.body.textContent).toMatch(/prenatal hours/i);
    }, { timeout: 3000 });
    expect(document.body.textContent).toMatch(/postpartum hours/i);
    expect(document.body.textContent).toMatch(/total number of hours/i);
  });

  it('formats prenatal hours as "3h 0m"', async () => {
    const user = userEvent.setup();
    render(
      <TotalHoursHoverCard
        totalHours={5}
        prenatalHours={3}
        postpartumHours={2}
      />
    );
    const trigger = screen.getByRole('button', { name: /view total hours/i });
    await user.hover(trigger);
    await waitFor(() => {
      expect(document.body.textContent).toMatch(/3h 0m/);
    }, { timeout: 3000 });
  });

  it('formats postpartum hours as "2h 0m"', async () => {
    const user = userEvent.setup();
    render(
      <TotalHoursHoverCard
        totalHours={5}
        prenatalHours={3}
        postpartumHours={2}
      />
    );
    const trigger = screen.getByRole('button', { name: /view total hours/i });
    await user.hover(trigger);
    await waitFor(() => {
      expect(document.body.textContent).toMatch(/2h 0m/);
    }, { timeout: 3000 });
  });

  it('formats total hours as "5h 0m"', async () => {
    const user = userEvent.setup();
    render(
      <TotalHoursHoverCard
        totalHours={5}
        prenatalHours={3}
        postpartumHours={2}
      />
    );
    const trigger = screen.getByRole('button', { name: /view total hours/i });
    await user.hover(trigger);
    await waitFor(() => {
      expect(document.body.textContent).toMatch(/5h 0m/);
    }, { timeout: 3000 });
  });

  it('handles zero hours gracefully', async () => {
    const user = userEvent.setup();
    render(
      <TotalHoursHoverCard
        totalHours={0}
        prenatalHours={0}
        postpartumHours={0}
      />
    );
    const trigger = screen.getByRole('button', { name: /view total hours/i });
    await user.hover(trigger);
    await waitFor(() => {
      expect(document.body.textContent).toMatch(/0h 0m/);
    }, { timeout: 3000 });
  });

  it('handles fractional hours (1.5h = "1h 30m")', async () => {
    const user = userEvent.setup();
    render(
      <TotalHoursHoverCard
        totalHours={2.5}
        prenatalHours={1}
        postpartumHours={1.5}
      />
    );
    const trigger = screen.getByRole('button', { name: /view total hours/i });
    await user.hover(trigger);
    await waitFor(() => {
      expect(document.body.textContent).toMatch(/1h 30m/);
    }, { timeout: 3000 });
  });
});
