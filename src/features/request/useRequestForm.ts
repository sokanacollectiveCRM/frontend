import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export const fullSchema = z
  .object({
    // 1. Client Details
    firstname: z.string().min(1),
    lastname: z.string().min(1),
    email: z.string().email(),
    phone_number: z.string().min(1),
    pronouns: z.string().min(1),
    pronouns_other: z.string().optional(),
    preferred_contact_method: z.string().min(1),
    preferred_name: z.string().optional(),
    children_expected: z.string().optional(),

    // 2. Home Details
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zip_code: z.string().min(1),
    home_phone: z.string().min(1), // renamed from home_phone to just "Phone"
    home_type: z.string().optional(), // made optional
    home_access: z.string().optional(), // made optional
    pets: z.string().optional(), // made optional

    // 3. Family Members (all optional)
    relationship_status: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    middle_name: z.string().optional(),
    family_email: z.string().email().optional(),
    mobile_phone: z.string().optional(),
    work_phone: z.string().optional(),
    family_pronouns: z.string().optional(),

    // 4. Referral
    referral_source: z.string().min(1), // required
    referral_name: z.string().optional(), // made optional, allow "N/A"
    referral_email: z.string().email().optional(), // made optional

    // 5. Health History
    health_history: z.string().optional(), // made optional
    allergies: z.string().optional(),
    health_notes: z.string().optional(),

    // 6. Pregnancy & Baby
    due_date: z.string().min(1, 'Due date is required'),
    birth_location: z.string().min(1, 'Birth location is required'),
    birth_hospital: z.string().min(1, 'Hospital or birth center is required'),
    number_of_babies: z
      .string()
      .min(1, 'Please select the number of babies you are expecting'),
    baby_name: z.string().optional(), // made optional
    provider_type: z.string().min(1, 'Provider type is required'),
    pregnancy_number: z
      .union([z.string(), z.number()])
      .transform((val: string | number) => {
        if (typeof val === 'string') return parseInt(val) || 0;
        return val || 0;
      })
      .refine((val) => val >= 1, {
        message: 'Please enter a valid pregnancy number (must be at least 1)',
      }),
    hospital: z.string().optional(),

    // 7. Past Pregnancies (all optional)
    had_previous_pregnancies: z.boolean().optional(),
    previous_pregnancies_count: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) => {
        if (typeof val === 'string') return parseInt(val) || 0;
        return val || 0;
      })
      .refine((val) => val >= 0, {
        message: 'Please enter a valid number of previous pregnancies',
      }),
    living_children_count: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) => {
        if (typeof val === 'string') return parseInt(val) || 0;
        return val || 0;
      })
      .refine((val) => val >= 0, {
        message: 'Please enter a valid number of living children',
      }),
    past_pregnancy_experience: z.string().optional(),

    // 8. Services Interested In
    services_interested: z
      .array(z.string())
      .min(1, 'Select at least one service'),
    service_support_details: z
      .string()
      .min(1, 'Please describe the support you are looking for'),
    service_needed: z.string().min(1, 'Service needed is required'),

    // 9. Payment
    payment_method: z.string().min(1, 'Payment method is required'),
    annual_income: z.string().optional(),
    service_specifics: z.string().optional(),

    // 10. Client Demographics
    race_ethnicity: z.string().min(1, 'Race/ethnicity is required'),
    primary_language: z.string().min(1, 'Primary language is required'),
    client_age_range: z.string().min(1, 'Age range is required'),
    insurance: z.string().optional(), // paused for later
    demographics_multi: z.array(z.string()).optional(), // experience categories
    demographics_annual_income: z.string().optional(), // for demographics step
  })
  .refine(
    (data) =>
      data.pronouns !== 'Other' ||
      (data.pronouns_other && data.pronouns_other.length > 0),
    {
      message: 'Please specify your pronouns',
      path: ['pronouns_other'],
    }
  );

export type RequestFormValues = z.infer<typeof fullSchema>;

export const stepFields: (keyof RequestFormValues)[][] = [
  // 1. Client Details
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
  // 2. Home Details
  [
    'address',
    'city',
    'state',
    'zip_code',
    'home_phone',
    'home_type',
    'home_access',
    'pets',
  ],
  // 3. Family Members
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
  // 4. Referral
  ['referral_source', 'referral_name', 'referral_email'],
  // 5. Health History
  ['health_history', 'allergies', 'health_notes'],
  // 6. Pregnancy/Baby
  [
    'due_date',
    'birth_location',
    'birth_hospital',
    'number_of_babies',
    'baby_name',
    'provider_type',
    'pregnancy_number',
  ],
  // 7. Past Pregnancies
  [
    'had_previous_pregnancies',
    'previous_pregnancies_count',
    'living_children_count',
    'past_pregnancy_experience',
  ],
  // 8. Services Interested In
  ['services_interested', 'service_support_details', 'service_needed'],
  // 9. Payment
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

export function useRequestForm(
  onSubmit: (data: RequestFormValues) => Promise<void>
) {
  const [step, setStep] = useState(0);
  const totalSteps = 10;
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
      mobile_phone: '',
      work_phone: '',
      family_email: '',
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
      pregnancy_number: 0,
      had_previous_pregnancies: false,
      previous_pregnancies_count: 0,
      living_children_count: 0,
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
    },
  });

  const handleNextStep = async () => {
    const valid = await form.trigger(stepFields[step], { shouldFocus: true });
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
      const formData = form.getValues();
      await onSubmit(formData);
      return true;
    }

    // Otherwise, move to next step
    if (step < totalSteps - 1) setStep(step + 1);
    return true;
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  return { form, step, setStep, totalSteps, handleNextStep, handleBack };
}
