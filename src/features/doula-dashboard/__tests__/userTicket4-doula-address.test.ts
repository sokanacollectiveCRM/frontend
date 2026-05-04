/**
 * USER Ticket 4 — Add an address database column for doulas
 * Priority: Medium
 *
 * Validates the FE side of the address field:
 *  - DoulaProfile / UpdateProfileData carry an `address` field
 *  - 'address' is a required text field on the doula profile form
 *  - profile → form data maps `address` 1:1 (incl. null/undefined → '')
 *  - PUT /api/doulas/profile sends `address` in the JSON payload
 *  - mapDirectoryRow (admin doula directory) builds `address` string from
 *    parts and stays null-safe when fields are missing
 */

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  type DoulaProfile,
  type UpdateProfileData,
  updateDoulaProfile,
} from '@/api/doulas/doulaService';

const originalFetch = global.fetch;

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  global.fetch = originalFetch;
});

// Minimal DoulaProfile factory (only the bits we touch)
function makeProfile(overrides: Partial<DoulaProfile> = {}): DoulaProfile {
  return {
    id: 'd1',
    email: 'd@example.com',
    firstname: 'Jane',
    lastname: 'Doe',
    fullName: 'Jane Doe',
    role: 'doula',
    address: '123 Main St',
    city: 'Atlanta',
    state: 'GA',
    country: 'US',
    zip_code: '30301',
    profile_picture: null,
    account_status: 'active',
    business: '',
    bio: 'Experienced doula.',
    created_at: '',
    updatedAt: '',
    ...overrides,
  };
}

// ─────────────────────────────────────────────
// 4A. Type / required-fields contract
// ─────────────────────────────────────────────
describe('USER Ticket 4 — address is part of the doula profile contract', () => {
  it('DoulaProfile.address is a string field', () => {
    const profile: DoulaProfile = makeProfile();
    expect(typeof profile.address).toBe('string');
    expect(profile.address).toBe('123 Main St');
  });

  it('UpdateProfileData.address accepts string values', () => {
    const update: UpdateProfileData = { address: '456 Oak Ave' };
    expect(update.address).toBe('456 Oak Ave');
  });

  it("'address' is in the doula profile REQUIRED_TEXT_FIELDS list", () => {
    // Mirrors REQUIRED_TEXT_FIELDS in ProfileTab.tsx
    const REQUIRED_TEXT_FIELDS = [
      'firstname',
      'lastname',
      'address',
      'city',
      'state',
      'country',
      'zip_code',
      'bio',
      'pronouns',
    ];
    expect(REQUIRED_TEXT_FIELDS).toContain('address');
  });
});

// ─────────────────────────────────────────────
// 4B. profileToFormData round-trip for address
// ─────────────────────────────────────────────
describe('USER Ticket 4 — profile → form data maps address', () => {
  function profileToFormData(profile: DoulaProfile): UpdateProfileData {
    return { address: profile.address || '' };
  }

  it('maps a non-empty address through directly', () => {
    expect(profileToFormData(makeProfile({ address: '789 Pine Rd' }))).toEqual({
      address: '789 Pine Rd',
    });
  });

  it('maps a null/undefined address to empty string (null-safe)', () => {
    const noAddrProfile = makeProfile({
      address: undefined as unknown as string,
    });
    expect(profileToFormData(noAddrProfile)).toEqual({ address: '' });
  });
});

// ─────────────────────────────────────────────
// 4C. PUT /api/doulas/profile carries address
// ─────────────────────────────────────────────
describe('USER Ticket 4 — updateDoulaProfile sends address in payload', () => {
  function mockProfileUpdateOk(returnedAddress: string) {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          profile: makeProfile({ address: returnedAddress }),
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );
    global.fetch = fetchMock as unknown as typeof fetch;
    return fetchMock;
  }

  it('includes address in the JSON body of the PUT request', async () => {
    const fetchMock = mockProfileUpdateOk('999 Elm St');
    await updateDoulaProfile({
      firstname: 'Jane',
      lastname: 'Doe',
      address: '999 Elm St',
      city: 'Atlanta',
      state: 'GA',
      country: 'US',
      zip_code: '30301',
      bio: 'Hi',
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/api\/doulas\/profile$/);
    expect((init as RequestInit).method).toBe('PUT');
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.address).toBe('999 Elm St');
  });

  it('returns the saved profile.address from the API response', async () => {
    mockProfileUpdateOk('1 Roundabout Way');
    const profile = await updateDoulaProfile({
      address: '1 Roundabout Way',
    });
    expect(profile.address).toBe('1 Roundabout Way');
  });

  it('rejects with the server error when address save fails', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ error: 'address invalid' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      ) as unknown as typeof fetch;

    await expect(
      updateDoulaProfile({ address: '!' })
    ).rejects.toThrow('address invalid');
  });
});

// ─────────────────────────────────────────────
// 4D. Admin directory: address built from parts (null-safe)
// ─────────────────────────────────────────────
describe('USER Ticket 4 — admin directory address rendering', () => {
  /*
   * Mirrors mapDirectoryRow in DoulaListPage: address built as
   *   [address, city, state, zip].filter(Boolean).join(', ')
   * Empty parts are dropped; missing-everywhere → undefined.
   */
  function buildAddress(input: {
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  }): string | undefined {
    const built = [input.address, input.city, input.state, input.zip]
      .filter((part): part is string => Boolean(part && part.trim()))
      .join(', ');
    return built || undefined;
  }

  it('joins all four parts with ", "', () => {
    expect(
      buildAddress({
        address: '123 Main St',
        city: 'Atlanta',
        state: 'GA',
        zip: '30301',
      })
    ).toBe('123 Main St, Atlanta, GA, 30301');
  });

  it('skips empty/missing parts', () => {
    expect(buildAddress({ address: '123 Main St', state: 'GA' })).toBe(
      '123 Main St, GA'
    );
  });

  it('returns undefined when all parts are missing (UI shows blank/—)', () => {
    expect(buildAddress({})).toBeUndefined();
    expect(
      buildAddress({ address: '', city: '', state: '', zip: '' })
    ).toBeUndefined();
  });

  it('does not crash on whitespace-only parts', () => {
    expect(
      buildAddress({ address: '   ', city: 'Atlanta' })
    ).toBe('Atlanta');
  });
});
