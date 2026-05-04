/**
 * Ticket 4: Add filter to view doula assignments by year or quarter
 *
 * Tests covering the assignmentsDateRange logic extracted from DoulaListPage.tsx.
 * The implementation builds ISO date range strings based on (year, quarter?) inputs.
 *
 * Quarter definitions:
 *   Q1: Jan 1 – Mar 31
 *   Q2: Apr 1 – Jun 30
 *   Q3: Jul 1 – Sep 30
 *   Q4: Oct 1 – Dec 31
 *
 * If no year is provided → { dateFrom: undefined, dateTo: undefined }
 * If year + no quarter  → full year range (Jan 1 – Dec 31)
 * If year + quarter     → quarter range
 */

import { describe, it, expect } from 'vitest';

// ─────────────────────────────────────────────
// Pure function extracted from DoulaListPage.tsx
// (no React imports needed for pure logic tests)
// ─────────────────────────────────────────────
function buildAssignmentsDateRange(
  assignmentsYear: string,
  assignmentsQuarter: string
): { dateFrom: string | undefined; dateTo: string | undefined } {
  const yearNum = assignmentsYear ? parseInt(assignmentsYear, 10) : 0;
  if (!yearNum || !Number.isFinite(yearNum)) return { dateFrom: undefined, dateTo: undefined };

  const quarters: Record<string, { start: [number, number]; end: [number, number] }> = {
    Q1: { start: [1, 1], end: [3, 31] },
    Q2: { start: [4, 1], end: [6, 30] },
    Q3: { start: [7, 1], end: [9, 30] },
    Q4: { start: [10, 1], end: [12, 31] },
  };

  const q = assignmentsQuarter ? quarters[assignmentsQuarter] : null;
  const [startM, startD] = q ? q.start : [1, 1];
  const [endM, endD] = q ? q.end : [12, 31];
  const pad = (n: number) => String(n).padStart(2, '0');

  return {
    dateFrom: `${yearNum}-${pad(startM)}-${pad(startD)}`,
    dateTo: `${yearNum}-${pad(endM)}-${pad(endD)}`,
  };
}

// ─────────────────────────────────────────────
// 4A. No year → undefined range (filter cleared)
// ─────────────────────────────────────────────
describe('Ticket 4 — assignmentsDateRange: no year provided', () => {
  it('returns undefined dateFrom and dateTo when year is empty string', () => {
    const result = buildAssignmentsDateRange('', '');
    expect(result.dateFrom).toBeUndefined();
    expect(result.dateTo).toBeUndefined();
  });

  it('returns undefined for year "0"', () => {
    const result = buildAssignmentsDateRange('0', '');
    expect(result.dateFrom).toBeUndefined();
    expect(result.dateTo).toBeUndefined();
  });

  it('returns undefined for non-numeric year', () => {
    const result = buildAssignmentsDateRange('abc', '');
    expect(result.dateFrom).toBeUndefined();
    expect(result.dateTo).toBeUndefined();
  });
});

