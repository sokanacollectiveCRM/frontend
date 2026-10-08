/** Request form — Home Type (multi-select on intake; staff CRM profile is single-select). */

export const HOME_TYPE_OPTIONS = [
  'Rent, apartment or house',
  'Own, apartment, condo, or house',
  'Living with family or friends',
  'Subsidized or public housing',
  'Transitional housing',
  'Shelter or emergency housing',
  'Experiencing homelessness',
  'Other',
  'Prefer not to answer',
] as const;

export type HomeTypeOption = (typeof HOME_TYPE_OPTIONS)[number];

export const HOME_TYPE_OTHER_VALUE = 'Other' as const;
export const HOME_TYPE_PREFER_NOT_VALUE = 'Prefer not to answer' as const;

/** Normalize API / legacy values to a string array for the form and admin UI. */
export function normalizeHomeTypeFromApi(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((item): item is string => typeof item === 'string' && item.trim() !== '');
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        if (Array.isArray(parsed)) {
          return normalizeHomeTypeFromApi(parsed);
        }
      } catch {
        /* fall through — treat as plain string */
      }
    }
    if ((HOME_TYPE_OPTIONS as readonly string[]).includes(trimmed)) {
      return [trimmed];
    }
    return [trimmed];
  }
  return [];
}

/** Staff CRM profile: at most one home type (first stored value if legacy multi-select). */
export function singleHomeTypeFromApi(raw: unknown): string[] {
  const items = normalizeHomeTypeFromApi(raw);
  if (items.length === 0) return [];
  if (items.includes(HOME_TYPE_PREFER_NOT_VALUE)) {
    return [HOME_TYPE_PREFER_NOT_VALUE];
  }
  return [items[0]];
}

/** Single-select for staff CRM — clicking an option replaces the current selection. */
export function selectSingleHomeType(current: string[], option: string): string[] {
  const selected = singleHomeTypeFromApi(current);
  if (selected.includes(option)) {
    return [];
  }
  return [option];
}

/** Toggle one home type; "Prefer not to answer" is mutually exclusive with other options. */
export function toggleHomeTypeSelection(current: string[], option: string): string[] {
  if (option === HOME_TYPE_PREFER_NOT_VALUE) {
    return current.includes(HOME_TYPE_PREFER_NOT_VALUE) ? [] : [HOME_TYPE_PREFER_NOT_VALUE];
  }
  const withoutPrefer = current.filter((v) => v !== HOME_TYPE_PREFER_NOT_VALUE);
  if (withoutPrefer.includes(option)) {
    return withoutPrefer.filter((v) => v !== option);
  }
  return [...withoutPrefer, option];
}

export function formatHomeTypeDisplay(
  selections: string[] | null | undefined,
  otherText?: string | null
): string {
  const items = normalizeHomeTypeFromApi(selections);
  if (items.length === 0) return '';
  return items
    .map((item) =>
      item === HOME_TYPE_OTHER_VALUE && otherText?.trim()
        ? `${item}: ${otherText.trim()}`
        : item
    )
    .join(', ');
}
