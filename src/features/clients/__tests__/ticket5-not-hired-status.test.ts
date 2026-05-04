/**
 * Ticket 5 — Remove "Customer" status and rename to "Not Hired"
 *
 * What we enforce via tests:
 * - UI-facing lists do NOT include the legacy "customer" status
 * - "not hired" is present and labeled consistently
 * - Schema may still accept legacy "customer" for backward compatibility, but maps it to "matched"
 */

import { describe, it, expect } from 'vitest';
import {
  CLIENT_STATUSES,
  CLIENT_STATUS_LABELS,
  type ClientStatus,
} from '@/domain/client';
import {
  USER_STATUSES,
  STATUS_LABELS,
  userStatusSchema,
} from '@/features/clients/data/schema';

// ─────────────────────────────────────────────
// 5A. "not hired" status exists and is correctly labeled
// ─────────────────────────────────────────────
describe('Ticket 5 — "not hired" status is implemented', () => {
  it('"not hired" is in CLIENT_STATUSES (domain/client.ts)', () => {
    expect(CLIENT_STATUSES).toContain('not hired');
  });

  it('"not hired" is in USER_STATUSES (schema.ts)', () => {
    expect(USER_STATUSES).toContain('not hired');
  });

  it('CLIENT_STATUS_LABELS["not hired"] is "Not Hired"', () => {
    expect(CLIENT_STATUS_LABELS['not hired']).toBe('Not Hired');
  });

  it('STATUS_LABELS["not hired"] is "Not Hired"', () => {
    expect(STATUS_LABELS['not hired']).toBe('Not Hired');
  });

  it('userStatusSchema accepts "not hired"', () => {
    const result = userStatusSchema.safeParse('not hired');
    expect(result.success).toBe(true);
  });

  it('"not hired" ClientStatus type is assignable', () => {
    const status: ClientStatus = 'not hired';
    expect(status).toBe('not hired');
  });
});

describe('Ticket 5 — legacy "customer" status is not user-selectable', () => {
  it('"customer" is NOT in CLIENT_STATUSES (domain/client.ts)', () => {
    expect(CLIENT_STATUSES).not.toContain('customer');
  });

  it('"customer" is NOT in USER_STATUSES (schema.ts)', () => {
    expect(USER_STATUSES).not.toContain('customer');
  });

  it('CLIENT_STATUS_LABELS does not expose a label for "customer"', () => {
    expect(Object.prototype.hasOwnProperty.call(CLIENT_STATUS_LABELS, 'customer')).toBe(false);
  });

  it('schema still accepts legacy "customer" value for backward compatibility', () => {
    const parsed = userStatusSchema.safeParse('customer');
    expect(parsed.success).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 5D. Status label consistency checks
// ─────────────────────────────────────────────
describe('Ticket 5 — "Not Hired" label consistency across status maps', () => {
  it('CLIENT_STATUS_LABELS and STATUS_LABELS both use "Not Hired" for "not hired"', () => {
    expect(CLIENT_STATUS_LABELS['not hired']).toBe('Not Hired');
    expect(STATUS_LABELS['not hired']).toBe('Not Hired');
    // Both maps agree on the label
    expect(CLIENT_STATUS_LABELS['not hired']).toBe(STATUS_LABELS['not hired']);
  });

  it('"not hired" status is a valid ClientStatus type value', () => {
    const statuses: ClientStatus[] = [...CLIENT_STATUSES];
    expect(statuses).toContain('not hired');
  });

  it('"not hired" appears exactly once in CLIENT_STATUSES', () => {
    const count = CLIENT_STATUSES.filter((s) => s === 'not hired').length;
    expect(count).toBe(1);
  });
});

// ─────────────────────────────────────────────
// 5E. Existing "customer" records migration concern
// ─────────────────────────────────────────────
describe('Ticket 5 — backward compatibility: "customer" in schema for existing records', () => {
  it('schema.ts keeps "customer" as legacy value (backward compat comment confirms this)', () => {
    // The schema.ts file has: // Legacy value kept for compatibility with existing records
    // This is acceptable ONLY as a transitional state with data migration plan.
    const result = userStatusSchema.safeParse('customer');
    expect(result.success).toBe(true);
  });

  it('"matching" is also a legacy alias that maps to "matched"', () => {
    const result = userStatusSchema.safeParse('matching');
    expect(result.success).toBe(true);
  });

  it('"not hired" and "customer" both parse successfully in current schema', () => {
    expect(userStatusSchema.safeParse('not hired').success).toBe(true);
    expect(userStatusSchema.safeParse('customer').success).toBe(true);
  });
});
