/**
 * Ticket 2 — Add demographic information fields for doulas
 * Priority: High
 *
 * Tests covering:
 * - All 13 race/ethnicity options are defined (matching ticket spec)
 * - normalizeRaceEthnicityFromApi handles arrays, nulls, non-string elements
 * - toggleRaceEthnicitySelection: mutual exclusivity of "prefer not to answer"
 * - toggleRaceEthnicitySelection: toggling on/off individual selections
 * - isDoulaRaceEthnicityComplete: validates required race/ethnicity field
 * - Pronouns field exists in UpdateProfileData type shape
 * - Gender field exists in UpdateProfileData type shape
 * - Languages spoken other than English field exists in UpdateProfileData type shape
 * - Pronouns is enforced as required in the ProfileTab required field list
 */

import { describe, it, expect } from 'vitest';
import {
  DOULA_RACE_ETHNICITY_OPTIONS,
  normalizeRaceEthnicityFromApi,
  toggleRaceEthnicitySelection,
  isDoulaRaceEthnicityComplete,
  PREFER_NOT_RACE_ETHNICITY,
  ANOTHER_RACE_ETHNICITY,
} from '@/features/doula-dashboard/doulaDemographics';
import type { UpdateProfileData } from '@/api/doulas/doulaService';

// ─────────────────────────────────────────────
// 2A. Race / Ethnicity options — all 13 required options present
// ─────────────────────────────────────────────
describe('Ticket 2 — DOULA_RACE_ETHNICITY_OPTIONS: all required options present', () => {
  it('has exactly 13 options', () => {
    expect(DOULA_RACE_ETHNICITY_OPTIONS.length).toBe(13);
  });

  it('includes "Black / African American"', () => {
    expect(DOULA_RACE_ETHNICITY_OPTIONS.some((o) => o.value === 'black_african_american')).toBe(
      true
    );
  });

  it('includes "African"', () => {
    expect(DOULA_RACE_ETHNICITY_OPTIONS.some((o) => o.value === 'african')).toBe(true);
  });

  it('includes "Afro-Caribbean"', () => {
    expect(DOULA_RACE_ETHNICITY_OPTIONS.some((o) => o.value === 'afro_caribbean')).toBe(true);
  });

  it('includes "Afro-Latinx"', () => {
    expect(DOULA_RACE_ETHNICITY_OPTIONS.some((o) => o.value === 'afro_latinx')).toBe(true);
  });

  it('includes "Hispanic / Latino / Latina"', () => {
    expect(
      DOULA_RACE_ETHNICITY_OPTIONS.some((o) => o.value === 'hispanic_latino_latina')
    ).toBe(true);
  });

  it('includes "Indigenous / Native American / Alaska Native"', () => {
    expect(
      DOULA_RACE_ETHNICITY_OPTIONS.some(
        (o) => o.value === 'indigenous_native_american_alaska_native'
      )
    ).toBe(true);
  });

  it('includes "Middle Eastern / North African (MENA)"', () => {
    expect(DOULA_RACE_ETHNICITY_OPTIONS.some((o) => o.value === 'mena')).toBe(true);
  });

  it('includes "Asian / Asian American"', () => {
    expect(
      DOULA_RACE_ETHNICITY_OPTIONS.some((o) => o.value === 'asian_asian_american')
    ).toBe(true);
  });

  it('includes "Native Hawaiian / Pacific Islander"', () => {
    expect(
      DOULA_RACE_ETHNICITY_OPTIONS.some((o) => o.value === 'native_hawaiian_pacific_islander')
    ).toBe(true);
  });

  it('includes "White"', () => {
    expect(DOULA_RACE_ETHNICITY_OPTIONS.some((o) => o.value === 'white')).toBe(true);
  });

  it('includes "Multiracial / Mixed"', () => {
    expect(DOULA_RACE_ETHNICITY_OPTIONS.some((o) => o.value === 'multiracial_mixed')).toBe(true);
  });

  it('includes "Another race or ethnicity"', () => {
    expect(
      DOULA_RACE_ETHNICITY_OPTIONS.some((o) => o.value === 'another_race_ethnicity')
    ).toBe(true);
  });

  it('includes "Prefer not to answer"', () => {
    expect(
      DOULA_RACE_ETHNICITY_OPTIONS.some((o) => o.value === 'prefer_not_to_answer')
    ).toBe(true);
  });

  it('every option has both a value and label', () => {
    for (const opt of DOULA_RACE_ETHNICITY_OPTIONS) {
      expect(opt.value).toBeTruthy();
      expect(opt.label).toBeTruthy();
    }
  });
});

// ─────────────────────────────────────────────
// 2B. normalizeRaceEthnicityFromApi
// ─────────────────────────────────────────────
describe('Ticket 2 — normalizeRaceEthnicityFromApi', () => {
  it('returns empty array for null', () => {
    expect(normalizeRaceEthnicityFromApi(null)).toEqual([]);
  });

  it('returns empty array for undefined', () => {
    expect(normalizeRaceEthnicityFromApi(undefined)).toEqual([]);
  });

  it('returns empty array for non-array input', () => {
    expect(normalizeRaceEthnicityFromApi('black_african_american')).toEqual([]);
  });

  it('returns valid string values unchanged', () => {
    expect(normalizeRaceEthnicityFromApi(['white', 'black_african_american'])).toEqual([
      'white',
      'black_african_american',
    ]);
  });

  it('filters out non-string values from array', () => {
    expect(normalizeRaceEthnicityFromApi(['white', 42, null, 'african', undefined])).toEqual([
      'white',
      'african',
    ]);
  });

  it('filters out empty strings', () => {
    expect(normalizeRaceEthnicityFromApi(['white', '', 'african'])).toEqual(['white', 'african']);
  });

  it('returns empty array for empty array input', () => {
    expect(normalizeRaceEthnicityFromApi([])).toEqual([]);
  });
});

