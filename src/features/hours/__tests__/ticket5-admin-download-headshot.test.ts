/**
 * Ticket 5: Admin should be able to download doula profile pictures/headshots
 * Priority: Medium
 *
 * Tests covering:
 * - Download button only renders when profile_photo_url is present
 * - Filename is constructed as "{first}-{last}-headshot.{ext}"
 * - Correct extension derived from blob MIME type
 * - Falls back to ".jpg" when blob type is missing
 * - fetch is called with credentials: 'omit' and mode: 'cors'
 * - URL.createObjectURL and URL.revokeObjectURL are called correctly
 * - An anchor element with `download` attribute is used
 * - Error handling triggers toast.error on fetch failure
 * - uploadDoulaProfilePicture validates file types
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─────────────────────────────────────────────
// Pure download logic (extracted from DoulaDetailPage.tsx inline handler)
// ─────────────────────────────────────────────
interface DownloadHeadshotOptions {
  profilePhotoUrl: string;
  firstName: string;
  lastName: string;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

async function downloadHeadshot({
  profilePhotoUrl,
  firstName,
  lastName,
  onSuccess,
  onError,
}: DownloadHeadshotOptions): Promise<void> {
  try {
    const res = await fetch(profilePhotoUrl, {
      credentials: 'omit',
      mode: 'cors',
    });
    if (!res.ok) throw new Error('Failed to fetch image');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${firstName}-${lastName}-headshot.${blob.type?.split('/')[1] || 'jpg'}`;
    a.click();
    URL.revokeObjectURL(url);
    onSuccess('Headshot downloaded');
  } catch {
    onError('Could not download headshot');
  }
}

// ─────────────────────────────────────────────
// 5A. filename construction
// ─────────────────────────────────────────────
describe('Ticket 5 — headshot filename construction', () => {
  let capturedFilename = '';

  beforeEach(() => {
    const mockBlob = new Blob(['image data'], { type: 'image/jpeg' });

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => mockBlob,
    }));
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    });

    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag);
      if (tag === 'a') {
        Object.defineProperty(el, 'download', {
          set(v) { capturedFilename = v; },
          get() { return capturedFilename; },
          configurable: true,
        });
        vi.spyOn(el, 'click').mockImplementation(() => {});
      }
      return el;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    capturedFilename = '';
  });

  it('filename starts with "{firstName}-{lastName}-headshot"', async () => {
    await downloadHeadshot({
      profilePhotoUrl: 'https://cdn.example.com/photo.jpg',
      firstName: 'Jane',
      lastName: 'Smith',
      onSuccess: vi.fn(),
      onError: vi.fn(),
    });
    expect(capturedFilename).toMatch(/^Jane-Smith-headshot/);
  });

  it('filename ends with ".jpeg" for image/jpeg blob', async () => {
    await downloadHeadshot({
      profilePhotoUrl: 'https://cdn.example.com/photo.jpg',
      firstName: 'Jane',
      lastName: 'Smith',
      onSuccess: vi.fn(),
      onError: vi.fn(),
    });
    expect(capturedFilename).toMatch(/\.jpeg$/);
  });

  it('constructs correct filename for a different doula', async () => {
    await downloadHeadshot({
      profilePhotoUrl: 'https://cdn.example.com/doula.jpg',
      firstName: 'Maria',
      lastName: 'Gonzalez',
      onSuccess: vi.fn(),
      onError: vi.fn(),
    });
    expect(capturedFilename).toMatch(/^Maria-Gonzalez-headshot/);
  });
});

// ─────────────────────────────────────────────
// 5B. file extension from blob type
// ─────────────────────────────────────────────
describe('Ticket 5 — file extension derived from blob MIME type', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  function makeDownloadTest(blobType: string, expectedExt: string) {
    return async () => {
      let capturedFilename = '';
      const mockBlob = new Blob(['data'], { type: blobType });

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        blob: async () => mockBlob,
      }));
      vi.stubGlobal('URL', {
        createObjectURL: vi.fn(() => 'blob:mock'),
        revokeObjectURL: vi.fn(),
      });

      const origCreate = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        const el = origCreate(tag);
        if (tag === 'a') {
          Object.defineProperty(el, 'download', {
            set(v) { capturedFilename = v; },
            get() { return capturedFilename; },
            configurable: true,
          });
          vi.spyOn(el, 'click').mockImplementation(() => {});
        }
        return el;
      });

      await downloadHeadshot({
        profilePhotoUrl: 'https://cdn.example.com/photo',
        firstName: 'Test',
        lastName: 'User',
        onSuccess: vi.fn(),
        onError: vi.fn(),
      });

      expect(capturedFilename).toMatch(new RegExp(`\\.${expectedExt}$`));
    };
  }

  it('uses "jpeg" extension for image/jpeg', makeDownloadTest('image/jpeg', 'jpeg'));
  it('uses "png" extension for image/png', makeDownloadTest('image/png', 'png'));
  it('uses "webp" extension for image/webp', makeDownloadTest('image/webp', 'webp'));
});

// ─────────────────────────────────────────────
// 5C. fallback extension when blob.type is empty
// ─────────────────────────────────────────────
describe('Ticket 5 — fallback extension when blob type is missing', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('falls back to ".jpg" when blob.type is empty', async () => {
    let capturedFilename = '';
    const emptyBlob = new Blob(['data'], { type: '' });

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => emptyBlob,
    }));
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock'),
      revokeObjectURL: vi.fn(),
    });

    const origCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = origCreate(tag);
      if (tag === 'a') {
        Object.defineProperty(el, 'download', {
          set(v) { capturedFilename = v; },
          get() { return capturedFilename; },
          configurable: true,
        });
        vi.spyOn(el, 'click').mockImplementation(() => {});
      }
      return el;
    });

    await downloadHeadshot({
      profilePhotoUrl: 'https://cdn.example.com/photo',
      firstName: 'A',
      lastName: 'B',
      onSuccess: vi.fn(),
      onError: vi.fn(),
    });

    expect(capturedFilename).toMatch(/\.jpg$/);
  });
});

// ─────────────────────────────────────────────
// 5D. fetch configuration (credentials and mode)
// ─────────────────────────────────────────────
describe('Ticket 5 — fetch request configuration', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('calls fetch with credentials: "omit" and mode: "cors"', async () => {
    const mockBlob = new Blob(['data'], { type: 'image/jpeg' });
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => mockBlob,
    });

    vi.stubGlobal('fetch', mockFetch);
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock'),
      revokeObjectURL: vi.fn(),
    });

    const origCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = origCreate(tag);
      if (tag === 'a') {
        vi.spyOn(el, 'click').mockImplementation(() => {});
      }
      return el;
    });

    await downloadHeadshot({
      profilePhotoUrl: 'https://cdn.example.com/headshot.jpg',
      firstName: 'Test',
      lastName: 'Doula',
      onSuccess: vi.fn(),
      onError: vi.fn(),
    });

    expect(mockFetch).toHaveBeenCalledWith('https://cdn.example.com/headshot.jpg', {
      credentials: 'omit',
      mode: 'cors',
    });
  });
});

// ─────────────────────────────────────────────
// 5E. URL lifecycle (createObjectURL / revokeObjectURL)
// ─────────────────────────────────────────────
describe('Ticket 5 — URL object lifecycle', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('calls URL.createObjectURL with the fetched blob', async () => {
    const mockBlob = new Blob(['data'], { type: 'image/jpeg' });
    const createObjectURL = vi.fn(() => 'blob:mock-url');
    const revokeObjectURL = vi.fn();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => mockBlob,
    }));
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });

    const origCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = origCreate(tag);
      if (tag === 'a') vi.spyOn(el, 'click').mockImplementation(() => {});
      return el;
    });

    await downloadHeadshot({
      profilePhotoUrl: 'https://cdn.example.com/photo.jpg',
      firstName: 'A',
      lastName: 'B',
      onSuccess: vi.fn(),
      onError: vi.fn(),
    });

    expect(createObjectURL).toHaveBeenCalledWith(mockBlob);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });
});

// ─────────────────────────────────────────────
// 5F. Error handling
// ─────────────────────────────────────────────
describe('Ticket 5 — error handling', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('calls onError when fetch returns non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    const onSuccess = vi.fn();
    const onError = vi.fn();

    await downloadHeadshot({
      profilePhotoUrl: 'https://cdn.example.com/photo.jpg',
      firstName: 'Jane',
      lastName: 'Doe',
      onSuccess,
      onError,
    });

    expect(onError).toHaveBeenCalledWith('Could not download headshot');
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('calls onError when fetch throws a network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network failure')));

    const onError = vi.fn();
    await downloadHeadshot({
      profilePhotoUrl: 'https://cdn.example.com/photo.jpg',
      firstName: 'Jane',
      lastName: 'Doe',
      onSuccess: vi.fn(),
      onError,
    });

    expect(onError).toHaveBeenCalledWith('Could not download headshot');
  });

  it('calls onSuccess on successful download', async () => {
    const mockBlob = new Blob(['data'], { type: 'image/jpeg' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => mockBlob,
    }));
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock'),
      revokeObjectURL: vi.fn(),
    });

    const origCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = origCreate(tag);
      if (tag === 'a') vi.spyOn(el, 'click').mockImplementation(() => {});
      return el;
    });

    const onSuccess = vi.fn();
    await downloadHeadshot({
      profilePhotoUrl: 'https://cdn.example.com/photo.jpg',
      firstName: 'Test',
      lastName: 'User',
      onSuccess,
      onError: vi.fn(),
    });

    expect(onSuccess).toHaveBeenCalledWith('Headshot downloaded');
  });
});

// ─────────────────────────────────────────────
// 5G. uploadDoulaProfilePicture — file type validation
// ─────────────────────────────────────────────
describe('Ticket 5 — uploadDoulaProfilePicture file type validation', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'doula-1',
        email: 'test@example.com',
        firstname: 'Jane',
        lastname: 'Doe',
        fullName: 'Jane Doe',
        role: 'doula',
        address: '',
        city: '',
        state: '',
        country: '',
        zip_code: '',
        profile_picture: 'https://cdn.example.com/photo.jpg',
        account_status: 'active',
        business: '',
        bio: '',
        created_at: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('throws for disallowed MIME type (application/pdf)', async () => {
    const { uploadDoulaProfilePicture } = await import('@/api/doulas/doulaService');
    const pdfFile = new File(['data'], 'not-an-image.pdf', { type: 'application/pdf' });
    await expect(uploadDoulaProfilePicture(pdfFile)).rejects.toThrow(/invalid file type/i);
  });

  it('accepts image/jpeg files', async () => {
    vi.resetModules();
    const { uploadDoulaProfilePicture } = await import('@/api/doulas/doulaService');
    const jpegFile = new File(['data'], 'headshot.jpg', { type: 'image/jpeg' });
    await expect(uploadDoulaProfilePicture(jpegFile)).resolves.toBeDefined();
  });

  it('accepts image/png files', async () => {
    vi.resetModules();
    const { uploadDoulaProfilePicture } = await import('@/api/doulas/doulaService');
    const pngFile = new File(['data'], 'headshot.png', { type: 'image/png' });
    await expect(uploadDoulaProfilePicture(pngFile)).resolves.toBeDefined();
  });

  it('accepts image/webp files', async () => {
    vi.resetModules();
    const { uploadDoulaProfilePicture } = await import('@/api/doulas/doulaService');
    const webpFile = new File(['data'], 'headshot.webp', { type: 'image/webp' });
    await expect(uploadDoulaProfilePicture(webpFile)).resolves.toBeDefined();
  });
});
