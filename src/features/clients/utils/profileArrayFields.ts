/** Normalize API / legacy values to a string array for profile multiselect fields. */
export function normalizeStringArrayFromApi(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter(
      (item): item is string => typeof item === 'string' && item.trim() !== ''
    );
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        if (Array.isArray(parsed)) {
          return normalizeStringArrayFromApi(parsed);
        }
      } catch {
        /* fall through */
      }
    }
    if (trimmed.includes(',')) {
      return trimmed
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean);
    }
    return [trimmed];
  }
  return [];
}

/** snake_case form field → camelCase key on ClientDetail / fetched detail. */
export const PROFILE_FIELD_CAMEL_ALIASES: Record<string, string> = {
  preferred_contact_method: 'preferredContactMethod',
  preferred_name: 'preferredName',
  pronouns_other: 'pronounsOther',
  children_expected: 'childrenExpected',
  intake_age_years: 'intakeAgeYears',
  home_type: 'homeType',
  home_types: 'homeTypes',
  home_type_other: 'homeTypeOther',
  home_access: 'homeAccess',
  home_adults_count: 'homeAdultsCount',
  home_youth_count: 'homeYouthCount',
  services_interested: 'servicesInterested',
  service_support_details: 'serviceSupportDetails',
  service_specifics: 'serviceSpecifics',
  service_needed: 'serviceNeeded',
  demographics_multi: 'demographicsMulti',
  annual_income: 'annualIncome',
  relationship_status: 'relationshipStatus',
  middle_name: 'middleName',
  mobile_phone: 'mobilePhone',
  work_phone: 'workPhone',
  referral_source: 'referralSource',
  referral_source_other: 'referralSourceOther',
  referral_name: 'referralName',
  referral_email: 'referralEmail',
  due_date: 'dueDate',
  birth_location: 'birthLocation',
  birth_hospital: 'birthHospital',
  number_of_babies: 'numberOfBabies',
  baby_name: 'babyName',
  provider_type: 'providerType',
  pregnancy_number: 'pregnancyNumber',
  health_history: 'healthHistory',
  health_notes: 'healthNotes',
  had_previous_pregnancies: 'hadPreviousPregnancies',
  previous_pregnancies_count: 'previousPregnanciesCount',
  living_children_count: 'livingChildrenCount',
  past_pregnancy_experience: 'pastPregnancyExperience',
  race_ethnicity: 'raceEthnicity',
  primary_language: 'primaryLanguage',
  client_age_range: 'clientAgeRange',
  zip_code: 'zipCode',
  address_line1: 'addressLine1',
};

export function readProfileFieldFromRecord(
  source: Record<string, unknown> | null | undefined,
  fieldKey: string
): unknown {
  if (!source) return undefined;
  if (fieldKey === 'age') {
    return source.age ?? source.intake_age_years ?? source.intakeAgeYears;
  }
  if (fieldKey === 'address') {
    return source.address ?? source.address_line1 ?? source.addressLine1;
  }
  const camelKey = PROFILE_FIELD_CAMEL_ALIASES[fieldKey];
  return source[fieldKey] ?? (camelKey ? source[camelKey] : undefined);
}
