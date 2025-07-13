import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export const fullSchema = z.object({
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  email: z.string().email(),
  phone_number: z.string().min(1),
  pronouns: z.string().min(1),
  pronouns_other: z.string().optional(),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip_code: z.string().min(1),
  home_phone: z.string().min(1),
  home_type: z.string().min(1),
  home_access: z.string().min(1),
  pets: z.string().min(1),
  relationship_status: z.string().min(1),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  middle_name: z.string().min(1),
  mobile_phone: z.string().min(1),
  work_phone: z.string().min(1),
  referral_source: z.string().min(1),
  referral_name: z.string().min(1),
  referral_email: z.string().email().optional(),
  health_history: z.string().min(1),
  allergies: z.string().min(1),
  health_notes: z.string().min(1),
  annual_income: z.string().min(1),
  service_needed: z.string().min(1),
  service_specifics: z.string().min(1),
  // Pregnancy/Baby step fields
  due_date: z.string().min(1, 'Due date is required'),
  birth_location: z.string().min(1, 'Birth location is required'),
  birth_hospital: z.string().min(1, 'Hospital or birth center is required'),
  number_of_babies: z.string().min(1, 'Number of babies is required'),
  baby_name: z.string().optional(),
  provider_type: z.string().min(1, 'Provider type is required'),
  pregnancy_number: z.string().min(1, 'Pregnancy number is required'),
}).refine((data) => data.pronouns !== 'Other' || (data.pronouns_other && data.pronouns_other.length > 0), {
  message: 'Please specify your pronouns',
  path: ['pronouns_other'],
});

export type RequestFormValues = z.infer<typeof fullSchema>;

export const stepFields: (keyof RequestFormValues)[][] = [
  // 1. Client Details
  ['firstname', 'lastname', 'email', 'phone_number', 'pronouns', 'pronouns_other'],
  // 2. Home Details
  ['address', 'city', 'state', 'zip_code', 'home_phone', 'home_type', 'home_access', 'pets'],
  // 3. Family Members
  ['relationship_status', 'first_name', 'last_name', 'pronouns', 'middle_name', 'email', 'mobile_phone', 'work_phone'],
  // 4. Referral
  ['referral_source', 'referral_name', 'referral_email'],
  // 5. Health History
  ['health_history', 'allergies', 'health_notes'],
  // 6. Pregnancy/Baby
  ['due_date', 'birth_location', 'birth_hospital', 'number_of_babies', 'baby_name', 'provider_type', 'pregnancy_number'],
  // 7. Past Pregnancies (placeholder)
  [],
  // 8. Services Interested In (placeholder)
  [],
  // 9. Payment (placeholder)
  [],
  // 10. Client Demographics (placeholder)
  [],
];

export function useRequestForm(onSubmit: (data: RequestFormValues) => Promise<void>) {
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
      referral_source: '',
      referral_name: '',
      referral_email: '',
      health_history: '',
      allergies: '',
      health_notes: '',
      annual_income: '',
      service_needed: '',
      service_specifics: '',
      // Pregnancy/Baby step defaults
      due_date: '',
      birth_location: '',
      birth_hospital: '',
      number_of_babies: '',
      baby_name: '',
      provider_type: '',
      pregnancy_number: '',
    },
  });

  const handleNextStep = async () => {
    const valid = await form.trigger(stepFields[step]);
    if (!valid) return false;
    if (step < totalSteps - 1) setStep(step + 1);
    return true;
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  return { form, step, setStep, totalSteps, handleNextStep, handleBack };
} 