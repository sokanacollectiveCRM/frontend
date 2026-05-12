import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  PAYMENT_METHOD_OPTIONS as SHARED_PAYMENT_METHOD_OPTIONS,
  INSURANCE_PLAN_TYPE_OPTIONS,
  INSURANCE_POLICY_HOLDER_RELATIONSHIP_OPTIONS,
  isMedicaidMethod,
  isSelfPayMethod as sharedIsSelfPayMethod,
  isSelfPaySlidingScaleMethod,
  requiresInsuranceDetails,
  type InsurancePlanType,
  type InsurancePolicyHolderRelationship,
} from '@/lib/paymentRules';
import { SELF_PAY_SLIDING_SUPPORT_TYPES } from '@/lib/slidingScaleData';

export const PAYMENT_METHOD_OPTIONS = SHARED_PAYMENT_METHOD_OPTIONS;

export type PaymentMethod = (typeof PAYMENT_METHOD_OPTIONS)[number];

export const isSelfPayMethod = (value: string) => sharedIsSelfPayMethod(value);
export { isMedicaidMethod };

export const fullSchema = z
  .object({
    // 1. Client Details
    firstname: z.string().min(1, 'Please enter your first name.'),
    lastname: z.string().min(1, 'Please enter your last name.'),
    email: z.string().email('Please enter a valid email address.'),
    phone_number: z.string().min(1, 'Please enter your mobile phone number.'),
    pronouns: z.string().min(1, 'Please select your pronouns.'),
    pronouns_other: z.string().optional(),
    preferred_contact_method: z.string().min(1, 'Please select your preferred contact method.'),
    preferred_name: z.string().optional(),
    age: z
      .union([z.string(), z.number()])
      .transform((val: string | number) => {
        if (val === '' || val === null || val === undefined) return NaN;
        if (typeof val === 'number') {
          return Number.isFinite(val) ? val : NaN;
        }
        const t = String(val).trim();
        if (t === '') return NaN;
        if (!/^\d+$/.test(t)) return NaN;
        return parseInt(t, 10);
      })
      .refine((n) => !Number.isNaN(n), { message: 'Please enter your age.' })
      .refine((n) => Number.isInteger(n), {
        message: 'Please enter a whole number for your age.',
      })
      .refine((n) => n >= 1, { message: 'Age must be at least 1.' })
      .refine((n) => n <= 120, { message: 'Please enter a valid age.' }),
    children_expected: z.string().optional(),

    // 2. Home Details
    address: z.string().min(1, 'Please enter your address.'),
    city: z.string().min(1, 'Please enter your city.'),
    state: z.string().min(1, 'Please enter your state.'),
    zip_code: z.string().min(1, 'Please enter your zip code.'),
    home_phone: z.string().optional(), // removed from form, made optional
    home_type: z.string().optional(), // made optional
    home_access: z.string().optional(), // made optional
    pets: z
      .string()
      .trim()
      .min(1, 'Please list the types of any pets/animals that are in the home.'),

    // 3. Family Members (all optional)
    relationship_status: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    middle_name: z.string().optional(),
    family_email: z.string().optional().refine((val) => {
      if (!val || val.trim() === '') return true; // Allow empty
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val); // Validate email if provided
    }, 'Please enter a valid email address.'),
    mobile_phone: z.string().optional(),
    work_phone: z.string().optional(),
    family_pronouns: z.string().optional(),

    // 4. Referral
    referral_source: z
      .string()
      .trim()
      .min(1, 'Please select how you heard about Sokana.'), // required — blocks Next until chosen
    /** Free text when referral_source is "Other". */
    referral_source_other: z.string().optional(),
    referral_name: z.string().optional(), // made optional, allow "N/A"
    referral_email: z.string().optional().refine((val) => {
      if (!val || val.trim() === '') return true; // Allow empty
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val); // Validate email if provided
    }, 'Please enter a valid email address.'),

    // 5. Health History
    health_history: z.string().optional(), // made optional
    allergies: z.string().optional(),
    health_notes: z.string().optional(),

    // 6. Pregnancy & Baby
    due_date: z.string().min(1, 'Please enter your due date.'),
    birth_location: z.string().min(1, 'Please enter your birth location.'),
    birth_hospital: z.string().optional(),
    number_of_babies: z
      .string()
      .min(1, 'Please select the number of babies you are expecting'),
    baby_name: z.string().optional(), // made optional
    provider_type: z.string().min(1, 'Please select your provider type.'),
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
      .min(1, 'Please select at least one service.'),
    service_support_details: z
      .string()
      .min(1, 'Please describe the support you are looking for.'),
    /** Filled automatically on submit from selections + details; no separate form field. */
    service_needed: z.string().optional(),

    // 9. Payment
    payment_method: z.union([z.literal(''), z.enum(PAYMENT_METHOD_OPTIONS)]),
    insurance_policy_holder_name: z.string().optional(),
    insurance_policy_holder_dob: z.string().optional(),
    insurance_policy_holder_relationship: z.string().optional(),
    insurance_provider: z.string().optional(),
    insurance_member_id: z.string().optional(),
    /** Stored as `policy_number` in API — group number (optional). */
    policy_number: z.string().optional(),
    insurance_plan_type: z.string().optional(),
    insurance_phone_number: z.string().optional(),
    has_secondary_insurance: z.boolean().optional(),
    secondary_insurance_provider: z.string().optional(),
    secondary_insurance_member_id: z.string().optional(),
    secondary_policy_number: z.string().optional(),
    annual_income: z.string().optional(),
    service_specifics: z.string().optional(),
    self_pay_sliding_support_type: z.string().optional(),
    self_pay_sliding_tier: z.string().optional(),

    // 10. Client Demographics (ALL OPTIONAL)
    race_ethnicity: z.string().optional(),
    primary_language: z.string().optional(),
    client_age_range: z.string().optional(),
    insurance: z.string().optional(),
    demographics_multi: z.array(z.string()).optional(),
    demographics_annual_income: z.string().optional(),
  })
  .refine(
    (data) =>
      data.pronouns !== 'Other' ||
      (data.pronouns_other && data.pronouns_other.length > 0),
    {
      message: 'Please specify your pronouns',
      path: ['pronouns_other'],
    }
  )
  .refine(
    (data) =>
      data.referral_source !== 'Other' ||
      Boolean(data.referral_source_other?.trim()),
    {
      message: 'Please describe how you heard about Sokana.',
      path: ['referral_source_other'],
    }
  )
  .superRefine((data, ctx) => {
    if (!data.payment_method) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select how you plan to pay for services.',
        path: ['payment_method'],
      });
    }

    // Insurance details for commercial, private, or Medicaid. Self-Pay / Full Support have none.
    const needsInsuranceDetails = requiresInsuranceDetails(data.payment_method);

    if (needsInsuranceDetails) {
      if (!data.insurance_policy_holder_name?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter the policy holder name.',
          path: ['insurance_policy_holder_name'],
        });
      }
      if (!data.insurance_policy_holder_dob?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter the policy holder date of birth.',
          path: ['insurance_policy_holder_dob'],
        });
      }
      const rel = data.insurance_policy_holder_relationship?.trim() ?? '';
      if (
        !rel ||
        !INSURANCE_POLICY_HOLDER_RELATIONSHIP_OPTIONS.includes(
          rel as InsurancePolicyHolderRelationship
        )
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select the policy holder’s relationship to you.',
          path: ['insurance_policy_holder_relationship'],
        });
      }
      if (!data.insurance_provider?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter your insurance company name.',
          path: ['insurance_provider'],
        });
      }
      if (!data.insurance_member_id?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter your member ID or subscriber ID.',
          path: ['insurance_member_id'],
        });
      }
      const plan = data.insurance_plan_type?.trim() ?? '';
      if (!plan || !INSURANCE_PLAN_TYPE_OPTIONS.includes(plan as InsurancePlanType)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select a plan type.',
          path: ['insurance_plan_type'],
        });
      }
    }

    if (data.has_secondary_insurance) {
      if (!data.secondary_insurance_provider?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter the secondary insurance provider.',
          path: ['secondary_insurance_provider'],
        });
      }
      if (!data.secondary_insurance_member_id?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter the secondary insurance member ID.',
          path: ['secondary_insurance_member_id'],
        });
      }
      if (!data.secondary_policy_number?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter the secondary policy number.',
          path: ['secondary_policy_number'],
        });
      }
    }

    if (isSelfPaySlidingScaleMethod(data.payment_method)) {
      const scope = data.self_pay_sliding_support_type?.trim() ?? '';
      if (!scope || !SELF_PAY_SLIDING_SUPPORT_TYPES.includes(scope as (typeof SELF_PAY_SLIDING_SUPPORT_TYPES)[number])) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select whether you are interested in labor support, postpartum support, or both.',
          path: ['self_pay_sliding_support_type'],
        });
      }
      if (!data.self_pay_sliding_tier?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select the income row that best matches your household from the sliding scale chart.',
          path: ['self_pay_sliding_tier'],
        });
      }
    }
  });

