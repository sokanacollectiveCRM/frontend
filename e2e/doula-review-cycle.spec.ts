import { test, expect } from '@playwright/test';

test('doula corrects requested changes, resubmits, and admin approves', async ({
  page,
}) => {
  let role = 'doula';
  let certificate = 'uploaded';
  const profile = {
    id: 'review-doula',
    firstname: 'Maya',
    lastname: 'Rivers',
    email: 'maya@example.com',
    address: '1 Fictional Way',
    city: 'Chicago',
    state: 'IL',
    country: 'US',
    zip_code: '60601',
    bio: 'Fictional doula bio',
    certifications: [],
    account_status: 'active',
    profile_review_status: 'draft',
    profile_review_reason: null as string | null,
    profile_review_version: 0,
    profile_submitted_at: null as string | null,
  };
  const headers = {
    'access-control-allow-origin': 'http://localhost:3001',
    'access-control-allow-credentials': 'true',
    'access-control-allow-headers': '*',
    'access-control-allow-methods': '*',
  };
  await page.route('http://localhost:5050/**', async (route) => {
    const req = route.request(),
      path = new URL(req.url()).pathname;
    if (req.method() === 'OPTIONS')
      return route.fulfill({ status: 204, headers, body: '' });
    let data: unknown = {
      success: true,
      data: [],
      activities: [],
      records: [],
      documents: [],
    };
    if (path === '/auth/me') data = { ...profile, role, emailVerified: true };
    else if (path.endsWith('/doulas/profile/submit')) {
      profile.profile_review_status = 'submitted';
      profile.profile_review_reason = null;
      profile.profile_review_version++;
      profile.profile_submitted_at = new Date().toISOString();
      data = {
        success: true,
        profile_submitted_at: profile.profile_submitted_at,
      };
    } else if (path.endsWith('/doulas/profile')) {
      if (req.method() === 'PUT') Object.assign(profile, req.postDataJSON());
      data = { success: true, profile };
    } else if (path.endsWith('/doulas/availability'))
      data = { records: [], availabilityStatus: { status: 'available' } };
    else if (path.endsWith('/clients/team/all'))
      data = [{ ...profile, role: 'doula' }];
    else if (path.endsWith('/documents/cert/review'))
      certificate = req.postDataJSON().status;
    else if (path.endsWith('/clients/team/review-doula')) {
      const body = req.postDataJSON();
      expect(body.profile_review_version).toBe(profile.profile_review_version);
      profile.profile_review_version++;
      if (body.review_action === 'changes_requested') {
        profile.profile_review_status = 'changes_requested';
        profile.profile_review_reason = body.review_reason;
      } else {
        expect(certificate).toBe('approved');
        profile.profile_review_status = 'approved';
        expect(profile.account_status).toBe('active');
      }
      data = { ...profile, role: 'doula' };
    } else if (path.endsWith('/documents'))
      data = {
        documents: [
          {
            id: 'cert',
            document_type: 'training_certificate',
            status: certificate,
            file_name: 'test-training.pdf',
            file_path: 'fixture/test-training.pdf',
          },
        ],
      };
    await route.fulfill({ status: 200, headers, json: data });
  });
  await page.goto('/doula-dashboard/profile');
  await page
    .getByRole('button', { name: 'Mark profile complete', exact: true })
    .click();
  await expect(
    page.getByText('Submitted — waiting for admin review', { exact: true })
  ).toBeVisible();
  role = 'admin';
  await page.goto('/team?review=review-doula');
  await expect(
    page.getByRole('button', { name: 'Send requested changes', exact: true })
  ).toBeDisabled();
  await page
    .getByLabel('Requested changes / rejection reason')
    .fill('Please explain your training in the bio.');
  await page
    .getByRole('button', { name: 'Send requested changes', exact: true })
    .click();
  await expect(
    page.getByText('Waiting for the doula to resolve:', { exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Approve profile', exact: true })
  ).toBeDisabled();
  role = 'doula';
  await page.goto('/doula-dashboard/profile');
  await expect(page.getByRole('alert')).toContainText(
    'Please explain your training in the bio.'
  );
  await page
    .getByLabel('About me (bio)')
    .fill('My corrected fictional bio describes my doula training.');
  await page
    .getByRole('button', { name: 'Resubmit for review', exact: true })
    .click();
  await expect(
    page.getByText('Submitted — waiting for admin review', { exact: true })
  ).toBeVisible();
  role = 'admin';
  await page.goto('/team?review=review-doula');
  await expect(
    page
      .getByRole('dialog')
      .getByText('My corrected fictional bio describes my doula training.', {
        exact: true,
      })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Approve profile', exact: true })
  ).toBeDisabled();
  await page
    .getByRole('button', { name: 'Approve document', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Approve profile', exact: true })
  ).toBeEnabled();
  await page
    .getByRole('button', { name: 'Approve profile', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Profile approved', exact: true })
  ).toBeVisible();
  role = 'doula';
  await page.goto('/doula-dashboard/profile');
  await expect(
    page.getByText('Profile approved', { exact: true })
  ).toBeVisible();
});
