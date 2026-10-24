import { test, expect, type Page } from '@playwright/test';

test.use({
  video: 'on',
  launchOptions: { slowMo: 400 },
  viewport: { width: 1440, height: 1000 },
});
async function caption(page: Page, text: string) {
  await page.evaluate((message) => {
    let box = document.getElementById('test-caption');
    if (!box) {
      box = document.createElement('div');
      box.id = 'test-caption';
      box.style.cssText =
        'position:fixed;bottom:20px;left:20px;z-index:999999;background:#173d47;color:white;padding:16px;border-radius:10px;font:20px sans-serif';
      document.body.appendChild(box);
    }
    box.textContent = message;
  }, text);
  await page.waitForTimeout(3000);
}

test('doula profile layout, optional demographics, submission and client view', async ({
  page,
}) => {
  test.setTimeout(120000);
  let role = 'doula';
  let profile: any = {
    id: 'fictional-doula',
    firstname: 'Maya',
    lastname: 'Rivers',
    email: 'maya@example.com',
    address: '1 Fictional Way',
    city: 'Chicago',
    state: 'IL',
    country: 'US',
    zip_code: '60601',
    bio: 'I am a birth and postpartum doula who supports families.',
    pronouns: '',
    race_ethnicity: [],
    languages_other_than_english: [],
    certifications: [],
    scheduling_url: 'https://example.com/book',
    availability_status: 'available',
    profile_picture: '/sokana360-mark.png',
    account_status: 'approved',
  };
  const headers = {
    'access-control-allow-origin': 'http://localhost:3001',
    'access-control-allow-credentials': 'true',
    'access-control-allow-headers': '*',
    'access-control-allow-methods': '*',
  };
  let submissions = 0;
  await page.route('http://localhost:5050/**', async (route) => {
    const r = route.request(),
      path = new URL(r.url()).pathname;
    if (r.method() === 'OPTIONS')
      return route.fulfill({ status: 204, headers, body: '' });
    let data: any = { success: true, data: [], documents: [], activities: [] };
    if (path === '/auth/me')
      data = {
        id: role === 'doula' ? 'fictional-doula' : 'fictional-client',
        firstname: role === 'doula' ? 'Maya' : 'Jordan',
        lastname: role === 'doula' ? 'Rivers' : 'Lake',
        email: role + '@example.com',
        role,
        emailVerified: true,
        status: 'contract',
      };
    else if (path.endsWith('/doulas/profile/submit')) {
      submissions++;
      profile.profile_submitted_at = '2026-10-13T12:00:00Z';
      data = {
        success: true,
        profile_submitted_at: profile.profile_submitted_at,
      };
    } else if (path.endsWith('/doulas/profile')) {
      if (r.method() === 'PUT') profile = { ...profile, ...r.postDataJSON() };
      data = { success: true, profile };
    } else if (path.endsWith('/doulas/availability'))
      data = { records: [], availabilityStatus: { status: 'available' } };
    else if (path.endsWith('/doulas/documents'))
      data = {
        documents: [
          {
            id: 'training',
            document_type: 'training_certificate',
            status: 'uploaded',
            file_name: 'fictional-training.pdf',
            file_path: 'fictional-training.pdf',
          },
        ],
      };
    else if (path.endsWith('/assigned-doulas'))
      data = {
        doulas: [
          {
            id: 'fictional-assignment',
            doulaId: profile.id,
            status: 'active',
            role: 'primary',
            availabilityStatus: { status: 'available' },
            doula: {
              ...profile,
              certifications: profile.certifications.map((c: any) => c.name),
              race_ethnicity: ['NEVER SHOW THIS DEMOGRAPHIC'],
            },
          },
        ],
      };
    else if (path === '/clients/fictional-client')
      data = {
        id: 'fictional-client',
        firstname: 'Jordan',
        lastname: 'Lake',
        email: 'jordan@example.com',
        status: 'contract',
        has_signed_contract: true,
      };
    await route.fulfill({ status: 200, headers, json: data });
  });
  await page.goto('/doula-dashboard/profile');
  await expect(page.getByLabel('About me (bio)')).toHaveValue(profile.bio);
  await caption(page, 'Doula opens Profile — fictional test data');
  await page.getByLabel('About me (bio)').scrollIntoViewIfNeeded();
  expect(
    await page
      .getByLabel('About me (bio)')
      .evaluate(
        (el) =>
          !!(
            el.compareDocumentPosition(
              document.getElementById('scheduling_url')!
            ) & Node.DOCUMENT_POSITION_FOLLOWING
          )
      )
  ).toBeTruthy();
  await caption(page, 'Bio, in first person, sits above the scheduling link');
  await expect(page.getByLabel('Certification name')).toHaveCount(0);
  await page.getByRole('button', { name: 'Add certification' }).click();
  await expect(page.getByLabel('Certification name')).toBeFocused();
  await expect(
    page.getByRole('button', { name: 'Add certification' })
  ).toBeDisabled();
  await page.getByLabel('Certification name').fill('Birth doula');
  await page.getByLabel('Issuing organization').fill('Example Training');
  await page.getByLabel('Expiration date', { exact: true }).fill('2028-03-31');
  await caption(page, 'Add a certification beside the photo and name');
  await page.getByRole('button', { name: 'Add certification' }).click();
  await expect(page.getByLabel('Certification name')).toHaveCount(2);
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(
    page.getByRole('button', { name: 'Save Changes' })
  ).toBeEnabled();
  await expect
    .poll(() => profile.certifications)
    .toEqual([
      {
        name: 'Birth doula',
        issuingOrganization: 'Example Training',
        expiration_date: '2028-03-31',
        no_expiration: false,
      },
    ]);
  await expect(page.getByLabel('Certification name')).toHaveCount(0);
  await expect(page.getByText('Birth doula', { exact: true })).toBeVisible();
  expect(profile.pronouns).toBe('');
  expect(profile.race_ethnicity).toEqual([]);
  await caption(page, 'Pronouns and demographics left blank, still saves');
  await page.getByRole('button', { name: 'Mark profile complete' }).click();
  await expect(
    page.getByText('Submitted for review', { exact: true })
  ).toBeVisible();
  expect(submissions).toBe(1);
  await caption(page, 'Mark profile complete → submitted for review');
  role = 'client';
  await page.goto('/profile');
  await expect(page.getByText(profile.bio, { exact: true })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Open scheduling link' })
  ).toHaveAttribute('href', 'https://example.com/book');
  await expect(page.getByText('Birth doula', { exact: true })).toBeVisible();
  await expect(page.getByText('NEVER SHOW THIS DEMOGRAPHIC')).toHaveCount(0);
  await expect(page.getByAltText("Maya Rivers's profile")).toBeVisible();
  await page.getByText(profile.bio, { exact: true }).scrollIntoViewIfNeeded();
  await caption(
    page,
    'Client sees photo, bio, scheduling link, certifications'
  );
});
