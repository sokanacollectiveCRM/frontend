/** Option keys must stay aligned with backend `DOULA_RACE_ETHNICITY_ALLOWED`. */

export const DOULA_RACE_ETHNICITY_OPTIONS = [
  { value: 'black_african_american', label: 'Black / African American' },
  { value: 'african', label: 'African' },
  { value: 'afro_caribbean', label: 'Afro-Caribbean' },
  { value: 'afro_latinx', label: 'Afro-Latinx' },
  { value: 'hispanic_latino_latina', label: 'Hispanic / Latino / Latina' },
  {
    value: 'indigenous_native_american_alaska_native',
    label: 'Indigenous / Native American / Alaska Native',
  },
  { value: 'mena', label: 'Middle Eastern / North African (MENA)' },
  {
    value: 'asian_asian_american',
    label: 'Asian / Asian American (East Asian, South Asian, Southeast Asian)',
  },
  { value: 'native_hawaiian_pacific_islander', label: 'Native Hawaiian / Pacific Islander' },
  { value: 'white', label: 'White' },
  { value: 'multiracial_mixed', label: 'Multiracial / Mixed' },
  { value: 'another_race_ethnicity', label: 'Another race or ethnicity' },
  { value: 'prefer_not_to_answer', label: 'Prefer not to answer' },
] as const;

export type DoulaRaceEthnicitySlug = (typeof DOULA_RACE_ETHNICITY_OPTIONS)[number]['value'];

export const PREFER_NOT_RACE_ETHNICITY = 'prefer_not_to_answer' as const;
export const ANOTHER_RACE_ETHNICITY = 'another_race_ethnicity' as const;

export function normalizeRaceEthnicityFromApi(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === 'string' && item.length > 0);
}

/** Toggle one race key; "prefer not to answer" is mutually exclusive with other options. */
export function toggleRaceEthnicitySelection(current: string[], key: string): string[] {
  if (key === PREFER_NOT_RACE_ETHNICITY) {
    return current.includes(PREFER_NOT_RACE_ETHNICITY) ? [] : [PREFER_NOT_RACE_ETHNICITY];
  }
  const withoutPrefer = current.filter((k) => k !== PREFER_NOT_RACE_ETHNICITY);
  if (withoutPrefer.includes(key)) {
    return withoutPrefer.filter((k) => k !== key);
  }
  return [...withoutPrefer, key];
}

export function isDoulaRaceEthnicityComplete(
  raceEthnicity: string[] | null | undefined,
  raceEthnicityOther: string | null | undefined
): boolean {
  const race = Array.isArray(raceEthnicity) ? raceEthnicity : [];
  if (race.length === 0) return false;
  if (race.includes(ANOTHER_RACE_ETHNICITY) && !String(raceEthnicityOther ?? '').trim()) {
    return false;
  }
  return true;
}

export const RACE_ETHNICITY_FIELD_LABEL = 'Race / Ethnicity';
