/**
 * PHI (Protected Health Information) safety for split-db architecture.
 * List views must not display PHI; detail view may only when authorized (GET /clients/:id).
 * Do not log PHI values. Do not persist PHI to localStorage/sessionStorage.
 *
 * IMPORTANT – Clients list (GET /clients):
 * The backend intentionally returns first_name, last_name, and email for admins and
 * assigned doulas. Do NOT use assertNoPhiInListRow or redactPhiForList on the
 * clients list data in Clients.tsx. The backend controls what PHI is in the list.
 * Using this guard there would redact allowed fields and show [redacted] in the UI.
 */

/** Keys classified as PHI; used only by redactPhiForList / assertNoPhiInListRow. */
export const PHI_KEYS = [
  'phone_number',
  'phoneNumber',
  'date_of_birth',
  'dateOfBirth',
  'address_line1',
  'addressLine1',
  'address',
  'due_date',
  'dueDate',
  'email',
  'health_history',
  'healthHistory',
  'health_notes',
  'healthNotes',
  'allergies',
  'medications',
  'pregnancy_number',
  'pregnancyNumber',
  'had_previous_pregnancies',
  'previous_pregnancies_count',
  'living_children_count',
  'past_pregnancy_experience',
  'baby_sex',
  'baby_name',
  'babyName',
  'number_of_babies',
  'race_ethnicity',
  'raceEthnicity',
  'client_age_range',
  'clientAgeRange',
  'annual_income',
  'annualIncome',
  'insurance',
] as const;

const PHI_SET = new Set<string>(PHI_KEYS);

/**
 * Returns true if the object has any PHI keys (used for list row guard).
 * Does not log values.
 */
export function hasPhiKeys(obj: unknown): boolean {
  if (obj == null || typeof obj !== 'object') return false;
  for (const key of Object.keys(obj)) {
    if (PHI_SET.has(key)) return true;
  }
  return false;
}

/**
 * Redact PHI keys from an object for display in list context.
 * Returns a copy with PHI keys set to '[redacted]' (does not mutate; does not log values).
 * Do NOT use on the main clients list (Clients.tsx) – backend controls list PHI.
 */
export function redactPhiForList<T extends Record<string, unknown>>(row: T): T {
  const out = { ...row } as T;
  for (const key of Object.keys(out)) {
    if (PHI_SET.has(key) && out[key] != null && (out[key] as string) !== '') {
      (out as Record<string, unknown>)[key] = '[redacted]';
    }
  }
  return out;
}

/**
 * Assert list row has no PHI keys. If PHI is present, redact for display.
 * Do NOT use on the main clients list (Clients.tsx) – backend controls list PHI.
 * Does not log PHI values.
 */
export function assertNoPhiInListRow<T extends Record<string, unknown>>(row: T): T {
  if (hasPhiKeys(row)) return redactPhiForList(row);
  return row;
}
