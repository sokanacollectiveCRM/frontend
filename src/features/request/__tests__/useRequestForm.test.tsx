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
        address: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zip_code: '62704',
        home_phone: '555-987-6543',
        home_type: 'House',
        home_access: 'Front door, no stairs',
        pets: 'Dog',
        relationship_status: 'Partner',
        family_first_name: 'Alex',
        family_last_name: 'Doe',
        family_middle_name: 'Marie',
        family_mobile_phone: '555-222-3333',
        family_work_phone: '555-444-5555',
        family_email: 'alex.doe@example.com',
        family_pronouns: 'They/Them',
        referral_source: 'Google',
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
        payment_method: 'Credit Card',
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
  });

  describe('Hook Initialization', () => {
    it('initializes with correct default values', () => {
      const mockOnSubmit = vi.fn();
      const { result } = renderHook(() => useRequestForm(mockOnSubmit));

      expect(result.current.step).toBe(0);
      expect(result.current.totalSteps).toBe(10);
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
  });

  describe('Form Validation', () => {
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
      });

      const isValid = await result.current.form.trigger([
        'firstname',
        'lastname',
        'email',
        'phone_number',
        'pronouns',
        'preferred_contact_method',
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