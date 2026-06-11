import {
  applyIssuesToForm,
  getStepIssues,
  RequestFormInput,
  RequestFormValues,
  fullSchema,
  stepFields,
} from '@/features/request/useRequestForm';
import { DUMMY_TEST_LEAD } from '@/features/request/dummyTestLead';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { type UseFormReturn, useForm, type Resolver } from 'react-hook-form';

interface RequestFormContextType {
  form: UseFormReturn<RequestFormInput, unknown, RequestFormValues>;
  step: number;
  setStep: (step: number) => void;
  totalSteps: number;
  handleNextStep: () => Promise<boolean>;
  handleBack: () => void;
  jumpToStep: (targetStep: number) => Promise<boolean>;
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
  submitted: boolean;
  setSubmitted: (submitted: boolean) => void;
  clearFormData: () => void;
  fillTestData: () => void;
  isUsingTestData: boolean;
  isStepValid: (stepIndex: number) => boolean;
  showRefreshWarning: boolean;
  setShowRefreshWarning: (show: boolean) => void;
  /** Shown when Next/Submit validation fails or submission errors; cleared when the step changes. */
  stepGateMessage: string | null;
}

const RequestFormContext = createContext<RequestFormContextType | undefined>(
  undefined
);

interface RequestFormProviderProps {
  children: ReactNode;
  onSubmit: (
    data: RequestFormValues,
    options?: { isUsingTestData: boolean }
  ) => Promise<void>;
}

// Removed client-side storage for HIPAA compliance

