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
  // Past Pregnancies step fields
  had_previous_pregnancies: z.boolean().optional(),
  previous_pregnancies_count: z.string().optional(),
  living_children_count: z.string().optional(),
  past_pregnancy_experience: z.string().optional(),
  // Services Interested In step fields
  services_interested: z.array(z.string()).min(1, 'Select at least one service'),
  service_support_details: z.string().min(1, 'Please describe the support you are looking for'),
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
  // 7. Past Pregnancies
  ['had_previous_pregnancies', 'previous_pregnancies_count', 'living_children_count', 'past_pregnancy_experience'],
  // 8. Services Interested In
  ['services_interested', 'service_support_details'],
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
      firstname: 'Jane',
      lastname: 'Doe',
      email: 'jane.doe@example.com',
      phone_number: '555-123-4567',
      pronouns: 'She/Her',
      pronouns_other: '',
      address: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zip_code: '62704',
      home_phone: '555-987-6543',
      home_type: 'House',
      home_access: 'Front door, no stairs',
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
      service_specifics: 'Daytime and overnight support for 2 weeks',
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
      // Services Interested In step defaults
      services_interested: ['Labor Support', 'Postpartum Support'],
      service_support_details: 'I am looking for both labor and postpartum support, including overnight care for 2 weeks.',
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
    if (step < totalSteps - 1) setStep(step + 1);
    return true;
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  return { form, step, setStep, totalSteps, handleNextStep, handleBack };
} 