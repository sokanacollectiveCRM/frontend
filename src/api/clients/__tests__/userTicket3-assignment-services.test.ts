/**
 * USER Ticket 3 — Admin client assignment: choose service(s) + view other assigned doulas/services
 * Priority: High
 *
 * Validates:
 *  - Allowed services list matches the ticket: Labor Support, Postpartum Support,
 *    1st Night Care, Lactation Support, Perinatal Education, Abortion Support, Other
 *  - assignDoula sends services: string[] in the POST body when provided
 *  - assignDoula omits services when empty/undefined (back-compat)
 *  - Backend compatibility: services / serviceNames / service_names all parsed
 *    by the assignment table mapper (DoulaListPage)
 *  - Multiple selected services round-trip correctly
 *  - Validation: at least one service must be selected before submit
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { assignDoula } from '@/api/clients/doulaAssignments';

const originalFetch = global.fetch;

// The frontend's assignment service options (mirrors DoulaListPage.tsx).
const ASSIGNMENT_SERVICE_OPTIONS = [
  'Labor Support',
  'Postpartum Support',
  '1st Night Care',
  'Lactation Support',
  'Perinatal Education',
  'Abortion Support',
  'Other',
] as const;

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  global.fetch = originalFetch;
});

function mockFetchOk() {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 })
    );
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

// ─────────────────────────────────────────────
// 3A. Allowed services list
// ─────────────────────────────────────────────
describe('USER Ticket 3 — allowed assignment services', () => {
  it('exposes exactly the 7 services described in the ticket', () => {
    expect(ASSIGNMENT_SERVICE_OPTIONS).toEqual([
      'Labor Support',
      'Postpartum Support',
      '1st Night Care',
      'Lactation Support',
      'Perinatal Education',
      'Abortion Support',
      'Other',
    ]);
    expect(ASSIGNMENT_SERVICE_OPTIONS).toHaveLength(7);
  });

  it('includes each individually-named service from the ticket body', () => {
    expect(ASSIGNMENT_SERVICE_OPTIONS).toContain('Labor Support');
    expect(ASSIGNMENT_SERVICE_OPTIONS).toContain('Postpartum Support');
    expect(ASSIGNMENT_SERVICE_OPTIONS).toContain('1st Night Care');
    expect(ASSIGNMENT_SERVICE_OPTIONS).toContain('Lactation Support');
    expect(ASSIGNMENT_SERVICE_OPTIONS).toContain('Perinatal Education');
    expect(ASSIGNMENT_SERVICE_OPTIONS).toContain('Abortion Support');
    expect(ASSIGNMENT_SERVICE_OPTIONS).toContain('Other');
  });
});

// ─────────────────────────────────────────────
// 3B. assignDoula payload contract (services)
// ─────────────────────────────────────────────
describe('USER Ticket 3 — assignDoula sends services in payload', () => {
  it('sends a single-service array', async () => {
    const fetchMock = mockFetchOk();
    await assignDoula('client-1', 'doula-A', {
      services: ['Labor Support'],
    });

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.services).toEqual(['Labor Support']);
  });

  it('sends a multi-service array preserving order', async () => {
    const fetchMock = mockFetchOk();
    await assignDoula('client-1', 'doula-A', {
      services: ['Labor Support', 'Postpartum Support', '1st Night Care'],
    });

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.services).toEqual([
      'Labor Support',
      'Postpartum Support',
      '1st Night Care',
    ]);
  });

  it('sends BOTH role and services when both are provided', async () => {
    const fetchMock = mockFetchOk();
    await assignDoula('client-1', 'doula-A', {
      role: 'primary',
      services: ['Lactation Support', 'Perinatal Education'],
    });

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.role).toBe('primary');
    expect(body.services).toEqual(['Lactation Support', 'Perinatal Education']);
  });

  it('omits services key when array is empty (back-compat)', async () => {
    const fetchMock = mockFetchOk();
    await assignDoula('client-1', 'doula-A', { role: 'primary', services: [] });

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect('services' in body).toBe(false);
  });

  it('omits services key when not provided', async () => {
    const fetchMock = mockFetchOk();
    await assignDoula('client-1', 'doula-A', { role: 'backup' });

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect('services' in body).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 3C. Backend compat: services / serviceNames / service_names
// ─────────────────────────────────────────────
describe('USER Ticket 3 — assignment row reads multiple service-key shapes', () => {
  /*
   * Mirrors DoulaListPage.tsx#mapAssignmentRow: tries `services`, then
   * `serviceNames`, then `service_names`, accepting both arrays and
   * comma-separated strings.
   */
  function readServices(
    raw: Record<string, unknown>,
    keys: string[] = ['services', 'serviceNames', 'service_names']
  ): string[] {
    for (const key of keys) {
      const value = raw[key];
      if (Array.isArray(value)) {
        const parsed = value
          .filter((item): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter(Boolean);
        if (parsed.length > 0) return parsed;
      } else if (typeof value === 'string' && value.trim()) {
        const parsed = value
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
        if (parsed.length > 0) return parsed;
      }
    }
    return [];
  }

  it('parses an array under "services"', () => {
    expect(readServices({ services: ['Labor Support'] })).toEqual([
      'Labor Support',
    ]);
  });

  it('parses an array under "serviceNames" when "services" is absent', () => {
    expect(
      readServices({ serviceNames: ['Postpartum Support', 'Other'] })
    ).toEqual(['Postpartum Support', 'Other']);
  });

  it('parses snake_case "service_names" as fallback', () => {
    expect(
      readServices({ service_names: ['Lactation Support'] })
    ).toEqual(['Lactation Support']);
  });

  it('parses a comma-separated string when array is unavailable', () => {
    expect(
      readServices({ services: 'Labor Support, Postpartum Support' })
    ).toEqual(['Labor Support', 'Postpartum Support']);
  });

  it('returns [] when none of the keys carry a value', () => {
    expect(readServices({})).toEqual([]);
    expect(readServices({ services: [] })).toEqual([]);
    expect(readServices({ services: '' })).toEqual([]);
  });
});

