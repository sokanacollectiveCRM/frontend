import { existsSync, readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const file =
  process.env.OCT21_EMAIL_PREVIEW_FILE || '/tmp/oct21-email-previews.json';
test.skip(
  !existsSync(file),
  'Run backend scripts/e2e/verify-oct21-reminders.ts first.'
);
const previews = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};

test('staff setup email has the correct link and footer logo', async ({
  page,
}) => {
  await page.setContent(previews.staff.html);
  await expect(
    page.getByRole('link', { name: 'Set up my account', exact: true })
  ).toHaveAttribute('href', /\/signup\?oobCode=/);
  const logo = page.getByRole('img', {
    name: 'Sokana360 — Connect. Care. Coordinate.',
  });
  await expect(logo).toBeVisible();
  await expect(
    page.getByText('Wait for review.', { exact: true })
  ).toBeVisible();
});

test('family confirmation and setup emails render the approved copy', async ({
  page,
}) => {
  await page.setContent(previews.received.html);
  await expect(page.getByText('Hi Maya,', { exact: true })).toBeVisible();
  await expect(page.getByText(/simply reply to this email/)).toBeVisible();
  await page.setContent(previews.family.html);
  await expect(
    page.getByRole('link', { name: 'Set up my family account', exact: true })
  ).toHaveAttribute('href', /\/auth\/set-password\?oobCode=/);
  await expect(
    page.getByText(/Insurance billing will be available starting January 2027/)
  ).toBeVisible();
  await expect(
    page.getByText('This link will expire in 24 hours.', { exact: true })
  ).toBeVisible();
});

test('visit messages render timezone and authenticated client link', async ({
  page,
}) => {
  await page.setContent(previews.reminders[0].html);
  await expect(page.getByText(/Need to reschedule/)).toBeVisible();
  await expect(page.getByText(/CDT/).first()).toBeVisible();
  await page.setContent(previews.reminders[1].html);
  await expect(
    page.getByRole('link', { name: 'Open client in Sokana360' })
  ).toHaveAttribute('href', /\/admin\/clients\//);
});