export type RequestFormValues = z.infer<typeof fullSchema>;

export const stepFields: (keyof RequestFormValues)[][] = [
  // 1. Services Interested In (MOVED TO FIRST)
  ['services_interested', 'service_support_details'],
  // 2. Client Details
  [
    'firstname',
    'lastname',
    'email',
    'phone_number',
    'preferred_contact_method',
    'preferred_name',
    'age',
    'pronouns',
    'pronouns_other',
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
  ],
  // 5. Referral
  ['referral_source', 'referral_source_other', 'referral_name', 'referral_email'],
  // 6. Health (pregnancy/baby/postpartum + allergies only on this step)
  ['health_history', 'allergies'],
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
  [
    'payment_method',
    'insurance_policy_holder_name',
    'insurance_policy_holder_dob',
    'insurance_policy_holder_relationship',
    'insurance_provider',
    'insurance_member_id',
    'policy_number',
    'insurance_plan_type',
    'insurance_phone_number',
    'has_secondary_insurance',
    'secondary_insurance_provider',
    'secondary_insurance_member_id',
    'secondary_policy_number',
    'annual_income',
    'service_specifics',
    'self_pay_sliding_support_type',
    'self_pay_sliding_tier',
  ],
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
      age: '',
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
      had_previous_pregnancies: false,
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