export function RequestFormProvider({
  children,
  onSubmit,
}: RequestFormProviderProps) {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isUsingTestData, setIsUsingTestData] = useState(false);
  const [showRefreshWarning, setShowRefreshWarning] = useState(false);
  const [stepGateMessage, setStepGateMessage] = useState<string | null>(null);
  const totalSteps = 9;

  // No client-side storage for HIPAA compliance
  const getSavedFormData = (): Partial<RequestFormInput> => {
    return {};
  };

  const form = useForm<RequestFormInput, unknown, RequestFormValues>({
    resolver: zodResolver(fullSchema) as Resolver<
      RequestFormInput,
      unknown,
      RequestFormValues
    >,
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
      age: '',
      children_expected: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      home_phone: '',
      home_type: [],
      home_type_other: '',
      home_access: '',
      pets: '',
      home_adults_count: '',
      home_youth_count: '',
      relationship_status: '',
      first_name: '',
      last_name: '',
      middle_name: '',
      family_email: '',
      mobile_phone: '',
      work_phone: '',
      family_pronouns: '',
      referral_source: '',
      referral_source_other: '',
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
      pregnancy_number: 0,
      hospital: '',
      had_previous_pregnancies: undefined,
      previous_pregnancies_count: 0,
      living_children_count: 0,
      past_pregnancy_experience: '',
      services_interested: [],
      service_support_details: '',
      service_needed: '',
      payment_method: '',
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

      ...getSavedFormData(),
    },
  });

  const scrollFirstErroredFieldIntoView = () => {
    const errs = form.formState.errors;
    const firstKey = Object.keys(errs)[0];
    if (!firstKey) return;
    const el = document.getElementById(firstKey);
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (
        el instanceof HTMLElement &&
        typeof el.focus === 'function' &&
        (el.tagName === 'INPUT' ||
          el.tagName === 'SELECT' ||
          el.tagName === 'TEXTAREA')
      ) {
        el.focus({ preventScroll: true });
      }
    }
  };

  const applyZodIssuesToForm = (issues: { path: (string | number)[]; message: string }[]) => {
    applyIssuesToForm(form.setError, issues);
  };

  // Refresh warning functionality
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const values = form.getValues();
      const hasData = Object.values(values).some((value) => {
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'string') return value.trim() !== '';
        if (typeof value === 'number') return value !== 0;
        if (typeof value === 'boolean') return value === true;
        return false;
      });

      if (hasData && !submitted) {
        e.preventDefault();
        e.returnValue =
          'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [form, submitted]);

  useEffect(() => {
    setStepGateMessage(null);
  }, [step]);

  // No client-side storage for HIPAA compliance - form starts fresh each session

  const clearFormData = () => {
    form.reset();
    setStep(0);
    setSubmitted(false);
    setIsUsingTestData(false);
    setStepGateMessage(null);
  };

  const fillTestData = () => {
    form.reset(DUMMY_TEST_LEAD);
    setStep(0);
    setSubmitted(false);
    setIsUsingTestData(true);
    setStepGateMessage(null);
  };

  // Utility function to check if a step is valid, handling conditional fields
  const isStepValid = (stepIndex: number): boolean => {
    const values = form.getValues();
    return getStepIssues(values, stepIndex).length === 0;
  };

  const handleNextStep = async () => {
    setStepGateMessage(null);

    if (step !== totalSteps - 1) {
      const currentStepFields = stepFields[step];
      form.clearErrors(currentStepFields);
      const stepIssues = getStepIssues(form.getValues(), step);

      if (stepIssues.length > 0) {
        applyZodIssuesToForm(stepIssues);
        setStepGateMessage(
          'Some required information is missing or invalid. Please review the highlighted fields on this page before continuing.',
        );
        setTimeout(() => scrollFirstErroredFieldIntoView(), 0);
        return false;
      }
    } else {
      const valid = await form.trigger(undefined, {
        shouldFocus: true,
      });
      if (!valid) {
        setStepGateMessage(
          'Some required information is missing or invalid. Please review the highlighted fields on this page before continuing.',
        );
        setTimeout(() => scrollFirstErroredFieldIntoView(), 0);
        return false;
      }
    }

    if (step !== totalSteps - 1) {
      // Otherwise, move to next step
      if (step < totalSteps - 1) {
        setStep(step + 1);
      }
      return true;
    }

    // If this is the final step, submit the form
    const parsed = fullSchema.safeParse(form.getValues());
    if (!parsed.success) {
      applyZodIssuesToForm(parsed.error.issues);
      setStepGateMessage(
        'Some required information is missing or invalid. Please review the highlighted fields before submitting.',
      );
      setTimeout(() => scrollFirstErroredFieldIntoView(), 0);
      return false;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(parsed.data, { isUsingTestData });
      setSubmitted(true);
      setIsUsingTestData(false);
      setStepGateMessage(null);
      return true;
    } catch (error) {
      console.error('Submission failed:', error);
      setStepGateMessage(
        'We could not submit your request. Please try again in a moment. If the problem continues, contact Sokana Collective for help.',
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const jumpToStep = async (targetStep: number): Promise<boolean> => {
    if (targetStep < 0 || targetStep >= totalSteps) {
      return false;
    }

    if (targetStep === step) {
      return true;
    }

    // Always allow going back so users can review or fix earlier sections.
    if (targetStep < step) {
      setStep(targetStep);
      return true;
    }

    // Jumping forward: validate each step up to (but not including) the target,
    // same bar as advancing with "Next" (no skipping incomplete steps).
    for (let i = 0; i < targetStep; i++) {
      const stepIssues = getStepIssues(form.getValues(), i);
      if (stepIssues.length > 0) {
        form.clearErrors(stepFields[i]);
        applyZodIssuesToForm(stepIssues);
        setStepGateMessage(
          'Please complete the earlier steps before jumping ahead. Some required information is missing or invalid.',
        );
        setTimeout(() => scrollFirstErroredFieldIntoView(), 0);
        return false;
      }
    }

    setStep(targetStep);
    return true;
  };

  const value: RequestFormContextType = {
    form,
    step,
    setStep,
    totalSteps,
    handleNextStep,
    handleBack,
    jumpToStep,
    isSubmitting,
    setIsSubmitting,
    submitted,
    setSubmitted,
    clearFormData,
    fillTestData,
    isUsingTestData,
    isStepValid,
    showRefreshWarning,
    setShowRefreshWarning,
    stepGateMessage,
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
    throw new Error(
      'useRequestFormContext must be used within a RequestFormProvider'
    );
  }
  return context;
}