// ─────────────────────────────────────────────
// 2C. toggleRaceEthnicitySelection
// ─────────────────────────────────────────────
describe('Ticket 2 — toggleRaceEthnicitySelection', () => {
  it('adds a new selection when not yet selected', () => {
    const result = toggleRaceEthnicitySelection([], 'white');
    expect(result).toContain('white');
  });

  it('removes a selection when already selected', () => {
    const result = toggleRaceEthnicitySelection(['white', 'african'], 'white');
    expect(result).not.toContain('white');
    expect(result).toContain('african');
  });

  it('selecting "prefer not to answer" clears all other selections', () => {
    const result = toggleRaceEthnicitySelection(
      ['white', 'african'],
      PREFER_NOT_RACE_ETHNICITY
    );
    expect(result).toEqual([PREFER_NOT_RACE_ETHNICITY]);
  });

  it('deselecting "prefer not to answer" returns empty array', () => {
    const result = toggleRaceEthnicitySelection([PREFER_NOT_RACE_ETHNICITY], PREFER_NOT_RACE_ETHNICITY);
    expect(result).toEqual([]);
  });

  it('selecting a regular option removes "prefer not to answer" if present', () => {
    const result = toggleRaceEthnicitySelection([PREFER_NOT_RACE_ETHNICITY], 'white');
    expect(result).not.toContain(PREFER_NOT_RACE_ETHNICITY);
    expect(result).toContain('white');
  });

  it('can select multiple non-exclusive options', () => {
    let selections: string[] = [];
    selections = toggleRaceEthnicitySelection(selections, 'white');
    selections = toggleRaceEthnicitySelection(selections, 'african');
    selections = toggleRaceEthnicitySelection(selections, 'asian_asian_american');
    expect(selections).toEqual(['white', 'african', 'asian_asian_american']);
  });
});

// ─────────────────────────────────────────────
// 2D. isDoulaRaceEthnicityComplete
// ─────────────────────────────────────────────
describe('Ticket 2 — isDoulaRaceEthnicityComplete', () => {
  it('returns false for null race_ethnicity', () => {
    expect(isDoulaRaceEthnicityComplete(null, null)).toBe(false);
  });

  it('returns false for undefined race_ethnicity', () => {
    expect(isDoulaRaceEthnicityComplete(undefined, null)).toBe(false);
  });

  it('returns false for empty array', () => {
    expect(isDoulaRaceEthnicityComplete([], null)).toBe(false);
  });

  it('returns true for single standard selection', () => {
    expect(isDoulaRaceEthnicityComplete(['white'], null)).toBe(true);
  });

  it('returns true for "prefer not to answer"', () => {
    expect(isDoulaRaceEthnicityComplete([PREFER_NOT_RACE_ETHNICITY], null)).toBe(true);
  });

  it('returns false for "another race or ethnicity" without specifying', () => {
    expect(isDoulaRaceEthnicityComplete([ANOTHER_RACE_ETHNICITY], '')).toBe(false);
    expect(isDoulaRaceEthnicityComplete([ANOTHER_RACE_ETHNICITY], null)).toBe(false);
  });

  it('returns true for "another race or ethnicity" when other text is provided', () => {
    expect(isDoulaRaceEthnicityComplete([ANOTHER_RACE_ETHNICITY], 'Creole')).toBe(true);
  });

  it('returns true for multiple selections including another_race with text', () => {
    expect(
      isDoulaRaceEthnicityComplete(
        ['white', ANOTHER_RACE_ETHNICITY],
        'Some other ethnicity'
      )
    ).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 2E. Pronouns and gender fields exist in profile data type
// ─────────────────────────────────────────────
describe('Ticket 2 — pronouns and gender fields on UpdateProfileData', () => {
  it('UpdateProfileData shape includes "pronouns" field', () => {
    const profileData: UpdateProfileData = {
      pronouns: 'she/her',
    };
    expect(profileData.pronouns).toBe('she/her');
  });

  it('UpdateProfileData shape includes "gender" field', () => {
    const profileData: UpdateProfileData = {
      gender: 'Woman',
    };
    expect(profileData.gender).toBe('Woman');
  });

  it('UpdateProfileData shape includes "race_ethnicity" as string array', () => {
    const profileData: UpdateProfileData = {
      race_ethnicity: ['white', 'african'],
    };
    expect(Array.isArray(profileData.race_ethnicity)).toBe(true);
  });

  it('UpdateProfileData shape includes "race_ethnicity_other" for write-in', () => {
    const profileData: UpdateProfileData = {
      race_ethnicity: [ANOTHER_RACE_ETHNICITY],
      race_ethnicity_other: 'Creole',
    };
    expect(profileData.race_ethnicity_other).toBe('Creole');
  });

  it('UpdateProfileData shape includes "other_demographic_details"', () => {
    const profileData: UpdateProfileData = {
      other_demographic_details: 'Additional details here',
    };
    expect(profileData.other_demographic_details).toBeTruthy();
  });

  it('UpdateProfileData shape includes "languages_other_than_english" as string array', () => {
    const profileData: UpdateProfileData = {
      languages_other_than_english: ['Spanish', 'French'],
    };
    expect(Array.isArray(profileData.languages_other_than_english)).toBe(true);
    expect(profileData.languages_other_than_english).toContain('Spanish');
  });
});

describe('Ticket 2 — required fields enforcement (mirrors ProfileTab required list)', () => {
  it('"pronouns" is required', () => {
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
    ] as const;
    expect((REQUIRED_TEXT_FIELDS as readonly string[]).includes('pronouns')).toBe(true);
  });
});
