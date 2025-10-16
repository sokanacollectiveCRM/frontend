import { zodResolver } from '@hookform/resolvers/zod';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RequestFormValues, fullSchema } from '../useRequestForm';

interface RequestFormContextType {
  form: ReturnType<typeof useForm<RequestFormValues>>;
  step: number;
  setStep: (step: number) => void;
  totalSteps: number;
  handleNextStep: () => Promise<boolean>;
  handleBack: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
  submitted: boolean;
  setSubmitted: (submitted: boolean) => void;
  clearFormData: () => void;
  isStepValid: (stepIndex: number) => boolean;
  showRefreshWarning: boolean;
  setShowRefreshWarning: (show: boolean) => void;
}

const RequestFormContext = createContext<RequestFormContextType | undefined>(undefined);

interface RequestFormProviderProps {
  children: ReactNode;
  onSubmit: (data: RequestFormValues) => Promise<void>;
}

// Removed client-side storage for HIPAA compliance

export function RequestFormProvider({ children, onSubmit }: RequestFormProviderProps) {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showRefreshWarning, setShowRefreshWarning] = useState(false);
  const totalSteps = 10;

  // No client-side storage for HIPAA compliance
  const getSavedFormData = (): Partial<RequestFormValues> => {
    return {};
  };

  const getSavedStep = (): number => {
    return 0;
  };

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(fullSchema),
    mode: 'onChange',
    defaultValues: {
      // ===== COMPREHENSIVE TEST DATA - Remove before production! =====

      // 1. Personal/Contact Information (9 fields)
      firstname: 'Sarah',
      lastname: 'Johnson',
      email: 'sarah.johnson@test.com',
      phone_number: '312-555-0123',
      pronouns: 'She/Her',
      pronouns_other: '',
      preferred_contact_method: 'Email',
      preferred_name: 'Sarah J.',
      children_expected: '2',

      // 2. Home Details (7 fields)
      address: '456 Oak Avenue, Apt 3B',
      city: 'Chicago',
      state: 'IL',
      zip_code: '60614',
      home_phone: '773-555-0199',
      home_type: 'Apartment',
      home_access: 'Buzz apartment 3B at front door',
      pets: 'Two cats (Luna and Oliver)',

      // 3. Family Members (8 fields)
      relationship_status: 'Partner',
      first_name: 'Michael',
      last_name: 'Johnson',
      middle_name: 'James',
      family_email: 'mike.johnson@test.com',
      mobile_phone: '312-555-0456',
      work_phone: '312-555-0789',
      family_pronouns: 'He/Him',

      // 4. Referral (3 fields)
      referral_source: 'Former client',
      referral_name: 'Jennifer Smith',
      referral_email: 'jennifer.smith@example.com',

      // 5. Health History (3 fields)
      health_history: 'History of high blood pressure, well-controlled with medication',
      allergies: 'Peanuts, shellfish, latex',
      health_notes: 'Gestational diabetes (diet-controlled), low-risk for preeclampsia',

      // 6. Pregnancy & Baby (8 fields)
      due_date: '2025-08-20',
      birth_location: 'Hospital',
      birth_hospital: 'Rush University Medical Center',
      number_of_babies: 'Singleton',
      baby_name: 'Emma (if girl), Ethan (if boy)',
      provider_type: 'OB/GYN',
      pregnancy_number: 2,
      hospital: 'Rush University Medical Center', // duplicate/legacy field

      // 7. Past Pregnancies (4 fields)
      had_previous_pregnancies: true,
      previous_pregnancies_count: 1,
      living_children_count: 1,
      past_pregnancy_experience: 'First pregnancy resulted in healthy baby girl via C-section at 39 weeks. Recovery was smooth, breastfed for 6 months.',

      // 8. Services Interested (3 fields)
      services_interested: ['Labor Support', 'Postpartum Support', 'Lactation Support'],
      service_support_details: 'Looking for overnight postpartum support 3 nights/week for first 6 weeks, plus labor support for VBAC delivery',
      service_needed: 'Comprehensive support package including labor coaching, postpartum care, and lactation consulting for high-risk VBAC pregnancy',

      // 9. Payment (3 fields)
      payment_method: 'Private Insurance',
      annual_income: '$75k-$100k',
      service_specifics: 'Insurance covers 80% of doula services, willing to pay remaining balance',

      // 10. Client Demographics - ALL OPTIONAL (6 fields)
      race_ethnicity: 'Black/African American',
      primary_language: 'English',
      client_age_range: '25-34',
      insurance: 'Private',
      demographics_multi: ['First-time parent', 'LGBTQ+ family', 'Low income'],
      demographics_annual_income: '$50k-$75k',

      ...getSavedFormData(),
    },
  });

  // Refresh warning functionality
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const values = form.getValues();
      const hasData = Object.values(values).some(value => {
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'string') return value.trim() !== '';
        if (typeof value === 'number') return value !== 0;
        if (typeof value === 'boolean') return value === true;
        return false;
      });

      if (hasData && !submitted) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [form, submitted]);

  // No client-side storage for HIPAA compliance - form starts fresh each time

  const clearFormData = () => {
    // No client-side storage to clear - just reset form state
    form.reset();
    setStep(0);
    setSubmitted(false);
  };

  // Utility function to check if a step is valid, handling conditional fields
  const isStepValid = (stepIndex: number): boolean => {
    const fields = stepFields[stepIndex];
    const values = form.getValues();
    const errors = form.formState.errors;

    return fields.every((field) => {
      // Special handling for conditional fields
      if (field === 'pronouns_other') {
        // Only validate pronouns_other if pronouns is "Other"
        return values.pronouns !== 'Other' || !errors[field];
      }

      // For all other fields, just check if there's no error
      return !errors[field];
    });
  };

  const stepFields: (keyof RequestFormValues)[][] = [
    // 1. Services Interested In (MOVED TO FIRST)
    ['services_interested', 'service_support_details', 'service_needed'],
    // 2. Client Details
    [
      'firstname',
      'lastname',
      'email',
      'phone_number',
      'pronouns',
      'pronouns_other',
      'preferred_contact_method',
      'preferred_name',
      'children_expected',
    ],
    // 3. Home Details
    [
      'address',
      'city',
      'state',
      'zip_code',
      'home_type',
      'home_access',
      'pets',
    ],
    // 4. Family Members
    [
      'relationship_status',
      'first_name',
      'last_name',
      'family_pronouns',
      'middle_name',
      'family_email',
      'mobile_phone',
      'work_phone',
    ],
    // 5. Referral
    ['referral_source', 'referral_name', 'referral_email'],
    // 6. Health History
    ['health_history', 'allergies', 'health_notes'],
    // 7. Pregnancy/Baby
    [
      'due_date',
      'birth_location',
      'birth_hospital',
      'number_of_babies',
      'baby_name',
      'provider_type',
      'pregnancy_number',
    ],
    // 8. Past Pregnancies
    [
      'had_previous_pregnancies',
      'previous_pregnancies_count',
      'living_children_count',
      'past_pregnancy_experience',
    ],
    // 9. Payment (stays near the end)
    ['payment_method', 'annual_income', 'service_specifics'],
    // 10. Client Demographics
    [
      'race_ethnicity',
      'primary_language',
      'client_age_range',
      'insurance',
      'demographics_multi',
      'demographics_annual_income',
    ],
  ];

  const handleNextStep = async () => {
    console.log('handleNextStep called, current step:', step);
    console.log('Current form values before validation:', form.getValues());

    const valid = await form.trigger(stepFields[step], { shouldFocus: true });
    console.log('Validation result:', valid);
    console.log('Form errors after validation:', form.formState.errors);
    console.log('Form values after validation:', form.getValues());

    if (!valid) {
      // Optionally scroll to first error field for better UX
      const firstErrorField = Object.keys(form.formState.errors)[0];
      if (firstErrorField) {
        const el = document.getElementById(firstErrorField);
        if (el && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return false;
    }

    // If this is the final step, submit the form
    if (step === totalSteps - 1) {
      setIsSubmitting(true);
      try {
        const formData = form.getValues();
        await onSubmit(formData);
        setSubmitted(true);
        // Don't clear form data - let user see the thank you message
        // Form will reset when they navigate away or refresh
      } catch (error) {
        // Error is handled by the onSubmit function
        console.error('Submission failed:', error);
      } finally {
        setIsSubmitting(false);
      }
      return true;
    }

    // Otherwise, move to next step
    if (step < totalSteps - 1) {
      console.log('Moving to next step:', step + 1);
      setStep(step + 1);
    }
    return true;
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const value: RequestFormContextType = {
    form,
    step,
    setStep,
    totalSteps,
    handleNextStep,
    handleBack,
    isSubmitting,
    setIsSubmitting,
    submitted,
    setSubmitted,
    clearFormData,
    isStepValid,
    showRefreshWarning,
    setShowRefreshWarning,
  };

  return (
    <RequestFormContext.Provider value={value}>
      {children}
    </RequestFormContext.Provider>
  );
}

export function useRequestFormContext() {
  const context = useContext(RequestFormContext);
  if (context === undefined) {
    throw new Error('useRequestFormContext must be used within a RequestFormProvider');
  }
  return context;
} 