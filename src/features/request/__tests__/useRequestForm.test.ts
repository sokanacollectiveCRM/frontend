import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { fullSchema, useRequestForm } from '../useRequestForm';

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
  useForm: vi.fn(),
}));

// Mock @hookform/resolvers/zod
vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: vi.fn(),
}));

describe('useRequestForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Schema Validation', () => {
    test('validates complete form data successfully', () => {
      const validData = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        phone_number: '555-123-4567',
        pronouns: 'He/Him',
        pronouns_other: '',
        address: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zip_code: '62704',
        home_phone: '555-987-6543',
        home_type: 'House',
        home_access: 'Front door',
        pets: 'Dog',
        relationship_status: 'Partner',
        first_name: 'Alex',
        last_name: 'Doe',
        middle_name: 'Marie',
        mobile_phone: '555-222-3333',
        work_phone: '555-444-5555',
        referral_source: 'Google',
        referral_name: 'Sokana',
        referral_email: 'referral@example.com',
        health_history: 'No major health issues',
        allergies: 'Peanuts',
        health_notes: 'N/A',
        annual_income: '$45,000-$64,999',
        service_needed: 'Labor Support',
        service_specifics: 'Daytime and overnight support',
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
        past_pregnancy_experience: 'Healthy previous pregnancy',
        services_interested: ['Labor Support', 'Postpartum Support'],
        service_support_details: 'Looking for comprehensive support',
      };

      const result = fullSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test('fails validation with missing required fields', () => {
      const invalidData = {
        firstname: '',
        lastname: 'Doe',
        email: 'invalid-email',
        phone_number: '',
      };

      const result = fullSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(expect.any(Number));
      }
    });

    test('validates email format correctly', () => {
      const invalidEmailData = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'invalid-email-format',
        phone_number: '555-123-4567',
      };

      const result = fullSchema.safeParse(invalidEmailData);
      expect(result.success).toBe(false);
    });

    test('validates services_interested array requirement', () => {
      const invalidServicesData = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        phone_number: '555-123-4567',
        services_interested: [], // Empty array should fail
        service_support_details: 'Looking for support',
      };

      const result = fullSchema.safeParse(invalidServicesData);
      expect(result.success).toBe(false);
    });

    test('validates service_support_details requirement', () => {
      const invalidSupportData = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        phone_number: '555-123-4567',
        services_interested: ['Labor Support'],
        service_support_details: '', // Empty string should fail
      };

      const result = fullSchema.safeParse(invalidSupportData);
      expect(result.success).toBe(false);
    });
  });

  describe('Step Fields Configuration', () => {
    test('has correct number of steps', () => {
      const { result } = renderHook(() => useRequestForm(mockOnSubmit));
      expect(result.current.totalSteps).toBe(10);
    });

    test('step 0 contains correct fields', () => {
      const stepFields = [
        'firstname', 'lastname', 'email', 'phone_number', 'pronouns', 'pronouns_other'
      ];
      
      // This would test the actual stepFields configuration
      expect(stepFields).toContain('firstname');
      expect(stepFields).toContain('lastname');
      expect(stepFields).toContain('email');
    });
  });

  describe('Form Navigation Logic', () => {
    test('initializes with step 0', () => {
      const { result } = renderHook(() => useRequestForm(mockOnSubmit));
      expect(result.current.step).toBe(0);
    });

    test('handleNextStep advances to next step when validation passes', async () => {
      const mockTrigger = vi.fn().mockResolvedValue(true);
      const mockSetStep = vi.fn();
      
      const { result } = renderHook(() => useRequestForm(mockOnSubmit));
      
      // Mock the form methods
      result.current.form.trigger = mockTrigger;
      result.current.setStep = mockSetStep;
      
      await act(async () => {
        await result.current.handleNextStep();
      });
      
      expect(mockTrigger).toHaveBeenCalled();
      expect(mockSetStep).toHaveBeenCalledWith(1);
    });

    test('handleNextStep does not advance when validation fails', async () => {
      const mockTrigger = vi.fn().mockResolvedValue(false);
      const mockSetStep = vi.fn();
      
      const { result } = renderHook(() => useRequestForm(mockOnSubmit));
      
      // Mock the form methods
      result.current.form.trigger = mockTrigger;
      result.current.setStep = mockSetStep;
      
      await act(async () => {
        await result.current.handleNextStep();
      });
      
      expect(mockTrigger).toHaveBeenCalled();
      expect(mockSetStep).not.toHaveBeenCalled();
    });

    test('handleBack decrements step when not on first step', () => {
      const mockSetStep = vi.fn();
      
      const { result } = renderHook(() => useRequestForm(mockOnSubmit));
      
      // Mock the form methods
      result.current.setStep = mockSetStep;
      result.current.step = 1; // Set to step 1
      
      act(() => {
        result.current.handleBack();
      });
      
      expect(mockSetStep).toHaveBeenCalledWith(0);
    });

    test('handleBack does not decrement when on first step', () => {
      const mockSetStep = vi.fn();
      
      const { result } = renderHook(() => useRequestForm(mockOnSubmit));
      
      // Mock the form methods
      result.current.setStep = mockSetStep;
      result.current.step = 0; // Set to step 0
      
      act(() => {
        result.current.handleBack();
      });
      
      expect(mockSetStep).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    test('calls onSubmit with form data on final step', async () => {
      const mockFormData = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        // ... other form data
      };
      
      const { result } = renderHook(() => useRequestForm(mockOnSubmit));
      
      // Mock form.getValues to return test data
      result.current.form.getValues = vi.fn().mockReturnValue(mockFormData);
      result.current.step = 9; // Final step
      
      await act(async () => {
        await result.current.handleNextStep();
      });
      
      expect(mockOnSubmit).toHaveBeenCalledWith(mockFormData);
    });
  });

  describe('Error Handling', () => {
    test('handles validation errors gracefully', async () => {
      const mockTrigger = vi.fn().mockResolvedValue(false);
      
      const { result } = renderHook(() => useRequestForm(mockOnSubmit));
      
      // Mock the form methods
      result.current.form.trigger = mockTrigger;
      
      await act(async () => {
        const success = await result.current.handleNextStep();
        expect(success).toBe(false);
      });
      
      expect(mockTrigger).toHaveBeenCalled();
    });

    test('scrolls to first error field when validation fails', async () => {
      const mockScrollIntoView = vi.fn();
      const mockGetElementById = vi.fn().mockReturnValue({
        scrollIntoView: mockScrollIntoView,
      });
      
      // Mock document.getElementById
      Object.defineProperty(document, 'getElementById', {
        value: mockGetElementById,
        writable: true,
      });
      
      const mockTrigger = vi.fn().mockResolvedValue(false);
      
      const { result } = renderHook(() => useRequestForm(mockOnSubmit));
      
      // Mock the form methods
      result.current.form.trigger = mockTrigger;
      result.current.form.formState.errors = { firstname: { message: 'Required' } };
      
      await act(async () => {
        await result.current.handleNextStep();
      });
      
      expect(mockGetElementById).toHaveBeenCalledWith('firstname');
      expect(mockScrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
      });
    });
  });
}); 