/**
 * Ticket 1: Doula Hours Logging — Distinguish Prenatal vs Postpartum hours
 * Priority: High
 *
 * Tests covering:
 * - HourType type definition includes 'prenatal' | 'postpartum' | 'unknown'
 * - hourTypeOptions only exposes prenatal and postpartum (not unknown)
 * - normalizeHourType correctly maps raw API strings to HourType
 * - getHourTypeLabel returns proper display labels
 * - getHourTypeBadgeClass returns distinct CSS classes per type
 * - formatDurationHours formats decimal hours into h/m strings
 * - addWorkSession includes the `type` field in the POST body
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  normalizeHourType,
  getHourTypeLabel,
  getHourTypeBadgeClass,
  formatDurationHours,
  hourTypeOptions,
  type HourType,
} from '@/features/hours/data/hour-types';

// ─────────────────────────────────────────────
// 1A. hourTypeOptions — prenatal & postpartum only
// ─────────────────────────────────────────────
describe('Ticket 1 — hourTypeOptions', () => {
  it('contains exactly two entries: prenatal and postpartum', () => {
    expect(hourTypeOptions).toHaveLength(2);
    const values = hourTypeOptions.map((o) => o.value);
    expect(values).toContain('prenatal');
    expect(values).toContain('postpartum');
  });

  it('does NOT include "unknown" as a selectable option', () => {
    const values = hourTypeOptions.map((o) => o.value as string);
    expect(values).not.toContain('unknown');
  });

  it('has human-readable labels', () => {
    const labels = hourTypeOptions.map((o) => o.label);
    expect(labels).toContain('Prenatal');
    expect(labels).toContain('Postpartum');
  });
});

// ─────────────────────────────────────────────
// 1B. normalizeHourType — robust input handling
// ─────────────────────────────────────────────
describe('Ticket 1 — normalizeHourType', () => {
  it('returns "prenatal" for exact lowercase match', () => {
    expect(normalizeHourType('prenatal')).toBe('prenatal');
  });

  it('returns "postpartum" for exact lowercase match', () => {
    expect(normalizeHourType('postpartum')).toBe('postpartum');
  });

  it('normalizes mixed-case "Prenatal" to "prenatal"', () => {
    expect(normalizeHourType('Prenatal')).toBe('prenatal');
  });

  it('normalizes mixed-case "POSTPARTUM" to "postpartum"', () => {
    expect(normalizeHourType('POSTPARTUM')).toBe('postpartum');
  });

  it('trims whitespace before matching', () => {
    expect(normalizeHourType('  prenatal  ')).toBe('prenatal');
    expect(normalizeHourType(' postpartum ')).toBe('postpartum');
  });

  it('returns "unknown" for an unrecognised string', () => {
    expect(normalizeHourType('labor')).toBe('unknown');
    expect(normalizeHourType('')).toBe('unknown');
  });

  it('returns "unknown" for non-string inputs (number, null, undefined, object)', () => {
    expect(normalizeHourType(1)).toBe('unknown');
    expect(normalizeHourType(null)).toBe('unknown');
    expect(normalizeHourType(undefined)).toBe('unknown');
    expect(normalizeHourType({})).toBe('unknown');
  });
});

// ─────────────────────────────────────────────
// 1C. getHourTypeLabel — display labels
// ─────────────────────────────────────────────
describe('Ticket 1 — getHourTypeLabel', () => {
  it('returns "Prenatal" for prenatal type', () => {
    expect(getHourTypeLabel('prenatal')).toBe('Prenatal');
  });

  it('returns "Postpartum" for postpartum type', () => {
    expect(getHourTypeLabel('postpartum')).toBe('Postpartum');
  });

  it('returns "Unknown" for unknown type', () => {
    expect(getHourTypeLabel('unknown')).toBe('Unknown');
  });

  it('prenatal and postpartum labels are distinct', () => {
    expect(getHourTypeLabel('prenatal')).not.toBe(getHourTypeLabel('postpartum'));
  });
});

// ─────────────────────────────────────────────
// 1D. getHourTypeBadgeClass — distinct visual classes
// ─────────────────────────────────────────────
describe('Ticket 1 — getHourTypeBadgeClass', () => {
  it('returns a non-empty class string for prenatal', () => {
    const cls = getHourTypeBadgeClass('prenatal');
    expect(cls).toBeTruthy();
    expect(typeof cls).toBe('string');
  });

  it('returns a non-empty class string for postpartum', () => {
    const cls = getHourTypeBadgeClass('postpartum');
    expect(cls).toBeTruthy();
    expect(typeof cls).toBe('string');
  });

  it('prenatal and postpartum badge classes are DIFFERENT (visually distinct)', () => {
    expect(getHourTypeBadgeClass('prenatal')).not.toBe(
      getHourTypeBadgeClass('postpartum')
    );
  });

  it('unknown type gets a neutral/grey class', () => {
    const unknownCls = getHourTypeBadgeClass('unknown');
    const prenatalCls = getHourTypeBadgeClass('prenatal');
    const postpartumCls = getHourTypeBadgeClass('postpartum');
    expect(unknownCls).not.toBe(prenatalCls);
    expect(unknownCls).not.toBe(postpartumCls);
  });

  it('prenatal uses sky/blue color family', () => {
    expect(getHourTypeBadgeClass('prenatal')).toMatch(/sky|blue/i);
  });

  it('postpartum uses pink/rose color family', () => {
    expect(getHourTypeBadgeClass('postpartum')).toMatch(/pink|rose/i);
  });
});

// ─────────────────────────────────────────────
// 1E. formatDurationHours — display formatting
// ─────────────────────────────────────────────
describe('Ticket 1 — formatDurationHours', () => {
  it('formats 1 hour as "1h 0m"', () => {
    expect(formatDurationHours(1)).toBe('1h 0m');
  });

  it('formats 1.5 hours as "1h 30m"', () => {
    expect(formatDurationHours(1.5)).toBe('1h 30m');
  });

  it('formats 0 hours as "0h 0m"', () => {
    expect(formatDurationHours(0)).toBe('0h 0m');
  });

  it('formats 2.25 hours as "2h 15m"', () => {
    expect(formatDurationHours(2.25)).toBe('2h 15m');
  });

  it('clamps negative values to 0', () => {
    expect(formatDurationHours(-3)).toBe('0h 0m');
  });

  it('handles fractional minutes with rounding', () => {
    const result = formatDurationHours(1.0166);
    expect(result).toBe('1h 1m');
  });
});

// ─────────────────────────────────────────────
// 1F. addWorkSession — includes `type` field in POST body
// ─────────────────────────────────────────────
describe('Ticket 1 — addWorkSession sends correct hour type', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('sends type="prenatal" in request body', async () => {
    const addWorkSession = (await import('@/common/utils/addWorkSession')).default;
    const start = new Date('2024-01-10T09:00:00Z');
    const end = new Date('2024-01-10T11:00:00Z');

    await addWorkSession('doula-1', 'client-1', start, end, '', 'prenatal');

    expect(mockFetch).toHaveBeenCalledOnce();
    const [, options] = mockFetch.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.type).toBe('prenatal');
  });

  it('sends type="postpartum" in request body', async () => {
    vi.resetModules();
    const addWorkSession = (await import('@/common/utils/addWorkSession')).default;
    const start = new Date('2024-02-01T10:00:00Z');
    const end = new Date('2024-02-01T12:00:00Z');

    await addWorkSession('doula-2', 'client-2', start, end, '', 'postpartum');

    const [, options] = mockFetch.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.type).toBe('postpartum');
  });

  it('does NOT call fetch when type is undefined', async () => {
    vi.resetModules();
    const addWorkSession = (await import('@/common/utils/addWorkSession')).default;
    const start = new Date();
    const end = new Date();

    await addWorkSession('doula-3', 'client-3', start, end, '', undefined);

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('includes doula_id and client_id alongside type in request', async () => {
    vi.resetModules();
    const addWorkSession = (await import('@/common/utils/addWorkSession')).default;
    const start = new Date('2024-03-01T08:00:00Z');
    const end = new Date('2024-03-01T09:00:00Z');

    await addWorkSession('doula-99', 'client-99', start, end, 'note text', 'prenatal');

    const [, options] = mockFetch.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.doula_id).toBe('doula-99');
    expect(body.client_id).toBe('client-99');
    expect(body.type).toBe('prenatal');
    expect(body.note).toBe('note text');
  });
});

// ─────────────────────────────────────────────
// 1G. Hour totals aggregation logic (pure)
// ─────────────────────────────────────────────
describe('Ticket 1 — hour totals aggregation by type', () => {
  type WorkEntry = { type: HourType; duration: number };

  function aggregateHours(entries: WorkEntry[]) {
    return entries.reduce(
      (acc, entry) => {
        const t = normalizeHourType(entry.type);
        acc.total += entry.duration;
        if (t === 'prenatal') acc.prenatal += entry.duration;
        else if (t === 'postpartum') acc.postpartum += entry.duration;
        return acc;
      },
      { total: 0, prenatal: 0, postpartum: 0 }
    );
  }

  it('sums prenatal hours separately from postpartum', () => {
    const entries: WorkEntry[] = [
      { type: 'prenatal', duration: 2 },
      { type: 'postpartum', duration: 3 },
      { type: 'prenatal', duration: 1 },
    ];
    const { prenatal, postpartum, total } = aggregateHours(entries);
    expect(prenatal).toBe(3);
    expect(postpartum).toBe(3);
    expect(total).toBe(6);
  });

  it('treats unknown type hours in total but not prenatal/postpartum', () => {
    const entries: WorkEntry[] = [
      { type: 'prenatal', duration: 2 },
      { type: 'unknown', duration: 1 },
    ];
    const { prenatal, postpartum, total } = aggregateHours(entries);
    expect(prenatal).toBe(2);
    expect(postpartum).toBe(0);
    expect(total).toBe(3);
  });

  it('returns all zeros for an empty entry list', () => {
    const { prenatal, postpartum, total } = aggregateHours([]);
    expect(prenatal).toBe(0);
    expect(postpartum).toBe(0);
    expect(total).toBe(0);
  });
});
