/**
 * USER Ticket 5 — Rename "Notes" to "Service Details" in the side panel
 * Priority: Medium
 *
 * The label change is in DoulaListPage.tsx, in two spots:
 *   - the editable assignment side panel form
 *   - the read-only assignment side panel summary
 *
 * Validates (string smoke test against the source) that:
 *   - "Service Details" appears in the side-panel context (>= 2 places)
 *   - The legacy "Notes" label is no longer used as a side-panel field label
 *
 * The data field is still `notes` on AssignmentRow; only the user-visible
 * label changed. We assert this explicitly to prevent confusion.
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const DOULA_LIST_PAGE = resolve(
  HERE,
  '..',
  'components',
  'DoulaListPage.tsx'
);
const SOURCE = readFileSync(DOULA_LIST_PAGE, 'utf-8');

// ─────────────────────────────────────────────
// 5A. New label is wired up
// ─────────────────────────────────────────────
describe('USER Ticket 5 — "Service Details" label is present', () => {
  it('"Service Details" appears in DoulaListPage source', () => {
    expect(SOURCE).toContain('Service Details');
  });

  it('"Service Details" appears in BOTH the edit form and the read-only summary', () => {
    const occurrences = SOURCE.split('Service Details').length - 1;
    expect(occurrences).toBeGreaterThanOrEqual(2);
  });
});

// ─────────────────────────────────────────────
// 5B. The legacy "Notes" label is gone
// ─────────────────────────────────────────────
describe('USER Ticket 5 — "Notes" is no longer used as a UI label', () => {
  it('does NOT include the JSX label `>Notes<` in the source', () => {
    // Catches things like <Label>Notes</Label> or <p>Notes</p> etc.
    expect(SOURCE).not.toMatch(/>Notes</);
  });

  it('does NOT include uppercase "NOTES" as a section header', () => {
    expect(SOURCE).not.toMatch(/>NOTES</);
  });
});

// ─────────────────────────────────────────────
// 5C. Underlying data field (`notes`) is preserved
// ─────────────────────────────────────────────
describe('USER Ticket 5 — data field is still `notes` (label-only rename)', () => {
  it('AssignmentRow still exposes a `notes` field', () => {
    // Only the user-facing label changed; the API/data shape is unchanged.
    expect(SOURCE).toMatch(/notes\s*:\s*string/);
  });

  it('still binds the textarea value to the `notes` form field', () => {
    expect(SOURCE).toMatch(/value=\{assignmentEditForm\.notes\}/);
  });
});
