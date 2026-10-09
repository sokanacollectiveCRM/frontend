import { clientAgeRangeFromYears } from './clientAgeRange';
import type { RequestFormValues } from 'features/intake/useRequestForm';
import { intakeHoneypotValues } from './intakeAbuse';

const BABY_COUNT_MAP: Record<string, number> = {
  Singleton: 1,
  Twins: 2,
  Triplets: 3,
  Quadruplets: 4,
};

export function resolvePrimaryLanguageForSubmit(
  primaryLanguage: string | undefined,
  primaryLanguageOther: string | undefined
): { primary_language: string; primary_language_other: string } {
  const selected = (primaryLanguage ?? '').trim();
  const other = (primaryLanguageOther ?? '').trim();
  if (selected === 'Other') {
    return {
      primary_language: other || 'Other',
      primary_language_other: other,
    };
  }
  return {
    primary_language: selected,
    primary_language_other: '',
  };
}

/** Shape posted to POST /requestService/:slug/requestSubmission. */
export function buildIntakeSubmitPayload(
  formData: RequestFormValues,
  options?: { isUsingTestData?: boolean }
): Record<string, unknown> {
  const servicesSummary =
    Array.isArray(formData.services_interested) &&
    formData.services_interested.length > 0
      ? formData.services_interested.join(', ')
      : '';
  const language = resolvePrimaryLanguageForSubmit(
    formData.primary_language,
    formData.primary_language_other
  );

  return {
    ...formData,
    number_of_babies:
      typeof formData.number_of_babies === 'string'
        ? BABY_COUNT_MAP[formData.number_of_babies] || 1
        : formData.number_of_babies,
    service_needed:
      servicesSummary || (formData.service_support_details || '').trim(),
    submission_source: options?.isUsingTestData ? 'test_data' : 'manual',
    ...language,
    client_age_range:
      clientAgeRangeFromYears(formData.age) || formData.client_age_range || '',
    ...intakeHoneypotValues,
  };
}
