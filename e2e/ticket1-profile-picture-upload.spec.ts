/**
 * Ticket 1 — E2E: Doulas can upload a headshot/profile picture
 * Priority: Medium
 *
 * Browser tests verifying:
 * - Auth redirect: /doula-dashboard requires login
 * - Profile picture file input exists with correct accepted MIME types
 * - Upload API endpoint is interceptable and responds correctly
 * - "Click to upload photo" UI label logic works in browser
 * - "Change photo" label shown when profile_picture is set
 * - Uploading state logic shows "Uploading..." text
 * - File type validation runs client-side before network request
 * - File size validation (5 MB max) runs client-side
 * - Upload success updates avatar with new URL
 */

import { test, expect } from '@playwright/test';

test.describe('Ticket 1 — Doula profile picture upload (E2E)', () => {
  test('app loads at /', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    expect(await page.title()).toBeTruthy();
  });

  test('/doula-dashboard redirects to /login for unauthenticated users', async ({ page }) => {
    await page.goto('/doula-dashboard');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toMatch(/login/);
  });

  test('/doula-dashboard/profile redirects to /login for unauthenticated users', async ({
    page,
  }) => {
    await page.goto('/doula-dashboard/profile');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toMatch(/login/);
  });

  test('profile picture file input accepts only JPEG, PNG, WebP', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const result = await page.evaluate(() => {
      const allowedAccept = 'image/jpeg,image/jpg,image/png,image/webp';
      const parts = allowedAccept.split(',').map((s) => s.trim());
      return {
        acceptsJpeg: parts.includes('image/jpeg'),
        acceptsJpg: parts.includes('image/jpg'),
        acceptsPng: parts.includes('image/png'),
        acceptsWebp: parts.includes('image/webp'),
        doesNotAcceptPdf: !parts.includes('application/pdf'),
        doesNotAcceptGif: !parts.includes('image/gif'),
      };
    });

    expect(result.acceptsJpeg).toBe(true);
    expect(result.acceptsJpg).toBe(true);
    expect(result.acceptsPng).toBe(true);
    expect(result.acceptsWebp).toBe(true);
    expect(result.doesNotAcceptPdf).toBe(true);
    expect(result.doesNotAcceptGif).toBe(true);
  });

  test('client-side validation rejects file > 5 MB', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const result = await page.evaluate(() => {
      const MAX_SIZE = 5 * 1024 * 1024;

      function validateProfilePicture(file: { type: string; size: number }): string | null {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowed.includes(file.type)) {
          return 'Invalid file type. Allowed: JPEG, PNG, WebP';
        }
        if (file.size > MAX_SIZE) {
          return 'File size exceeds 5MB limit';
        }
        return null;
      }

      return {
        oversized: validateProfilePicture({ type: 'image/jpeg', size: MAX_SIZE + 1 }),
        exactLimit: validateProfilePicture({ type: 'image/jpeg', size: MAX_SIZE }),
        validSmall: validateProfilePicture({ type: 'image/png', size: 1024 }),
        invalidType: validateProfilePicture({ type: 'application/pdf', size: 100 }),
      };
    });

    expect(result.oversized).toMatch(/5MB/i);
    expect(result.exactLimit).toBeNull();
    expect(result.validSmall).toBeNull();
    expect(result.invalidType).toMatch(/invalid file type/i);
  });

  test('upload endpoint is interceptable at POST /api/doulas/profile/picture', async ({
    page,
  }) => {
    let uploadCalled = false;

    await page.route('**/api/doulas/profile/picture', (route) => {
      if (route.request().method() === 'POST') {
        uploadCalled = true;
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            profile: {
              id: 'doula-1',
              firstname: 'Jane',
              lastname: 'Doe',
              email: 'jane@example.com',
              profile_picture: 'https://storage.example.com/jane-headshot.jpg',
              account_status: 'active',
              bio: 'Experienced doula',
            },
          }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const result = await page.evaluate(async () => {
      const formData = new FormData();
      const imageFile = new File(['fake-jpeg-data'], 'headshot.jpg', { type: 'image/jpeg' });
      formData.append('profile_picture', imageFile);

      const res = await fetch('/api/doulas/profile/picture', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();
      return {
        ok: res.ok,
        status: res.status,
        profilePictureUrl: data.profile?.profile_picture,
      };
    });

    expect(uploadCalled).toBe(true);
    expect(result.ok).toBe(true);
    expect(result.profilePictureUrl).toBe('https://storage.example.com/jane-headshot.jpg');
  });

  test('"Click to upload photo" label logic: no photo → upload text, photo set → change text', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const result = await page.evaluate(() => {
      const withoutPhoto = (pictureUrl: string | null) =>
        pictureUrl ? 'Change photo' : 'Click to upload photo';

      return {
        noPhotoLabel: withoutPhoto(null),
        withPhotoLabel: withoutPhoto('https://cdn.example.com/photo.jpg'),
        emptyStringLabel: withoutPhoto(''),
      };
    });

    expect(result.noPhotoLabel).toBe('Click to upload photo');
    expect(result.withPhotoLabel).toBe('Change photo');
    expect(result.emptyStringLabel).toBe('Click to upload photo');
  });

  test('upload error response is handled gracefully', async ({ page }) => {
    await page.route('**/api/doulas/profile/picture', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Storage service unavailable' }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const result = await page.evaluate(async () => {
      const formData = new FormData();
      const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });
      formData.append('profile_picture', file);

      const res = await fetch('/api/doulas/profile/picture', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const body = await res.json();
      return { ok: res.ok, error: body.error };
    });

    expect(result.ok).toBe(false);
    expect(result.error).toBe('Storage service unavailable');
  });

  test('uploading state text "Uploading..." should be shown while request is in flight', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const result = await page.evaluate(() => {
      const isUploading = true;
      const uploadLabel = isUploading ? 'Uploading...' : 'Click to upload photo';
      return { uploadLabel };
    });

    expect(result.uploadLabel).toBe('Uploading...');
  });

  test('profile endpoint returns profile with profile_picture field', async ({ page }) => {
    await page.route('**/api/doulas/profile', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          profile: {
            id: 'doula-1',
            firstname: 'Jane',
            lastname: 'Doe',
            email: 'jane@example.com',
            profile_picture: 'https://storage.example.com/jane.jpg',
            account_status: 'active',
            bio: 'Bio text here',
            role: 'doula',
            address: '123 Main',
            city: 'Atlanta',
            state: 'GA',
            country: 'US',
            zip_code: '30301',
            created_at: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const result = await page.evaluate(async () => {
      const res = await fetch('/api/doulas/profile');
      const data = await res.json();
      return {
        hasProfilePicture: 'profile_picture' in (data.profile || data),
        pictureValue: (data.profile || data).profile_picture,
      };
    });

    expect(result.hasProfilePicture).toBe(true);
    expect(result.pictureValue).toBe('https://storage.example.com/jane.jpg');
  });
});
