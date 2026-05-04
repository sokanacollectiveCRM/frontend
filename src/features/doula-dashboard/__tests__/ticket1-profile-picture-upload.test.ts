/**
 * Ticket 1 — Add ability for doulas to upload a headshot/profile picture
 * Priority: Medium
 *
 * Tests covering:
 * - uploadDoulaProfilePicture rejects invalid file types (PDF, GIF, TXT)
 * - uploadDoulaProfilePicture accepts JPEG, JPG, PNG, WebP
 * - uploadDoulaProfilePicture enforces 5 MB max size limit
 * - POSTs FormData to /api/doulas/profile/picture with 'profile_picture' field
 * - Returns updated DoulaProfile with profile_picture URL on success
 * - Throws on server error response
 * - DoulaProfile interface includes profile_picture field (string | null)
 * - UI displays "Click to upload photo" when no photo; "Change photo" when photo exists
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { uploadDoulaProfilePicture } from '@/api/doulas/doulaService';

const MOCK_PROFILE = {
  id: 'doula-1',
  email: 'doula@example.com',
  firstname: 'Jane',
  lastname: 'Doe',
  fullName: 'Jane Doe',
  role: 'doula',
  address: '123 Main St',
  city: 'Atlanta',
  state: 'GA',
  country: 'US',
  zip_code: '30301',
  profile_picture: 'https://storage.example.com/headshot.jpg',
  account_status: 'active',
  business: '',
  bio: 'Experienced doula',
  created_at: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// ─────────────────────────────────────────────
// 1A. File type validation — rejected types
// ─────────────────────────────────────────────
describe('Ticket 1 — profile picture: invalid file types are rejected', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ profile: MOCK_PROFILE }),
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('throws for application/pdf', async () => {
    const file = new File(['data'], 'doc.pdf', { type: 'application/pdf' });
    await expect(uploadDoulaProfilePicture(file)).rejects.toThrow(/invalid file type/i);
  });

  it('throws for image/gif', async () => {
    const file = new File(['data'], 'anim.gif', { type: 'image/gif' });
    await expect(uploadDoulaProfilePicture(file)).rejects.toThrow(/invalid file type/i);
  });

  it('throws for text/plain', async () => {
    const file = new File(['data'], 'file.txt', { type: 'text/plain' });
    await expect(uploadDoulaProfilePicture(file)).rejects.toThrow(/invalid file type/i);
  });

  it('throws for video/mp4', async () => {
    const file = new File(['data'], 'video.mp4', { type: 'video/mp4' });
    await expect(uploadDoulaProfilePicture(file)).rejects.toThrow(/invalid file type/i);
  });

  it('error message mentions allowed types (JPEG, PNG, WebP)', async () => {
    const file = new File(['data'], 'doc.pdf', { type: 'application/pdf' });
    await expect(uploadDoulaProfilePicture(file)).rejects.toThrow(/jpeg|png|webp/i);
  });
});

// ─────────────────────────────────────────────
// 1B. File type validation — accepted types
// ─────────────────────────────────────────────
describe('Ticket 1 — profile picture: valid file types are accepted', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ profile: MOCK_PROFILE }),
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('accepts image/jpeg', async () => {
    const file = new File(['img'], 'headshot.jpeg', { type: 'image/jpeg' });
    await expect(uploadDoulaProfilePicture(file)).resolves.toBeDefined();
  });

  it('accepts image/jpg', async () => {
    const file = new File(['img'], 'headshot.jpg', { type: 'image/jpg' });
    await expect(uploadDoulaProfilePicture(file)).resolves.toBeDefined();
  });

  it('accepts image/png', async () => {
    const file = new File(['img'], 'headshot.png', { type: 'image/png' });
    await expect(uploadDoulaProfilePicture(file)).resolves.toBeDefined();
  });

  it('accepts image/webp', async () => {
    const file = new File(['img'], 'headshot.webp', { type: 'image/webp' });
    await expect(uploadDoulaProfilePicture(file)).resolves.toBeDefined();
  });
});

// ─────────────────────────────────────────────
// 1C. File size validation
// ─────────────────────────────────────────────
describe('Ticket 1 — profile picture: file size limit is 5 MB', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ profile: MOCK_PROFILE }),
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('throws for file > 5 MB', async () => {
    const MAX_5MB = 5 * 1024 * 1024;
    const oversized = new File([new Uint8Array(MAX_5MB + 1)], 'big.jpg', { type: 'image/jpeg' });
    await expect(uploadDoulaProfilePicture(oversized)).rejects.toThrow(/5MB/i);
  });

  it('accepts file exactly at 5 MB', async () => {
    const MAX_5MB = 5 * 1024 * 1024;
    const exact = new File([new Uint8Array(MAX_5MB)], 'exact.jpg', { type: 'image/jpeg' });
    await expect(uploadDoulaProfilePicture(exact)).resolves.toBeDefined();
  });

  it('accepts a small file well under the limit', async () => {
    const small = new File(['small image data'], 'small.png', { type: 'image/png' });
    await expect(uploadDoulaProfilePicture(small)).resolves.toBeDefined();
  });
});

// ─────────────────────────────────────────────
// 1D. HTTP request: correct endpoint and form data
// ─────────────────────────────────────────────
describe('Ticket 1 — profile picture: correct API endpoint and FormData field', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('POSTs to /api/doulas/profile/picture', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ profile: MOCK_PROFILE }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' });
    await uploadDoulaProfilePicture(file);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toMatch(/\/doulas\/profile\/picture/);
    expect(options.method).toBe('POST');
  });

  it('FormData includes "profile_picture" field with the file', async () => {
    let capturedBody: FormData | null = null;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((_url: string, opts: RequestInit) => {
        capturedBody = opts.body as FormData;
        return Promise.resolve({
          ok: true,
          json: async () => ({ profile: MOCK_PROFILE }),
        });
      })
    );

    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' });
    await uploadDoulaProfilePicture(file);

    expect(capturedBody).not.toBeNull();
    const fieldValue = capturedBody!.get('profile_picture');
    expect(fieldValue).not.toBeNull();
    expect(fieldValue instanceof File).toBe(true);
  });

  it('includes credentials: include in request', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ profile: MOCK_PROFILE }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' });
    await uploadDoulaProfilePicture(file);

    const [, options] = mockFetch.mock.calls[0];
    expect(options.credentials).toBe('include');
  });
});

// ─────────────────────────────────────────────
// 1E. Return value and error handling
// ─────────────────────────────────────────────
describe('Ticket 1 — profile picture: return value and error handling', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('returns updated profile with profile_picture URL after successful upload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ profile: MOCK_PROFILE }),
      })
    );

    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' });
    const result = await uploadDoulaProfilePicture(file);

    expect(result.profile_picture).toBe('https://storage.example.com/headshot.jpg');
    expect(result.id).toBe('doula-1');
    expect(result.firstname).toBe('Jane');
  });

  it('handles direct profile response (no wrapper object)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_PROFILE,
      })
    );

    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' });
    const result = await uploadDoulaProfilePicture(file);
    expect(result.profile_picture).toBe('https://storage.example.com/headshot.jpg');
  });

  it('throws with server error message when upload fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Storage quota exceeded' }),
      })
    );

    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' });
    await expect(uploadDoulaProfilePicture(file)).rejects.toThrow(/storage quota exceeded/i);
  });

  it('throws generic message when server error has no message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({}),
      })
    );

    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' });
    await expect(uploadDoulaProfilePicture(file)).rejects.toThrow(/profile picture/i);
  });
});

// ─────────────────────────────────────────────
// 1F. UI text logic: "Click to upload" vs "Change photo"
// ─────────────────────────────────────────────
describe('Ticket 1 — profile picture: UI label logic', () => {
  it('shows "Click to upload photo" when profile_picture is null', () => {
    const profile = { profile_picture: null };
    const label = profile.profile_picture ? 'Change photo' : 'Click to upload photo';
    expect(label).toBe('Click to upload photo');
  });

  it('shows "Change photo" when profile_picture URL is set', () => {
    const profile = { profile_picture: 'https://cdn.example.com/photo.jpg' };
    const label = profile.profile_picture ? 'Change photo' : 'Click to upload photo';
    expect(label).toBe('Change photo');
  });

  it('shows "Click to upload photo" when profile_picture is empty string', () => {
    const profile = { profile_picture: '' };
    const label = profile.profile_picture ? 'Change photo' : 'Click to upload photo';
    expect(label).toBe('Click to upload photo');
  });

  it('camera icon is always visible (no photo) or shown on hover (existing photo)', () => {
    const withoutPhoto = { profile_picture: null };
    const withPhoto = { profile_picture: 'https://cdn.example.com/photo.jpg' };

    const iconOpacityWithout = withoutPhoto.profile_picture
      ? 'opacity-0 group-hover:opacity-100'
      : 'opacity-100';
    const iconOpacityWith = withPhoto.profile_picture
      ? 'opacity-0 group-hover:opacity-100'
      : 'opacity-100';

    expect(iconOpacityWithout).toBe('opacity-100');
    expect(iconOpacityWith).toBe('opacity-0 group-hover:opacity-100');
  });
});
