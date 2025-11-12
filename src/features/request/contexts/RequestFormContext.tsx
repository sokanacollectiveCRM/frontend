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
      firstname: '',
      lastname: '',
      email: '',
      phone_number: '',
      pronouns: '',
      pronouns_other: '',
      preferred_contact_method: '',
      preferred_name: '',
      children_expected: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      home_phone: '',
      home_type: '',
      home_access: '',
      pets: '',
      relationship_status: '',
      first_name: '',
      last_name: '',
      middle_name: '',
      family_email: '',
      mobile_phone: '',
      work_phone: '',
      family_pronouns: '',
      referral_source: '',
      referral_name: '',
      referral_email: '',
      health_history: '',
      allergies: '',
      health_notes: '',
      due_date: '',
      birth_location: '',
      birth_hospital: '',
      number_of_babies: '',
      baby_name: '',
      provider_type: '',
      pregnancy_number: '',
      hospital: '',
      had_previous_pregnancies: false,
      previous_pregnancies_count: '',
      living_children_count: '',
      past_pregnancy_experience: '',
      services_interested: [],
      service_support_details: '',
      service_needed: '',
      payment_method: '',
      annual_income: '',
      service_specifics: '',
      race_ethnicity: '',
      primary_language: '',
      client_age_range: '',
      insurance: '',
      demographics_multi: [],
      demographics_annual_income: '',

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