import { expect, test } from '@playwright/test';

import {
  SCHEDULING_FIXTURE,
  createSchedulingStore,
  openAsUser,
  waitForSchedulePage,
} from './helpers/schedulingE2eStubs';

test.use({
  timezoneId: 'America/Chicago',
  video: 'on',
  viewport: { width: 1400, height: 900 },
});

async function upcomingWeekdays(page: {
  evaluate: (fn: () => { tuesday: string; thursday: string }) => Promise<{
    tuesday: string;
    thursday: string;
  }>;
}) {
  return page.evaluate(() => {
    const upcoming = (weekday: number) => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      for (let offset = 1; offset <= 13; offset += 1) {
        const candidate = new Date(start);
        candidate.setDate(start.getDate() + offset);
        if (candidate.getDay() === weekday) {
          const year = candidate.getFullYear();
          const month = String(candidate.getMonth() + 1).padStart(2, '0');
          const day = String(candidate.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }
      }
      return '';
    };
    return { tuesday: upcoming(2), thursday: upcoming(4) };
  });
}

test.describe('Pilot scheduling MVP', () => {
  test('doula posts times, client books through a conflict, doula approves, admin sees the visit', async ({
    page,
  }) => {
    const store = createSchedulingStore();

    await openAsUser(
      page,
      store,
      SCHEDULING_FIXTURE.doula,
      '/doula-dashboard/schedule'
    );
    await waitForSchedulePage(page);

    const { tuesday, thursday } = await upcomingWeekdays(page);
    expect(tuesday).toBeTruthy();
    expect(thursday).toBeTruthy();

    await page.locator('#availability-date').fill(tuesday);
    await page.locator('#availability-start').fill('10:00');
    await page.locator('#availability-end').fill('14:00');
    await page.locator('#availability-repeat').fill('2');
    await page.getByRole('button', { name: 'Add availability' }).click();
    await expect(
      page.getByText('Added availability for 2 weeks.')
    ).toBeVisible();

    await page.locator('#availability-date').fill(thursday);
    await page.getByRole('button', { name: 'Add availability' }).click();
    await expect(
      page.getByText('Added availability for 2 weeks.')
    ).toBeVisible();
    await expect(page.getByText('Upcoming availability')).toBeVisible();

    await page.locator('#blackout-from').fill(tuesday);
    await page.locator('#blackout-to').fill(tuesday);
    await page.locator('#blackout-reason').fill('Training');
    await page.getByRole('button', { name: 'Add blackout' }).click();
    await expect(page.getByText('Blackout added.')).toBeVisible();
    await expect(page.getByText('Training')).toBeVisible();
    await page.screenshot({
      path: 'e2e/artifacts/01-doula-availability-and-blackout.png',
      fullPage: true,
    });

    await openAsUser(page, store, SCHEDULING_FIXTURE.client, '/profile');
    await expect(
      page.getByRole('heading', { name: 'Profile information' })
    ).toBeVisible();
    await expect(page.getByText('Maya Rivers').first()).toBeVisible();
    await expect(page.getByTestId('book-visit-card')).toBeVisible();
    await expect(page.getByText('Loading open times...')).toHaveCount(0, {
      timeout: 15_000,
    });

    const tuesdayHeading = new Date(`${tuesday}T12:00:00`).toLocaleDateString(
      'en-US',
      {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        timeZone: 'America/Chicago',
      }
    );
    await expect(page.getByText(tuesdayHeading)).toHaveCount(0);

    const slotButtons = page.getByTestId('open-slot');
    await expect(slotButtons.first()).toBeVisible();
    await slotButtons.first().click();
    await page
      .getByLabel('Note (optional)')
      .fill('Prenatal visit planning for Jordan Lake');
    await page.getByTestId('request-visit').click();
    await expect(page.getByText('Pending').first()).toBeVisible();

    await page.getByTestId('request-visit').click();
    await expect(page.getByTestId('booking-conflict')).toContainText(
      /no longer available|overlap/i
    );
    await page.screenshot({
      path: 'e2e/artifacts/02-client-pending-and-conflict.png',
      fullPage: true,
    });

    await openAsUser(
      page,
      store,
      SCHEDULING_FIXTURE.doula,
      '/doula-dashboard/schedule'
    );
    await waitForSchedulePage(page);
    await expect(page.getByTestId('visit-requests')).toContainText('Pending');
    await page.getByRole('button', { name: 'Approve' }).click();
    await expect(page.getByText('Visit approved.')).toBeVisible();
    await expect(page.getByTestId('visit-requests')).toContainText('Approved');
    await page.screenshot({
      path: 'e2e/artifacts/03-doula-approved.png',
      fullPage: true,
    });

    await openAsUser(page, store, SCHEDULING_FIXTURE.client, '/profile');
    await expect(page.getByTestId('my-visits')).toContainText('Approved');

    await openAsUser(page, store, SCHEDULING_FIXTURE.admin, '/scheduling');
    await expect(page.getByRole('heading', { name: 'Visits' })).toBeVisible();
    await expect(page.getByTestId('visits-table')).toContainText('Approved');
    await expect(page.getByTestId('visits-table')).toContainText('Maya Rivers');
    await expect(page.getByTestId('visits-table')).toContainText('Jordan');
    await page.screenshot({
      path: 'e2e/artifacts/04-admin-visits.png',
      fullPage: true,
    });
  });
});