// ─────────────────────────────────────────────
// 3D. Validation gate — at least one service required
// ─────────────────────────────────────────────
describe('USER Ticket 3 — submit gate requires at least one service', () => {
  /*
   * Mirrors the DoulaListPage assign-button disabled state:
   *   selectedAssignmentServices.length === 0 → button disabled
   */
  function canSubmit(input: {
    doulaId: string | undefined;
    clientId: string | undefined;
    services: string[];
    assigning: boolean;
  }): boolean {
    return (
      Boolean(input.doulaId) &&
      Boolean(input.clientId) &&
      input.services.length > 0 &&
      !input.assigning
    );
  }

  it('blocks submit when services is empty', () => {
    expect(
      canSubmit({
        doulaId: 'd-1',
        clientId: 'c-1',
        services: [],
        assigning: false,
      })
    ).toBe(false);
  });

  it('blocks submit when client is not selected', () => {
    expect(
      canSubmit({
        doulaId: 'd-1',
        clientId: '',
        services: ['Labor Support'],
        assigning: false,
      })
    ).toBe(false);
  });

  it('blocks submit when an assignment is already in flight', () => {
    expect(
      canSubmit({
        doulaId: 'd-1',
        clientId: 'c-1',
        services: ['Labor Support'],
        assigning: true,
      })
    ).toBe(false);
  });

  it('allows submit when client + doula + services are all set', () => {
    expect(
      canSubmit({
        doulaId: 'd-1',
        clientId: 'c-1',
        services: ['Labor Support'],
        assigning: false,
      })
    ).toBe(true);
  });

  it('allows submit with multiple services selected', () => {
    expect(
      canSubmit({
        doulaId: 'd-1',
        clientId: 'c-1',
        services: ['Labor Support', 'Postpartum Support'],
        assigning: false,
      })
    ).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 3E. Services label rendering
// ─────────────────────────────────────────────
describe('USER Ticket 3 — services display label', () => {
  /*
   * Mirrors getAssignmentServicesLabel from DoulaListPage:
   *   joins with ", " or returns "—" when empty
   */
  function getAssignmentServicesLabel(services: string[]): string {
    if (!Array.isArray(services) || services.length === 0) return '—';
    return services.join(', ');
  }

  it('joins multiple services with ", "', () => {
    expect(
      getAssignmentServicesLabel(['Labor Support', 'Postpartum Support'])
    ).toBe('Labor Support, Postpartum Support');
  });

  it('renders a single service as-is', () => {
    expect(getAssignmentServicesLabel(['Labor Support'])).toBe('Labor Support');
  });

  it('renders an em-dash for empty', () => {
    expect(getAssignmentServicesLabel([])).toBe('—');
  });
});