// ─────────────────────────────────────────────
// 4B. Year only → full year range
// ─────────────────────────────────────────────
describe('Ticket 4 — assignmentsDateRange: year only (no quarter)', () => {
  it('returns Jan 1 – Dec 31 for year 2024 with no quarter', () => {
    const result = buildAssignmentsDateRange('2024', '');
    expect(result.dateFrom).toBe('2024-01-01');
    expect(result.dateTo).toBe('2024-12-31');
  });

  it('returns Jan 1 – Dec 31 for year 2023', () => {
    const result = buildAssignmentsDateRange('2023', '');
    expect(result.dateFrom).toBe('2023-01-01');
    expect(result.dateTo).toBe('2023-12-31');
  });

  it('year portion of dateFrom matches the provided year', () => {
    const result = buildAssignmentsDateRange('2025', '');
    expect(result.dateFrom!.startsWith('2025-')).toBe(true);
    expect(result.dateTo!.startsWith('2025-')).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 4C. Quarter filters — Q1 through Q4
// ─────────────────────────────────────────────
describe('Ticket 4 — assignmentsDateRange: Q1 (Jan–Mar)', () => {
  it('Q1 dateFrom is January 1', () => {
    const result = buildAssignmentsDateRange('2024', 'Q1');
    expect(result.dateFrom).toBe('2024-01-01');
  });

  it('Q1 dateTo is March 31', () => {
    const result = buildAssignmentsDateRange('2024', 'Q1');
    expect(result.dateTo).toBe('2024-03-31');
  });
});

describe('Ticket 4 — assignmentsDateRange: Q2 (Apr–Jun)', () => {
  it('Q2 dateFrom is April 1', () => {
    const result = buildAssignmentsDateRange('2024', 'Q2');
    expect(result.dateFrom).toBe('2024-04-01');
  });

  it('Q2 dateTo is June 30', () => {
    const result = buildAssignmentsDateRange('2024', 'Q2');
    expect(result.dateTo).toBe('2024-06-30');
  });
});

describe('Ticket 4 — assignmentsDateRange: Q3 (Jul–Sep)', () => {
  it('Q3 dateFrom is July 1', () => {
    const result = buildAssignmentsDateRange('2024', 'Q3');
    expect(result.dateFrom).toBe('2024-07-01');
  });

  it('Q3 dateTo is September 30', () => {
    const result = buildAssignmentsDateRange('2024', 'Q3');
    expect(result.dateTo).toBe('2024-09-30');
  });
});

describe('Ticket 4 — assignmentsDateRange: Q4 (Oct–Dec)', () => {
  it('Q4 dateFrom is October 1', () => {
    const result = buildAssignmentsDateRange('2024', 'Q4');
    expect(result.dateFrom).toBe('2024-10-01');
  });

  it('Q4 dateTo is December 31', () => {
    const result = buildAssignmentsDateRange('2024', 'Q4');
    expect(result.dateTo).toBe('2024-12-31');
  });
});

// ─────────────────────────────────────────────
// 4D. Quarter requires year (dependent select)
// ─────────────────────────────────────────────
describe('Ticket 4 — quarter requires year (disabled until year chosen)', () => {
  it('returns undefined range when quarter is set but year is empty', () => {
    const result = buildAssignmentsDateRange('', 'Q2');
    expect(result.dateFrom).toBeUndefined();
    expect(result.dateTo).toBeUndefined();
  });
});

// ─────────────────────────────────────────────
// 4E. Date format validation — ISO 8601 YYYY-MM-DD
// ─────────────────────────────────────────────
describe('Ticket 4 — date format is ISO 8601 (YYYY-MM-DD)', () => {
  const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

  it('dateFrom matches YYYY-MM-DD for year only', () => {
    const result = buildAssignmentsDateRange('2024', '');
    expect(result.dateFrom).toMatch(ISO_DATE_REGEX);
  });

  it('dateTo matches YYYY-MM-DD for year only', () => {
    const result = buildAssignmentsDateRange('2024', '');
    expect(result.dateTo).toMatch(ISO_DATE_REGEX);
  });

  it('dateFrom matches YYYY-MM-DD for Q3', () => {
    const result = buildAssignmentsDateRange('2024', 'Q3');
    expect(result.dateFrom).toMatch(ISO_DATE_REGEX);
  });

  it('dateTo matches YYYY-MM-DD for Q3', () => {
    const result = buildAssignmentsDateRange('2024', 'Q3');
    expect(result.dateTo).toMatch(ISO_DATE_REGEX);
  });
});

// ─────────────────────────────────────────────
// 4F. Quarter selection resets on year change
// ─────────────────────────────────────────────
describe('Ticket 4 — changing year should clear quarter filter', () => {
  it('when year changes and quarter is cleared, returns full year range', () => {
    // Simulate: user had 2024 + Q2, changes to 2025, quarter is reset to ''
    const result = buildAssignmentsDateRange('2025', '');
    expect(result.dateFrom).toBe('2025-01-01');
    expect(result.dateTo).toBe('2025-12-31');
  });

  it('Q2 filter in 2024 vs 2025 produces the same structure but different years', () => {
    const result2024 = buildAssignmentsDateRange('2024', 'Q2');
    const result2025 = buildAssignmentsDateRange('2025', 'Q2');
    expect(result2024.dateFrom).toBe('2024-04-01');
    expect(result2025.dateFrom).toBe('2025-04-01');
    expect(result2024.dateTo).toBe('2024-06-30');
    expect(result2025.dateTo).toBe('2025-06-30');
  });
});

// ─────────────────────────────────────────────
// 4G. Edge cases
// ─────────────────────────────────────────────
describe('Ticket 4 — edge cases', () => {
  it('unknown quarter string falls back to full year range', () => {
    const result = buildAssignmentsDateRange('2024', 'Q5');
    expect(result.dateFrom).toBe('2024-01-01');
    expect(result.dateTo).toBe('2024-12-31');
  });

  it('handles year "2000" correctly', () => {
    const result = buildAssignmentsDateRange('2000', 'Q1');
    expect(result.dateFrom).toBe('2000-01-01');
    expect(result.dateTo).toBe('2000-03-31');
  });

  it('handles year "2026" correctly', () => {
    const result = buildAssignmentsDateRange('2026', 'Q4');
    expect(result.dateFrom).toBe('2026-10-01');
    expect(result.dateTo).toBe('2026-12-31');
  });
});
