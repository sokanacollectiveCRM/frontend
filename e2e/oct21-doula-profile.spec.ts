import { test, expect } from '@playwright/test';

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
    phone_number: '3125550199',
    profile_review_status: 'draft',
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
      profile.profile_review_status = 'submitted';
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
        backgroundCheck: { status: 'cleared', setAt: null, setBy: null },
        documents: [
          ...['w9', 'direct_deposit_form'].map((type) => ({
            id: type,
            document_type: type,
            status: 'uploaded',
            file_name: `fictional-${type}.pdf`,
            file_path: `fixture/${type}.pdf`,
          })),
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
  await page.getByRole('button', { name: 'Edit profile', exact: true }).click();
  await expect(page.getByLabel('About me (bio)')).toHaveValue(profile.bio);
  await page
    .getByRole('button', { name: 'Scheduling step', exact: true })
    .click();
  await expect(page.getByLabel('Scheduling Link', { exact: true })).toHaveValue(
    profile.scheduling_url
  );
  await expect(page.getByLabel('About me (bio)')).not.toBeVisible();
  await page
    .getByRole('button', { name: 'Certifications step', exact: true })
    .click();
  await expect(page.getByLabel('Certification name')).toHaveCount(0);
  await page.getByRole('button', { name: 'Add certification' }).click();
  await expect(page.getByLabel('Certification name')).toBeFocused();
  await expect(
    page.getByRole('button', { name: 'Add certification' })
  ).toBeDisabled();
  await page.getByLabel('Certification name').fill('Birth doula');
  await page.getByLabel('Issuing organization').fill('Example Training');
  await page.getByLabel('Expiration date', { exact: true }).fill('2028-03-31');
  await page.getByRole('button', { name: 'Add certification' }).click();
  await expect(page.getByLabel('Certification name')).toHaveCount(2);
  await page.getByRole('button', { name: 'Save Changes', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Edit profile', exact: true })
  ).toBeVisible();
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
  await page.getByRole('button', { name: 'Review step', exact: true }).click();
  await page.getByRole('button', { name: 'Mark profile complete' }).click();
  await expect(
    page.getByText('Submitted for review', { exact: true })
  ).toBeVisible();
  expect(submissions).toBe(1);
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
});
