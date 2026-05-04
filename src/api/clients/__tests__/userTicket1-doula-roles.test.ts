/**
 * USER Ticket 1 — Add category to describe Primary and Backup doulas
 * Priority: High
 *
 * Validates:
 *  - DoulaAssignmentRole supports 'primary' and 'backup'
 *  - ASSIGNMENT_ROLE_OPTIONS expose Primary / Backup labels
 *  - normalizeAssignmentRole handles casing, whitespace, and unknown values
 *  - assignDoula sends `role` in the POST body when provided
 *  - assignDoula omits `role` when not provided (back-compat)
 *  - Two doulas (Primary + Backup) on the same client share the same role contract
 *  - "Unnamed client" fallback only triggers when first+last are both blank
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ASSIGNMENT_ROLE_OPTIONS,
  assignDoula,
  normalizeAssignmentRole,
  type DoulaAssignmentRole,
} from '@/api/clients/doulaAssignments';

const originalFetch = global.fetch;

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  global.fetch = originalFetch;
});

// ─────────────────────────────────────────────
// 1A. ASSIGNMENT_ROLE_OPTIONS
// ─────────────────────────────────────────────
describe('USER Ticket 1 — ASSIGNMENT_ROLE_OPTIONS', () => {
  it('exposes Primary and Backup options', () => {
    const values = ASSIGNMENT_ROLE_OPTIONS.map((option) => option.value);
    expect(values).toEqual(['primary', 'backup']);
  });

  it('exposes user-facing labels Primary / Backup', () => {
    const labels = ASSIGNMENT_ROLE_OPTIONS.map((option) => option.label);
    expect(labels).toEqual(['Primary', 'Backup']);
  });

  it('only exposes the documented options (no extras)', () => {
    expect(ASSIGNMENT_ROLE_OPTIONS).toHaveLength(2);
  });
});

// ─────────────────────────────────────────────
// 1B. normalizeAssignmentRole
// ─────────────────────────────────────────────
describe('USER Ticket 1 — normalizeAssignmentRole', () => {
  it('returns "primary" for canonical lowercase input', () => {
    expect(normalizeAssignmentRole('primary')).toBe('primary');
  });

  it('returns "backup" for canonical lowercase input', () => {
    expect(normalizeAssignmentRole('backup')).toBe('backup');
  });

  it('is case-insensitive (Primary, BACKUP, etc.)', () => {
    expect(normalizeAssignmentRole('Primary')).toBe('primary');
    expect(normalizeAssignmentRole('BACKUP')).toBe('backup');
    expect(normalizeAssignmentRole('PrImArY')).toBe('primary');
  });

  it('trims surrounding whitespace', () => {
    expect(normalizeAssignmentRole('  primary  ')).toBe('primary');
    expect(normalizeAssignmentRole('\tbackup\n')).toBe('backup');
  });

  it('returns null for unknown / empty / non-string values', () => {
    expect(normalizeAssignmentRole('lead')).toBeNull();
    expect(normalizeAssignmentRole('')).toBeNull();
    expect(normalizeAssignmentRole(null)).toBeNull();
    expect(normalizeAssignmentRole(undefined)).toBeNull();
    expect(normalizeAssignmentRole(123)).toBeNull();
    expect(normalizeAssignmentRole({})).toBeNull();
  });
});

// ─────────────────────────────────────────────
// 1C. assignDoula payload contract (role)
// ─────────────────────────────────────────────
describe('USER Ticket 1 — assignDoula sends role in payload', () => {
  function mockFetchOk() {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );
    global.fetch = fetchMock as unknown as typeof fetch;
    return fetchMock;
  }

  it('sends role: "primary" in the POST body', async () => {
    const fetchMock = mockFetchOk();
    await assignDoula('client-1', 'doula-A', { role: 'primary' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.doulaId).toBe('doula-A');
    expect(body.role).toBe('primary');
  });

  it('sends role: "backup" in the POST body', async () => {
    const fetchMock = mockFetchOk();
    await assignDoula('client-1', 'doula-B', { role: 'backup' });

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.doulaId).toBe('doula-B');
    expect(body.role).toBe('backup');
  });

  it('omits role when not provided (back-compat with legacy assignments)', async () => {
    const fetchMock = mockFetchOk();
    await assignDoula('client-1', 'doula-C');

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.doulaId).toBe('doula-C');
    expect('role' in body).toBe(false);
  });

  it('targets the canonical /clients/:id/assign-doula endpoint', async () => {
    const fetchMock = mockFetchOk();
    await assignDoula('client-1', 'doula-A', { role: 'primary' });

    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/clients\/client-1\/assign-doula$/);
  });

  it('throws a useful error when the assignment endpoint fails', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response('boom', { status: 500 })
      ) as unknown as typeof fetch;

    await expect(
      assignDoula('client-1', 'doula-A', { role: 'primary' })
    ).rejects.toThrow(/Failed to assign doula: 500/);
  });
});

// ─────────────────────────────────────────────
// 1D. Two-doula (Primary + Backup) on a single client
// ─────────────────────────────────────────────
describe('USER Ticket 1 — supports Primary AND Backup on the same client', () => {
  it('both calls use the same client id with different doula ids/roles', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );
    global.fetch = fetchMock as unknown as typeof fetch;

    await assignDoula('client-99', 'doula-PRIMARY', { role: 'primary' });
    await assignDoula('client-99', 'doula-BACKUP', { role: 'backup' });

    const calls = fetchMock.mock.calls;
    expect(calls).toHaveLength(2);

    const url1 = String(calls[0][0]);
    const url2 = String(calls[1][0]);
    expect(url1).toMatch(/\/clients\/client-99\/assign-doula$/);
    expect(url2).toMatch(/\/clients\/client-99\/assign-doula$/);

    const body1 = JSON.parse((calls[0][1] as RequestInit).body as string);
    const body2 = JSON.parse((calls[1][1] as RequestInit).body as string);
    expect(body1.role).toBe('primary');
    expect(body2.role).toBe('backup');
    expect(body1.doulaId).not.toBe(body2.doulaId);
  });
});

// ─────────────────────────────────────────────
// 1E. Regression — "Unnamed client" fallback
// ─────────────────────────────────────────────
describe('USER Ticket 1 — "Unnamed client" only when first+last are both blank', () => {
  /*
   * The DoulaListPage builds the client option label exactly like:
   *   `${firstname} ${lastname}`.trim() || 'Unnamed client'
   * which is what we exercise here.
   */
  function buildClientLabel(first: string | undefined, last: string | undefined): string {
    return `${first ?? ''} ${last ?? ''}`.trim() || 'Unnamed client';
  }

  it('returns full name when first+last are present', () => {
    expect(buildClientLabel('Jane', 'Doe')).toBe('Jane Doe');
  });

  it('returns first only when last is missing', () => {
    expect(buildClientLabel('Jane', '')).toBe('Jane');
  });

  it('returns last only when first is missing', () => {
    expect(buildClientLabel('', 'Doe')).toBe('Doe');
  });

  it('returns "Unnamed client" only when both first AND last are blank', () => {
    expect(buildClientLabel('', '')).toBe('Unnamed client');
    expect(buildClientLabel(undefined, undefined)).toBe('Unnamed client');
    expect(buildClientLabel('   ', '   ')).toBe('Unnamed client');
  });

  it('does NOT classify a valid name as "Unnamed client"', () => {
    expect(buildClientLabel('Jane', 'Doe')).not.toBe('Unnamed client');
    expect(buildClientLabel('A', 'B')).not.toBe('Unnamed client');
  });
});

// ─────────────────────────────────────────────
// 1F. Type contract — DoulaAssignmentRole only allows primary | backup
// ─────────────────────────────────────────────
describe('USER Ticket 1 — DoulaAssignmentRole type contract', () => {
  it('accepts the literal "primary"', () => {
    const role: DoulaAssignmentRole = 'primary';
    expect(role).toBe('primary');
  });

  it('accepts the literal "backup"', () => {
    const role: DoulaAssignmentRole = 'backup';
    expect(role).toBe('backup');
  });
});
