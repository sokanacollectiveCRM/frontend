import { expect, test, type Page } from '@playwright/test';
import { copyFile } from 'node:fs/promises';

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
  launchOptions: { slowMo: 750 },
});

async function showCaption(page: Page, text: string) {
  await page.evaluate((label) => {
    let banner = document.getElementById('e2e-caption');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'e2e-caption';
      banner.setAttribute('data-testid', 'e2e-caption');
      banner.style.cssText = [
        'position:fixed',
        'left:50%',
        'bottom:28px',
        'transform:translateX(-50%)',
        'z-index:2147483647',
        'max-width:90vw',
        'padding:12px 18px',
        'border-radius:999px',
        'background:#0f172a',
        'color:#fff',
        'font:600 18px/1.3 system-ui,sans-serif',
        'box-shadow:0 8px 24px rgba(15,23,42,.35)',
        'pointer-events:none',
      ].join(';');
      document.body.appendChild(banner);
    }
    banner.textContent = label;
  }, text);
  await page.waitForTimeout(2500);
}

async function vacationWeek(page: Page) {
  return page.evaluate(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    for (let offset = 7; offset <= 20; offset += 1) {
      const candidate = new Date(start);
      candidate.setDate(start.getDate() + offset);
      if (candidate.getDay() === 1) {
        const friday = new Date(candidate);
        friday.setDate(candidate.getDate() + 4);
        const stamp = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };
        return { monday: stamp(candidate), friday: stamp(friday) };
      }
    }
    return { monday: '', friday: '' };
  });
}

test.describe('Pilot scheduling MVP', () => {
  test('doula sets weekly hours and time off, client books, admin sees the visit', async ({
    page,
  }, testInfo) => {
    test.setTimeout(180_000);
    const store = createSchedulingStore();

    await openAsUser(
      page,
      store,
      SCHEDULING_FIXTURE.doula,
      '/doula-dashboard/schedule'
    );
    await waitForSchedulePage(page);
    await showCaption(page, 'Doula sets weekly hours');

    await page.getByTestId('weekday-enabled-monday').click();
    await page.getByTestId('range-start-monday-0').fill('10:00');
    await page.getByTestId('range-end-monday-0').fill('14:00');

    await showCaption(page, 'Copies Monday to Tue-Fri');
    await page.getByTestId('copy-monday').click();
    await expect(page.getByTestId('copy-days-dialog')).toBeVisible();
    await page.getByTestId('copy-all-weekdays').click();
    await page.getByTestId('apply-copy-days').click();
    await expect(page.getByTestId('weekday-enabled-friday')).toBeChecked();
    await page.getByTestId('save-weekly-hours').click();
    await expect(
      page.getByText('Weekly hours saved for the next 8 weeks.')
    ).toBeVisible();

    const { monday, friday } = await vacationWeek(page);
    expect(monday).toBeTruthy();
    expect(friday).toBeTruthy();

    await showCaption(page, 'Adds Thanksgiving holiday and a vacation week');
    await page.getByTestId('holiday-thanksgiving').scrollIntoViewIfNeeded();
    await page.getByTestId('holiday-thanksgiving').click();
    await page.getByTestId('add-selected-holidays').click();
    await expect(page.getByText('Selected holidays added.')).toBeVisible();
    await expect(page.getByTestId('time-off-list')).toContainText(
      'Thanksgiving'
    );

    await page.locator('#time-off-type').selectOption('Vacation');
    await page.locator('#time-off-coverage').selectOption('date_range');
    await page.locator('#time-off-from').fill(monday);
    await page.locator('#time-off-to').fill(friday);
    await page.getByTestId('save-time-off').click();
    await expect(page.getByText('Time off added.')).toBeVisible();
    await expect(page.getByTestId('time-off-list')).toContainText('Vacation');
    await page.screenshot({
      path: 'e2e/artifacts/01-doula-availability-and-blackout.png',
      fullPage: true,
    });
    await page.waitForTimeout(2000);

    await openAsUser(page, store, SCHEDULING_FIXTURE.client, '/profile');
    await expect(
      page.getByRole('heading', { name: 'Profile information' })
    ).toBeVisible();
    await expect(page.getByText('Maya Rivers').first()).toBeVisible();
    await expect(page.getByTestId('book-visit-card')).toBeVisible();
    await expect(page.getByText('Loading open times...')).toHaveCount(0, {
      timeout: 15_000,
    });

    const vacationMondayHeading = new Date(
      `${monday}T12:00:00`
    ).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      timeZone: 'America/Chicago',
    });
    await expect(page.getByText(vacationMondayHeading)).toHaveCount(0);

    await showCaption(page, 'Client books a visit');
    const slotButtons = page.getByTestId('open-slot');
    await expect(slotButtons.first()).toBeVisible();
    await slotButtons.first().click();
    await page
      .getByLabel('Note (optional)')
      .fill('Prenatal visit planning for Jordan Lake');
    await page.getByTestId('request-visit').click();
    await expect(page.getByText('Pending').first()).toBeVisible();

    await showCaption(page, 'Conflict shown');
    await page.getByTestId('request-visit').click();
    await expect(page.getByTestId('booking-conflict')).toContainText(
      /no longer available|overlap/i
    );
    await page.screenshot({
      path: 'e2e/artifacts/02-client-pending-and-conflict.png',
      fullPage: true,
    });
    await page.waitForTimeout(2000);

    await openAsUser(
      page,
      store,
      SCHEDULING_FIXTURE.doula,
      '/doula-dashboard/schedule'
    );
    await waitForSchedulePage(page);
    await showCaption(page, 'Doula approves');
    await expect(page.getByTestId('visit-requests')).toContainText('Pending');
    await page.getByRole('button', { name: 'Approve' }).click();
    await expect(page.getByText('Visit approved.')).toBeVisible();
    await expect(page.getByTestId('visit-requests')).toContainText('Approved');
    await page.screenshot({
      path: 'e2e/artifacts/03-doula-approved.png',
      fullPage: true,
    });
    await page.waitForTimeout(2000);

    await openAsUser(page, store, SCHEDULING_FIXTURE.client, '/profile');
    await expect(page.getByTestId('my-visits')).toContainText('Approved');

    await openAsUser(page, store, SCHEDULING_FIXTURE.admin, '/scheduling');
    await showCaption(page, 'Admin sees the visit');
    await expect(page.getByRole('heading', { name: 'Visits' })).toBeVisible();
    await expect(page.getByTestId('visits-table')).toContainText('Approved');
    await expect(page.getByTestId('visits-table')).toContainText('Maya Rivers');
    await expect(page.getByTestId('visits-table')).toContainText('Jordan');
    await page.screenshot({
      path: 'e2e/artifacts/04-admin-visits.png',
      fullPage: true,
    });
    await page.waitForTimeout(2000);

    const video = testInfo.attachments.find((item) => item.name === 'video');
    if (video?.path) {
      await copyFile(video.path, 'e2e/artifacts/scheduling-mvp.webm');
    }
  });
});
