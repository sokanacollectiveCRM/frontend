import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { fullSchema, useRequestForm } from '../useRequestForm';

// Mock document.getElementById and scrollIntoView
const mockScrollIntoView = vi.fn();
const mockElement = { scrollIntoView: mockScrollIntoView };

describe('useRequestForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(document, 'getElementById').mockReturnValue(mockElement as any);
  });

  describe('Form Schema Validation', () => {
    it('validates complete form data successfully', () => {
      const validData = {
        firstname: 'Jane',
        lastname: 'Doe',
        email: 'jane.doe@example.com',
        phone_number: '555-123-4567',
        pronouns: 'She/Her',
        pronouns_other: '',
        preferred_contact_method: 'Phone',
        preferred_name: '',
        age: '28',
        address: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zip_code: '62704',
        home_phone: '555-987-6543',
        home_type: ['Rent, apartment or house'],
        home_type_other: '',
        home_access: 'Front door, no stairs',
        pets: 'Dog',
        home_adults_count: '2',
        home_youth_count: '1',
        relationship_status: 'Partner',
        first_name: 'Alex',
        last_name: 'Doe',
        middle_name: 'Marie',
        mobile_phone: '555-222-3333',
        family_email: 'alex.doe@example.com',
        family_pronouns: 'They/Them',
        referral_source: 'Google',
        referral_source_other: '',
        referral_name: 'Sokana',
        referral_email: 'referral@example.com',
        health_history: 'No major health issues',
        allergies: 'Peanuts',
        health_notes: 'N/A',
        due_date: '2025-06-15',
        birth_location: 'Hospital',
        birth_hospital: 'Springfield General',
        number_of_babies: 'Singleton',
        baby_name: 'Baby Doe',
        provider_type: 'Midwife',
        pregnancy_number: '2',
        had_previous_pregnancies: true,
        previous_pregnancies_count: '1',
        living_children_count: '1',
        past_pregnancy_experience: 'Healthy previous pregnancy, no complications',
        services_interested: ['Labor Support', 'Postpartum Support'],
        service_support_details: 'I am looking for both labor and postpartum support, including overnight care for 2 weeks.',
        service_needed: 'Labor Support',
        payment_method: 'Private/Commercial Insurance',
        insurance_policy_holder_name: 'Jane Doe',
        insurance_policy_holder_dob: '1990-04-12',
        insurance_policy_holder_relationship: 'Self',
        insurance_provider: 'Blue Cross Blue Shield',
        insurance_member_id: 'ABC12345',
        policy_number: 'GRP-77',
        insurance_plan_type: 'PPO',
        insurance_phone_number: '800-555-1212',
        has_secondary_insurance: false,
        secondary_insurance_provider: '',
        secondary_insurance_member_id: '',
        secondary_policy_number: '',
        race_ethnicity: 'Caucasian/White',
        primary_language: 'English',
        client_age_range: '26-35',
        insurance: 'Private',
        demographics_multi: [],
        demographics_annual_income: '$45,000-$64,999',
      };

      const result = fullSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('requires home_type_other when Home Type includes Other', () => {
      const base = {
        firstname: 'Jane',
        lastname: 'Doe',
        email: 'jane.doe@example.com',
        phone_number: '555-123-4567',
        pronouns: 'She/Her',
        pronouns_other: '',
        preferred_contact_method: 'Phone',
        preferred_name: '',
        age: '28',
        address: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zip_code: '62704',
        home_phone: '',
        home_type: ['Other'],
        home_type_other: '',
        home_access: '',
        pets: 'None',
        home_adults_count: '1',
        home_youth_count: '0',
        relationship_status: '',
        first_name: '',
        last_name: '',
        middle_name: '',
        family_email: '',
        mobile_phone: '',
        work_phone: '',
        family_pronouns: '',
        referral_source: 'Google',
        referral_source_other: '',
        referral_name: '',
        referral_email: '',
        health_history: '',
        allergies: '',
        health_notes: '',
        due_date: '2025-06-15',
        birth_location: 'Hospital',
        birth_hospital: 'Springfield General',
        number_of_babies: 'Singleton',
        baby_name: '',
        provider_type: 'Midwife',
        pregnancy_number: '1',
        had_previous_pregnancies: false,
        previous_pregnancies_count: '0',
        living_children_count: '0',
        past_pregnancy_experience: '',
        services_interested: ['Labor Support'],
        service_support_details: 'Support details here for testing.',
        service_needed: '',
        payment_method: 'Private/Commercial Insurance',
        insurance_policy_holder_name: 'Jane Doe',
        insurance_policy_holder_dob: '1990-04-12',
        insurance_policy_holder_relationship: 'Self',
        insurance_provider: 'Blue Cross',
        insurance_member_id: 'ABC',
        policy_number: '',
        insurance_plan_type: 'PPO',
        insurance_phone_number: '800-555-1212',
        has_secondary_insurance: false,
        secondary_insurance_provider: '',
        secondary_insurance_member_id: '',
        secondary_policy_number: '',
        race_ethnicity: '',
        primary_language: '',
        client_age_range: '',
        insurance: '',
        demographics_multi: [],
        demographics_annual_income: '',
      };

      const emptyOther = fullSchema.safeParse(base);
      expect(emptyOther.success).toBe(false);
      if (!emptyOther.success) {
        expect(
          emptyOther.error.issues.some((i) => i.path.includes('home_type_other'))
        ).toBe(true);
      }

      const withOther = fullSchema.safeParse({
        ...base,
        home_type_other: 'Co-living arrangement',
      });
      expect(withOther.success).toBe(true);
    });

    it('requires home_adults_count and home_youth_count on Home Details', () => {
      const base = {
        firstname: 'Jane',
        lastname: 'Doe',
        email: 'jane.doe@example.com',
        phone_number: '555-123-4567',
        pronouns: 'She/Her',
        pronouns_other: '',
        preferred_contact_method: 'Phone',
        preferred_name: '',
        age: '28',
        address: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zip_code: '62704',
        home_type: [],
        home_type_other: '',
        home_access: '',
        pets: 'None',
        home_adults_count: '',
        home_youth_count: '',
        referral_source: 'Google',
        due_date: '2024/15/2026',
        birth_location: 'Hospital',
        birth_hospital: 'General Hospital',
        number_of_babies: 'Singleton',
        provider_type: 'Midwife',
        pregnancy_number: '1',
        had_previous_pregnancies: false,
        services_interested: ['Labor Support'],
        service_support_details: 'Support details',
        payment_method: 'Not sure / Need help figuring this out',
      };

      const missing = fullSchema.safeParse(base);
      expect(missing.success).toBe(false);
      if (!missing.success) {
        const paths = missing.error.issues.map((i) => i.path[0]);
        expect(paths).toContain('home_adults_count');
        expect(paths).toContain('home_youth_count');
      }

      const valid = fullSchema.safeParse({
        ...base,
        home_adults_count: '5+',
        home_youth_count: '0',
      });
      expect(valid.success).toBe(true);
    });

    it('requires explanation when referral source is Other', () => {
      const base = {
        firstname: 'Jane',
        lastname: 'Doe',
        email: 'jane.doe@example.com',
        phone_number: '555-123-4567',
        pronouns: 'She/Her',
        pronouns_other: '',
        preferred_contact_method: 'Phone',
        preferred_name: '',
        age: '28',
        address: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zip_code: '62704',
        home_phone: '',
        home_type: [],
        home_type_other: '',
        home_access: '',
        pets: 'None',
        home_adults_count: '1',
        home_youth_count: '0',
        relationship_status: '',
        first_name: '',
        last_name: '',
        middle_name: '',
        family_email: '',
        mobile_phone: '',
        work_phone: '',
        family_pronouns: '',
        referral_source: 'Other',
        referral_source_other: '',
        referral_name: '',
        referral_email: '',
        health_history: '',
        allergies: '',
        health_notes: '',
        due_date: '2025-06-15',
        birth_location: 'Hospital',
        birth_hospital: 'Springfield General',
        number_of_babies: 'Singleton',
        baby_name: '',
        provider_type: 'Midwife',
        pregnancy_number: '1',
        hospital: '',
        had_previous_pregnancies: false,
        previous_pregnancies_count: 0,
        living_children_count: 0,
        past_pregnancy_experience: '',
        services_interested: ['Labor Support'],
        service_support_details: 'Looking for support',
        service_needed: 'Labor Support',
        payment_method: 'Not sure / Need help figuring this out',
        annual_income: '',
        service_specifics: '',
        race_ethnicity: '',
        primary_language: '',
        client_age_range: '',
        insurance: '',
        demographics_multi: [],
        demographics_annual_income: '',
      };

      const emptyOther = fullSchema.safeParse(base);
      expect(emptyOther.success).toBe(false);
      if (!emptyOther.success) {
        expect(
          emptyOther.error.issues.some((i) => i.path.includes('referral_source_other'))
        ).toBe(true);
      }

      const withOther = fullSchema.safeParse({
        ...base,
        referral_source_other: 'Neighborhood parent group',
      });
      expect(withOther.success).toBe(true);
    });

    it('requires an explicit past pregnancies choice', () => {
      const base = {
        firstname: 'Jane',
        lastname: 'Doe',
        email: 'jane.doe@example.com',
        phone_number: '555-123-4567',
        pronouns: 'She/Her',
        pronouns_other: '',
        preferred_contact_method: 'Phone',
        preferred_name: '',
        age: '28',
        address: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zip_code: '62704',
        pets: 'None',
        home_adults_count: '1',
        home_youth_count: '0',
        referral_source: 'Google',
        due_date: '2025-06-15',
        birth_location: 'Hospital',
        birth_hospital: 'Springfield General',
        number_of_babies: 'Singleton',
        provider_type: 'Midwife',
        pregnancy_number: '1',
        services_interested: ['Labor Support'],
        service_support_details: 'Looking for support',
        payment_method: 'Not sure / Need help figuring this out',
      };

      const unset = fullSchema.safeParse(base);
      expect(unset.success).toBe(false);
      if (!unset.success) {
        expect(
          unset.error.issues.some((i) => i.path.includes('had_previous_pregnancies'))
        ).toBe(true);
      }

      const noHistory = fullSchema.safeParse({
        ...base,
        had_previous_pregnancies: false,
      });
      expect(noHistory.success).toBe(true);

      const withHistory = fullSchema.safeParse({
        ...base,
        had_previous_pregnancies: true,
        previous_pregnancies_count: 0,
        living_children_count: 0,
        past_pregnancy_experience: '',
      });
      expect(withHistory.success).toBe(true);
    });

    it('requires birth location name for each birth location type', () => {
      const base = {
        firstname: 'Jane',
        lastname: 'Doe',
        email: 'jane.doe@example.com',
        phone_number: '555-123-4567',
        pronouns: 'She/Her',
        pronouns_other: '',
        preferred_contact_method: 'Phone',
        preferred_name: '',
        age: '28',
        address: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zip_code: '62704',
        pets: 'None',
        home_adults_count: '1',
        home_youth_count: '0',
        referral_source: 'Google',
        due_date: '2025-06-15',
        birth_hospital: '',
        number_of_babies: 'Singleton',
        provider_type: 'Midwife',
        pregnancy_number: '1',
        had_previous_pregnancies: false,
        services_interested: ['Labor Support'],
        service_support_details: 'Looking for support',
        payment_method: 'Not sure / Need help figuring this out',
      };

      const homeMissing = fullSchema.safeParse({ ...base, birth_location: 'Home' });
      expect(homeMissing.success).toBe(false);
      if (!homeMissing.success) {
        expect(homeMissing.error.issues.some((i) => i.path.includes('birth_hospital'))).toBe(
          true
        );
        expect(homeMissing.error.issues.map((i) => i.message).join(' ')).toMatch(/home birth/i);
      }

      const hospitalOk = fullSchema.safeParse({
        ...base,
        birth_location: 'Hospital',
        birth_hospital: 'Mercy Hospital',
      });
      expect(hospitalOk.success).toBe(true);
    });

    it('fails validation with missing required fields', () => {
      const invalidData = {
        firstname: '',
        lastname: '',
        email: 'invalid-email',
        phone_number: '',
        pronouns: '',
        preferred_contact_method: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        home_phone: '',
        due_date: '',
        birth_location: '',
        birth_hospital: '',
        number_of_babies: '',
        provider_type: '',
        pregnancy_number: '',
        services_interested: [],
        service_support_details: '',
        service_needed: '',
        payment_method: '',
        race_ethnicity: '',
        primary_language: '',
        client_age_range: '',
      };

      const result = fullSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('allows not-sure payment path without insurance details', () => {
      const result = fullSchema.safeParse({
        firstname: 'Jane',
        lastname: 'Doe',
        email: 'jane.doe@example.com',
        phone_number: '555-123-4567',
        pronouns: 'She/Her',
        pronouns_other: '',
        preferred_contact_method: 'Phone',
        preferred_name: '',
        age: '28',
        address: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zip_code: '62704',
        home_phone: '',
        home_type: [],
        home_type_other: '',
        home_access: '',
        pets: 'None',
        home_adults_count: '1',
        home_youth_count: '0',
        relationship_status: '',
        first_name: '',
        last_name: '',
        middle_name: '',
        family_email: '',
        mobile_phone: '',
        work_phone: '',
        family_pronouns: '',
        referral_source: 'Google',
        referral_source_other: '',
        referral_name: '',
        referral_email: '',
        health_history: '',
        allergies: '',
        health_notes: '',
        due_date: '2025-06-15',
        birth_location: 'Hospital',
        birth_hospital: 'Springfield General',
        number_of_babies: 'Singleton',
        baby_name: '',
        provider_type: 'Midwife',
        pregnancy_number: '1',
        hospital: '',
        had_previous_pregnancies: false,
        previous_pregnancies_count: 0,
        living_children_count: 0,
        past_pregnancy_experience: '',
        services_interested: ['Labor Support'],
        service_support_details: 'Looking for support',
        service_needed: 'Labor Support',
        payment_method: 'Not sure / Need help figuring this out',
        annual_income: '',
        service_specifics: '',
        race_ethnicity: '',
        primary_language: '',
        client_age_range: '',
        insurance: '',
        demographics_multi: [],
        demographics_annual_income: '',
      });

      expect(result.success).toBe(true);
    });

    it('requires insurance details when using an insurance payment method', () => {
      const result = fullSchema.safeParse({
        firstname: 'Jane',
        lastname: 'Doe',
        email: 'jane.doe@example.com',
        phone_number: '555-123-4567',
        pronouns: 'She/Her',
        pronouns_other: '',
        preferred_contact_method: 'Phone',
        preferred_name: '',
        age: '28',
        address: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zip_code: '62704',
        home_phone: '',
        home_type: [],
        home_type_other: '',
        home_access: '',
        pets: 'None',
        home_adults_count: '1',
        home_youth_count: '0',
        relationship_status: '',
        first_name: '',
        last_name: '',
        middle_name: '',
        family_email: '',
        mobile_phone: '',
        work_phone: '',
        family_pronouns: '',
        referral_source: 'Google',
        referral_source_other: '',
        referral_name: '',
        referral_email: '',
        health_history: '',
        allergies: '',
        health_notes: '',
        due_date: '2025-06-15',
        birth_location: 'Hospital',
        birth_hospital: 'Springfield General',
        number_of_babies: 'Singleton',
        baby_name: '',
        provider_type: 'Midwife',
        pregnancy_number: '1',
        hospital: '',
        had_previous_pregnancies: false,
        previous_pregnancies_count: 0,
        living_children_count: 0,
        past_pregnancy_experience: '',
        services_interested: ['Labor Support'],
        service_support_details: 'Looking for support',
        service_needed: 'Labor Support',
        payment_method: 'Private/Commercial Insurance',
        insurance_policy_holder_name: '',
        insurance_policy_holder_dob: '',
        insurance_policy_holder_relationship: '',
        insurance_provider: '',
        insurance_member_id: '',
        policy_number: '',
        insurance_plan_type: '',
        insurance_phone_number: '',
        has_secondary_insurance: false,
        secondary_insurance_provider: '',
        secondary_insurance_member_id: '',
        secondary_policy_number: '',
        annual_income: '',
        service_specifics: '',
        self_pay_sliding_support_type: '',
        self_pay_sliding_tier: '',
        race_ethnicity: '',
        primary_language: '',
        client_age_range: '',
        insurance: '',
        demographics_multi: [],
        demographics_annual_income: '',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (issue) =>
              issue.path.includes('insurance_provider') ||
              issue.path.includes('insurance_policy_holder_name') ||
              issue.path.includes('insurance_plan_type')
          )
        ).toBe(true);
      }
    });
  });

  describe('Hook Initialization', () => {
    it('initializes with correct default values', () => {
      const mockOnSubmit = vi.fn();
      const { result } = renderHook(() => useRequestForm(mockOnSubmit));

      expect(result.current.step).toBe(0);
      expect(result.current.totalSteps).toBe(9);
      expect(result.current.form).toBeDefined();
      expect(result.current.handleNextStep).toBeDefined();
      expect(result.current.handleBack).toBeDefined();
    });

    it('returns form with empty default values', () => {
      const mockOnSubmit = vi.fn();
      const { result } = renderHook(() => useRequestForm(mockOnSubmit));

      const formValues = result.current.form.getValues();
      expect(formValues.firstname).toBe('');
      expect(formValues.lastname).toBe('');
      expect(formValues.email).toBe('');
    });
  });

  describe('Navigation Functions', () => {
    it('handleBack decrements step when not on first step', () => {
      const mockOnSubmit = vi.fn();
      const { result } = renderHook(() => useRequestForm(mockOnSubmit));

      // Set step to 1
      act(() => {
        result.current.setStep(1);
      });

      expect(result.current.step).toBe(1);

      // Call handleBack
      act(() => {
        result.current.handleBack();
      });

      expect(result.current.step).toBe(0);
    });

    it('handleBack does not decrement when on first step', () => {
      const mockOnSubmit = vi.fn();
      const { result } = renderHook(() => useRequestForm(mockOnSubmit));

      expect(result.current.step).toBe(0);

      act(() => {
        result.current.handleBack();
      });

      expect(result.current.step).toBe(0);
    });

    it('blocks referral step progression when source is Other without details', async () => {
      const mockOnSubmit = vi.fn();
      const { result } = renderHook(() => useRequestForm(mockOnSubmit));

      act(() => {
        result.current.setStep(3);
        result.current.form.setValue('referral_source', 'Other');
        result.current.form.setValue('referral_source_other', '');
      });

      let advanced = false;
      await act(async () => {
        advanced = await result.current.handleNextStep();
      });

      expect(advanced).toBe(false);
      expect(result.current.step).toBe(3);
      expect(result.current.form.getFieldState('referral_source_other').error?.message).toBe(
        'Please describe how you heard about Sokana.'
      );
    });
  });

  describe('Form Validation', () => {
    it('allows baby_name to be empty (optional field)', async () => {
      const result = fullSchema.safeParse({
        firstname: 'Jane',
        lastname: 'Doe',
        email: 'jane.doe@example.com',
        phone_number: '555-123-4567',
        pronouns: 'She/Her',
        pronouns_other: '',
        preferred_contact_method: 'Phone',
        preferred_name: '',
        age: '28',
        address: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zip_code: '62704',
        pets: 'None',
        home_adults_count: '1',
        home_youth_count: '0',
        referral_source: 'Google',
        due_date: '2025-06-15',
        birth_location: 'Hospital',
        birth_hospital: 'Springfield General',
        number_of_babies: 'Singleton',
        baby_name: '',
        provider_type: 'Midwife',
        pregnancy_number: '1',
        had_previous_pregnancies: false,
        services_interested: ['Labor Support'],
        service_support_details: 'Looking for support',
        service_needed: 'Labor Support',
        payment_method: 'Not sure / Need help figuring this out',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.baby_name).toBe('');
      }
    });

    it('allows baby_name to be undefined (optional field)', () => {
      const result = fullSchema.safeParse({
        firstname: 'Jane',
        lastname: 'Doe',
        email: 'jane.doe@example.com',
        phone_number: '555-123-4567',
        pronouns: 'She/Her',
        pronouns_other: '',
        preferred_contact_method: 'Phone',
        preferred_name: '',
        age: '28',
        address: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zip_code: '62704',
        pets: 'None',
        home_adults_count: '1',
        home_youth_count: '0',
        referral_source: 'Google',
        due_date: '2025-06-15',
        birth_location: 'Hospital',
        birth_hospital: 'Springfield General',
        number_of_babies: 'Singleton',
        provider_type: 'Midwife',
        pregnancy_number: '1',
        had_previous_pregnancies: false,
        services_interested: ['Labor Support'],
        service_support_details: 'Looking for support',
        service_needed: 'Labor Support',
        payment_method: 'Not sure / Need help figuring this out',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.baby_name).toBeUndefined();
      }
    });

    it('saves baby_name when provided', () => {
      const result = fullSchema.safeParse({
        firstname: 'Jane',
        lastname: 'Doe',
        email: 'jane.doe@example.com',
        phone_number: '555-123-4567',
        pronouns: 'She/Her',
        pronouns_other: '',
        preferred_contact_method: 'Phone',
        preferred_name: '',
        age: '28',
        address: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zip_code: '62704',
        pets: 'None',
        home_adults_count: '1',
        home_youth_count: '0',
        referral_source: 'Google',
        due_date: '2025-06-15',
        birth_location: 'Hospital',
        birth_hospital: 'Springfield General',
        number_of_babies: 'Singleton',
        baby_name: 'Lily',
        provider_type: 'Midwife',
        pregnancy_number: '1',
        had_previous_pregnancies: false,
        services_interested: ['Labor Support'],
        service_support_details: 'Looking for support',
        service_needed: 'Labor Support',
        payment_method: 'Not sure / Need help figuring this out',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.baby_name).toBe('Lily');
      }
    });

    it('rejects empty, non-numeric, out-of-range, or negative age', () => {
      const base = {
        firstname: 'Jane',
        lastname: 'Doe',
        email: 'jane.doe@example.com',
        phone_number: '555-123-4567',
        pronouns: 'She/Her',
        pronouns_other: '',
        preferred_contact_method: 'Phone',
        preferred_name: '',
        age: '28',
        address: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zip_code: '62704',
        pets: 'None',
        home_adults_count: '1',
        home_youth_count: '0',
        referral_source: 'Google',
        due_date: '2025-06-15',
        birth_location: 'Hospital',
        birth_hospital: 'Springfield General',
        number_of_babies: 'Singleton',
        provider_type: 'Midwife',
        pregnancy_number: '1',
        had_previous_pregnancies: false,
        services_interested: ['Labor Support'],
        service_support_details: 'Looking for support',
        service_needed: 'Labor Support',
        payment_method: 'Not sure / Need help figuring this out',
      };

      expect(fullSchema.safeParse({ ...base, age: '' }).success).toBe(false);
      expect(fullSchema.safeParse({ ...base, age: '12a' }).success).toBe(false);
      expect(fullSchema.safeParse({ ...base, age: '-5' }).success).toBe(false);
      expect(fullSchema.safeParse({ ...base, age: '0' }).success).toBe(false);
      expect(fullSchema.safeParse({ ...base, age: '121' }).success).toBe(false);
      expect(fullSchema.safeParse({ ...base, age: '28' }).success).toBe(true);
      const parsed = fullSchema.safeParse({ ...base, age: '28' });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.age).toBe(28);
      }
    });

    it('validates form fields correctly', async () => {
      const mockOnSubmit = vi.fn();
      const { result } = renderHook(() => useRequestForm(mockOnSubmit));

      // Fill in required fields for step 1
      await act(async () => {
        result.current.form.setValue('firstname', 'John');
        result.current.form.setValue('lastname', 'Doe');
        result.current.form.setValue('email', 'john.doe@example.com');
        result.current.form.setValue('phone_number', '555-123-4567');
        result.current.form.setValue('pronouns', 'He/Him');
        result.current.form.setValue('preferred_contact_method', 'Email');
        result.current.form.setValue('age', '28');
      });

      const isValid = await result.current.form.trigger([
        'firstname',
        'lastname',
        'email',
        'phone_number',
        'pronouns',
        'preferred_contact_method',
        'age',
      ]);

      expect(isValid).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('handles validation errors gracefully', async () => {
      const mockOnSubmit = vi.fn();
      const { result } = renderHook(() => useRequestForm(mockOnSubmit));

      // Test that the hook can handle validation failures
      // The form starts empty, so validation should fail
      const isValid = await result.current.form.trigger(['firstname', 'lastname']);
      expect(isValid).toBe(false);

      // Test that the form state is accessible
      const formState = result.current.form.formState;
      expect(formState).toBeDefined();
    });
  });
}); 
