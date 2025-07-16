import { Button } from '@/common/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/common/components/ui/popover';
import { useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';
import styles from './RequestForm.module.scss';

function ArrowSVG({ color = '#757575' }: { color?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" style={{ display: 'block' }}>
      <polygon points="7,10 12,15 17,10" fill={color} />
    </svg>
  );
}

const relationshipOptions = [
  'Spouse',
  'Partner',
  'Friend',
  'Parent',
  'Sibling',
  'Other',
];
const pronounOptions = [
  'She/Her',
  'He/Him',
  'They/Them',
  'Ze/Hir/Zir',
  'None',
];
const referralOptions = [
  'Google',
  'Doula Match',
  'Former client',
  'Sokana Member',
  'Social Media',
  'Email Blast',
];

export function Step3FamilyMembers({ form, control, handleBack, handleNextStep, step, totalSteps }: any) {
  const values = form.getValues();
  const errors = form.formState.errors;
  const [focus, setFocus] = useState({
    relationship_status: false,
    family_first_name: false,
    family_last_name: false,
    family_pronouns: false,
    family_middle_name: false,
    family_email: false,
    family_mobile_phone: false,
    family_work_phone: false,
  });
  const [relationshipOpen, setRelationshipOpen] = useState(false);
  const [pronounsOpen, setPronounsOpen] = useState(false);

  const handleFocus = (field: keyof typeof focus) => setFocus(f => ({ ...f, [field]: true }));
  const handleBlur = (field: keyof typeof focus) => setFocus(f => ({ ...f, [field]: false }));

  const isStepValid = [
    'relationship_status', 'first_name', 'last_name', 'pronouns', 'middle_name', 'email', 'mobile_phone', 'work_phone'
  ].every(field => !errors[field]);

  // Debug logs
  console.log('Step3FamilyMembers values:', values);
  console.log('Step3FamilyMembers errors:', errors);
  console.log('Step3FamilyMembers isStepValid:', isStepValid);

  return (
    <div>
      <div className={styles['form-section-title']}>Family members</div>
      <div className={styles['form-grid']}>
        {/* Relationship status */}
        <div className={styles['form-field']}>
          <select
            className={styles['form-select']}
            {...form.register('relationship_status')}
            id="relationship_status"
            defaultValue=""
            onFocus={() => { handleFocus('relationship_status'); setRelationshipOpen(true); }}
            onBlur={() => { handleBlur('relationship_status'); setRelationshipOpen(false); }}
          >
            <option value="" disabled hidden></option>
            {relationshipOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <label
            htmlFor="relationship_status"
            className={
              styles['form-floating-label'] +
              ((focus.relationship_status || values.relationship_status) ? ' ' + styles['form-label--active'] : '')
            }
            style={{ left: 0, color: relationshipOpen ? '#00bcd4' : undefined, right: 0, maxWidth: 'calc(100% - 36px)' }}
          >
            Relationship status
          </label>
          <span
            className={styles['form-select-arrow']}
            style={{ color: relationshipOpen ? '#00bcd4' : '#757575' }}
          >
            ▼
          </span>
          {errors.relationship_status && <div className={styles['form-error']}>{errors.relationship_status.message as string}</div>}
        </div>
        {/* First Name */}
        <div className={styles['form-field']}>
          <input
            className={styles['form-input']}
            {...form.register('family_first_name')}
            id="family_first_name"
            autoComplete="off"
            onFocus={() => handleFocus('family_first_name')}
            onBlur={() => handleBlur('family_first_name')}
          />
          <label
            htmlFor="family_first_name"
            className={
              styles['form-floating-label'] +
              ((focus.family_first_name || values.family_first_name) ? ' ' + styles['form-label--active'] : '')
            }
          >
            First Name
          </label>
          {errors.family_first_name && <div className={styles['form-error']}>{errors.family_first_name.message as string}</div>}
        </div>
        {/* Last Name */}
        <div className={styles['form-field']}>
          <input
            className={styles['form-input']}
            {...form.register('family_last_name')}
            id="family_last_name"
            autoComplete="off"
            onFocus={() => handleFocus('family_last_name')}
            onBlur={() => handleBlur('family_last_name')}
          />
          <label
            htmlFor="family_last_name"
            className={
              styles['form-floating-label'] +
              ((focus.family_last_name || values.family_last_name) ? ' ' + styles['form-label--active'] : '')
            }
          >
            Last Name
          </label>
          {errors.family_last_name && <div className={styles['form-error']}>{errors.family_last_name.message as string}</div>}
        </div>
        {/* Pronouns */}
        <div className={styles['form-field']}>
          <select
            className={styles['form-select']}
            {...form.register('family_pronouns')}
            id="family_pronouns"
            defaultValue=""
            onFocus={() => { handleFocus('family_pronouns'); setPronounsOpen(true); }}
            onBlur={() => { handleBlur('family_pronouns'); setPronounsOpen(false); }}
          >
            <option value="" disabled hidden></option>
            {pronounOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <label
            htmlFor="family_pronouns"
            className={
              styles['form-floating-label'] +
              ((focus.family_pronouns || values.family_pronouns) ? ' ' + styles['form-label--active'] : '')
            }
            style={{ left: 0, color: pronounsOpen ? '#00bcd4' : undefined, right: 0, maxWidth: 'calc(100% - 36px)' }}
          >
            Pronouns
          </label>
          <span
            className={styles['form-select-arrow']}
            style={{ color: pronounsOpen ? '#00bcd4' : '#757575' }}
          >
            ▼
          </span>
          {errors.family_pronouns && <div className={styles['form-error']}>{errors.family_pronouns.message as string}</div>}
        </div>
        {/* Middle Name */}
        <div className={styles['form-field']}>
          <input
            className={styles['form-input']}
            {...form.register('family_middle_name')}
            id="family_middle_name"
            autoComplete="off"
            onFocus={() => handleFocus('family_middle_name')}
            onBlur={() => handleBlur('family_middle_name')}
          />
          <label
            htmlFor="family_middle_name"
            className={
              styles['form-floating-label'] +
              ((focus.family_middle_name || values.family_middle_name) ? ' ' + styles['form-label--active'] : '')
            }
          >
            Middle Name
          </label>
          {errors.family_middle_name && <div className={styles['form-error']}>{errors.family_middle_name.message as string}</div>}
        </div>
        {/* Email */}
        <div className={styles['form-field']}>
          <input
            className={styles['form-input']}
            {...form.register('family_email')}
            id="family_email"
            autoComplete="off"
            onFocus={() => handleFocus('family_email')}
            onBlur={() => handleBlur('family_email')}
          />
          <label
            htmlFor="family_email"
            className={
              styles['form-floating-label'] +
              ((focus.family_email || values.family_email) ? ' ' + styles['form-label--active'] : '')
            }
          >
            Email
          </label>
          {errors.family_email && <div className={styles['form-error']}>{errors.family_email.message as string}</div>}
        </div>
        {/* Mobile phone */}
        <div className={styles['form-field']}>
          <input
            className={styles['form-input']}
            {...form.register('family_mobile_phone')}
            id="family_mobile_phone"
            autoComplete="off"
            onFocus={() => handleFocus('family_mobile_phone')}
            onBlur={() => handleBlur('family_mobile_phone')}
          />
          <label
            htmlFor="family_mobile_phone"
            className={
              styles['form-floating-label'] +
              ((focus.family_mobile_phone || values.family_mobile_phone) ? ' ' + styles['form-label--active'] : '')
            }
          >
            Mobile phone
          </label>
          {errors.family_mobile_phone && <div className={styles['form-error']}>{errors.family_mobile_phone.message as string}</div>}
        </div>
        {/* Workphone */}
        <div className={styles['form-field']}>
          <input
            className={styles['form-input']}
            {...form.register('family_work_phone')}
            id="family_work_phone"
            autoComplete="off"
            onFocus={() => handleFocus('family_work_phone')}
            onBlur={() => handleBlur('family_work_phone')}
          />
          <label
            htmlFor="family_work_phone"
            className={
              styles['form-floating-label'] +
              ((focus.family_work_phone || values.family_work_phone) ? ' ' + styles['form-label--active'] : '')
            }
          >
            Workphone
          </label>
          {errors.family_work_phone && <div className={styles['form-error']}>{errors.family_work_phone.message as string}</div>}
        </div>
      </div>
      <div className={styles['step-buttons-row']}>
        <Button type="button" onClick={handleBack} disabled={step === 0}>Back</Button>
        <Button type="submit" onClick={() => handleNextStep()} disabled={!isStepValid || form.formState.isSubmitting}>{step === totalSteps - 1 ? 'Submit' : 'Next'}</Button>
      </div>
    </div>
  );
}

export function Step4Referral({ form, control, handleBack, handleNextStep, step, totalSteps }: any) {
  const values = form.getValues();
  const errors = form.formState.errors;
  const [focus, setFocus] = useState({
    referral_source: false,
    referral_name: false,
    referral_email: false,
  });
  const [referralOpen, setReferralOpen] = useState(false);

  const handleFocus = (field: keyof typeof focus) => setFocus(f => ({ ...f, [field]: true }));
  const handleBlur = (field: keyof typeof focus) => setFocus(f => ({ ...f, [field]: false }));

  const isStepValid = [
    'referral_source'
  ].every(field => !errors[field]);

  // Debug logs
  console.log('Step4Referral values:', values);
  console.log('Step4Referral errors:', errors);
  console.log('Step4Referral isStepValid:', isStepValid);

  return (
    <div>
      <div className={styles['form-section-title']}>Referral</div>
      <div className={styles['form-grid']}>
        {/* Referral Source */}
        <div className={styles['form-field']}>
          <select
            className={
              styles['form-select'] +
              (errors.referral_source ? ' ' + styles['form-label--error'] : '')
            }
            {...form.register('referral_source')}
            id="referral_source"
            defaultValue=""
            onFocus={() => { handleFocus('referral_source'); setReferralOpen(true); }}
            onBlur={() => { handleBlur('referral_source'); setReferralOpen(false); }}
          >
            <option value="" disabled hidden></option>
            {referralOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <label
            htmlFor="referral_source"
            className={
              styles['form-floating-label'] +
              ((focus.referral_source || values.referral_source) ? ' ' + styles['form-label--active'] : '') +
              (errors.referral_source ? ' ' + styles['form-label--error'] : '')
            }
            style={{ left: 0, right: 0, maxWidth: 'calc(100% - 36px)' }}
          >
            Referral source*
          </label>
          <span
            className={styles['form-select-arrow']}
            style={{ color: errors.referral_source ? '#d32f2f' : (referralOpen ? '#00bcd4' : '#757575') }}
          >
            ▼
          </span>
          {errors.referral_source && <div className={styles['form-error']}>{errors.referral_source.message as string || 'Required.'}</div>}
        </div>
        {/* Referral Name */}
        <div className={styles['form-field']}>
          <input
            className={
              styles['form-input'] +
              (errors.referral_name ? ' ' + styles['form-label--error'] : '')
            }
            {...form.register('referral_name')}
            id="referral_name"
            autoComplete="off"
            onFocus={() => handleFocus('referral_name')}
            onBlur={() => handleBlur('referral_name')}
          />
          <label
            htmlFor="referral_name"
            className={
              styles['form-floating-label'] +
              ((focus.referral_name || values.referral_name) ? ' ' + styles['form-label--active'] : '') +
              (errors.referral_name ? ' ' + styles['form-label--error'] : '')
            }
          >
            Full name/ agency
          </label>
          {errors.referral_name && <div className={styles['form-error']}>{errors.referral_name.message as string}</div>}
        </div>
        {/* Referral Email (optional) */}
        <div className={styles['form-field']}>
          <input
            className={
              styles['form-input'] +
              (errors.referral_email ? ' ' + styles['form-label--error'] : '')
            }
            {...form.register('referral_email')}
            id="referral_email"
            autoComplete="off"
            onFocus={() => handleFocus('referral_email')}
            onBlur={() => handleBlur('referral_email')}
          />
          <label
            htmlFor="referral_email"
            className={
              styles['form-floating-label'] +
              ((focus.referral_email || values.referral_email) ? ' ' + styles['form-label--active'] : '') +
              (errors.referral_email ? ' ' + styles['form-label--error'] : '')
            }
          >
            Email
          </label>
          {errors.referral_email && <div className={styles['form-error']}>{errors.referral_email.message as string}</div>}
        </div>
      </div>
      <div className={styles['step-buttons-row']}>
        <Button type="button" onClick={handleBack} disabled={step === 0}>Back</Button>
        <Button type="submit" onClick={() => handleNextStep()} disabled={!isStepValid || form.formState.isSubmitting}>{step === totalSteps - 1 ? 'Submit' : 'Next'}</Button>
      </div>
    </div>
  );
}

export function Step5HealthHistory({ form, control, handleBack, handleNextStep, step, totalSteps }: any) {
  const values = form.getValues();
  const errors = form.formState.errors;
  const [focus, setFocus] = useState({
    health_history: false,
    allergies: false,
    health_notes: false,
  });

  const handleFocus = (field: keyof typeof focus) => setFocus(f => ({ ...f, [field]: true }));
  const handleBlur = (field: keyof typeof focus) => setFocus(f => ({ ...f, [field]: false }));

  const isStepValid = [
    'allergies', 'health_notes'
  ].every(field => !errors[field]);

  // Debug logs
  console.log('Step5HealthHistory values:', values);
  console.log('Step5HealthHistory errors:', errors);
  console.log('Step5HealthHistory isStepValid:', isStepValid);

  return (
    <div>
      <div className={styles['form-section-title']}>Health history</div>
      <div className={styles['form-grid']}>
        {/* Health History */}
        <div className={styles['form-field']} style={{ gridColumn: '1 / span 4' }}>
          <input
            className={styles['form-input'] + (errors.health_history ? ' ' + styles['form-label--error'] : '')}
            {...form.register('health_history')}
            id="health_history"
            autoComplete="off"
            onFocus={() => handleFocus('health_history')}
            onBlur={() => handleBlur('health_history')}
          />
          <label
            htmlFor="health_history"
            className={
              styles['form-floating-label'] +
              ((focus.health_history || values.health_history) ? ' ' + styles['form-label--active'] : '') +
              (errors.health_history ? ' ' + styles['form-label--error'] : '')
            }
          >
            Health History
          </label>
          {errors.health_history && <div className={styles['form-error']}>{errors.health_history.message as string}</div>}
        </div>
        {/* Allergies */}
        <div className={styles['form-field']} style={{ gridColumn: '1 / span 4' }}>
          <input
            className={styles['form-input'] + (errors.allergies ? ' ' + styles['form-label--error'] : '')}
            {...form.register('allergies')}
            id="allergies"
            autoComplete="off"
            onFocus={() => handleFocus('allergies')}
            onBlur={() => handleBlur('allergies')}
          />
          <label
            htmlFor="allergies"
            className={
              styles['form-floating-label'] +
              ((focus.allergies || values.allergies) ? ' ' + styles['form-label--active'] : '') +
              (errors.allergies ? ' ' + styles['form-label--error'] : '')
            }
          >
            Allergies
          </label>
          {errors.allergies && <div className={styles['form-error']}>{errors.allergies.message as string || 'Required.'}</div>}
        </div>
        {/* Other Health Notes */}
        <div className={styles['form-field']} style={{ gridColumn: '1 / span 4' }}>
          <input
            className={styles['form-input'] + (errors.health_notes ? ' ' + styles['form-label--error'] : '')}
            {...form.register('health_notes')}
            id="health_notes"
            autoComplete="off"
            onFocus={() => handleFocus('health_notes')}
            onBlur={() => handleBlur('health_notes')}
          />
          <label
            htmlFor="health_notes"
            className={
              styles['form-floating-label'] +
              ((focus.health_notes || values.health_notes) ? ' ' + styles['form-label--active'] : '') +
              (errors.health_notes ? ' ' + styles['form-label--error'] : '')
            }
          >
            Other Health Notes
          </label>
          {errors.health_notes && <div className={styles['form-error']}>{errors.health_notes.message as string || 'Required.'}</div>}
        </div>
      </div>
      <div className={styles['step-buttons-row']}>
        <Button type="button" onClick={handleBack} disabled={step === 0}>Back</Button>
        <Button type="submit" onClick={() => handleNextStep()} disabled={!isStepValid || form.formState.isSubmitting}>{step === totalSteps - 1 ? 'Submit' : 'Next'}</Button>
      </div>
    </div>
  );
}

export function Step6PregnancyBaby({ form, control, handleBack, handleNextStep, step, totalSteps }: any) {
  const values = form.getValues();
  const errors = form.formState.errors;
  const [focus, setFocus] = useState({
    due_date: false,
    birth_location: false,
    birth_hospital: false,
    number_of_babies: false,
    baby_name: false,
    provider_type: false,
    pregnancy_number: false,
  });
  const [birthLocationOpen, setBirthLocationOpen] = useState(false);
  const [numBabiesOpen, setNumBabiesOpen] = useState(false);
  const [providerTypeOpen, setProviderTypeOpen] = useState(false);

  const handleFocus = (field: keyof typeof focus) => setFocus(f => ({ ...f, [field]: true }));
  const handleBlur = (field: keyof typeof focus) => setFocus(f => ({ ...f, [field]: false }));

  const birthLocationOptions = [
    'Hospital',
    'Home',
    'Birth Center',
    'Other',
  ];
  const numberOfBabiesOptions = [
    'Singleton',
    'Twins',
    'Triplets',
    'Quadruplets',
    'Quintuplets',
    'Sextuplets',
    'Septuplets',
    'Octuplets',
  ];
  const providerTypeOptions = [
    'Midwife',
    'OB',
    'Family Doctor',
    'Other',
  ];

  const isStepValid = [
    'due_date', 'birth_location', 'birth_hospital', 'number_of_babies', 'provider_type', 'pregnancy_number'
  ].every(field => !errors[field]);

  // Debug logs
  console.log('Step6PregnancyBaby values:', values);
  console.log('Step6PregnancyBaby errors:', errors);
  console.log('Step6PregnancyBaby isStepValid:', isStepValid);

  return (
    <div>
      <div className={styles['form-section-title']}>Pregnancy/Baby</div>
      <div className={styles['form-grid']}>
        {/* Due Date */}
        <div className={styles['form-field']}>
          <input
            className={styles['form-input']}
            type="date"
            {...form.register('due_date')}
            id="due_date"
            onFocus={() => handleFocus('due_date')}
            onBlur={() => handleBlur('due_date')}
          />
          <label
            htmlFor="due_date"
            className={
              styles['form-floating-label'] +
              ((focus.due_date || values.due_date) ? ' ' + styles['form-label--active'] : '')
            }
          >
            Due Date or Date of Birth*
          </label>
          {errors.due_date && <div className={styles['form-error']}>{errors.due_date.message as string}</div>}
        </div>
        {/* Birth Location */}
        <div className={styles['form-field']}>
          <select
            className={styles['form-select']}
            {...form.register('birth_location')}
            id="birth_location"
            defaultValue=""
            onFocus={() => { handleFocus('birth_location'); setBirthLocationOpen(true); }}
            onBlur={() => { handleBlur('birth_location'); setBirthLocationOpen(false); }}
          >
            <option value="" disabled hidden></option>
            {birthLocationOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <label
            htmlFor="birth_location"
            className={
              styles['form-floating-label'] +
              ((focus.birth_location || values.birth_location) ? ' ' + styles['form-label--active'] : '')
            }
            style={{ left: 0, color: birthLocationOpen ? '#00bcd4' : undefined, right: 0, maxWidth: 'calc(100% - 36px)' }}
          >
            Birth location*
          </label>
          <span
            className={styles['form-select-arrow']}
            style={{ color: birthLocationOpen ? '#00bcd4' : '#757575' }}
          >
            ▼
          </span>
          {errors.birth_location && <div className={styles['form-error']}>{errors.birth_location.message as string}</div>}
        </div>
        {/* Hospital or Birth Center */}
        <div className={styles['form-field']}>
          <input
            className={styles['form-input']}
            {...form.register('birth_hospital')}
            id="birth_hospital"
            autoComplete="off"
            onFocus={() => handleFocus('birth_hospital')}
            onBlur={() => handleBlur('birth_hospital')}
          />
          <label
            htmlFor="birth_hospital"
            className={
              styles['form-floating-label'] +
              ((focus.birth_hospital || values.birth_hospital) ? ' ' + styles['form-label--active'] : '')
            }
          >
            Name of hospital or birth center*
          </label>
          {errors.birth_hospital && <div className={styles['form-error']}>{errors.birth_hospital.message as string}</div>}
        </div>
        {/* Baby's Name */}
        <div className={styles['form-field']}>
          <input
            className={styles['form-input']}
            {...form.register('baby_name')}
            id="baby_name"
            autoComplete="off"
            onFocus={() => handleFocus('baby_name')}
            onBlur={() => handleBlur('baby_name')}
          />
          <label
            htmlFor="baby_name"
            className={
              styles['form-floating-label'] +
              ((focus.baby_name || values.baby_name) ? ' ' + styles['form-label--active'] : '')
            }
          >
            Baby's name
          </label>
          {errors.baby_name && <div className={styles['form-error']}>{errors.baby_name.message as string}</div>}
        </div>
        {/* Number of Babies */}
        <div className={styles['form-field']}>
          <select
            className={styles['form-select']}
            {...form.register('number_of_babies')}
            id="number_of_babies"
            defaultValue=""
            onFocus={() => { handleFocus('number_of_babies'); setNumBabiesOpen(true); }}
            onBlur={() => { handleBlur('number_of_babies'); setNumBabiesOpen(false); }}
          >
            <option value="" disabled hidden></option>
            {numberOfBabiesOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <label
            htmlFor="number_of_babies"
            className={
              styles['form-floating-label'] +
              ((focus.number_of_babies || values.number_of_babies) ? ' ' + styles['form-label--active'] : '')
            }
            style={{ left: 0, color: numBabiesOpen ? '#00bcd4' : undefined, right: 0, maxWidth: 'calc(100% - 36px)' }}
          >
            Number of babies*
          </label>
          <span
            className={styles['form-select-arrow']}
            style={{ color: numBabiesOpen ? '#00bcd4' : '#757575' }}
          >
            ▼
          </span>
          {errors.number_of_babies && <div className={styles['form-error']}>{errors.number_of_babies.message as string}</div>}
        </div>
        {/* Provider Type */}
        <div className={styles['form-field']}>
          <select
            className={styles['form-select']}
            {...form.register('provider_type')}
            id="provider_type"
            defaultValue=""
            onFocus={() => { handleFocus('provider_type'); setProviderTypeOpen(true); }}
            onBlur={() => { handleBlur('provider_type'); setProviderTypeOpen(false); }}
          >
            <option value="" disabled hidden></option>
            {providerTypeOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <label
            htmlFor="provider_type"
            className={
              styles['form-floating-label'] +
              ((focus.provider_type || values.provider_type) ? ' ' + styles['form-label--active'] : '')
            }
            style={{ left: 0, color: providerTypeOpen ? '#00bcd4' : undefined, right: 0, maxWidth: 'calc(100% - 36px)' }}
          >
            Provider Type
          </label>
          <span
            className={styles['form-select-arrow']}
            style={{ color: providerTypeOpen ? '#00bcd4' : '#757575' }}
          >
            ▼
          </span>
          {errors.provider_type && <div className={styles['form-error']}>{errors.provider_type.message as string}</div>}
        </div>
        {/* Pregnancy Number */}
        <div className={styles['form-field']}>
          <input
            className={styles['form-input']}
            {...form.register('pregnancy_number')}
            id="pregnancy_number"
            autoComplete="off"
            onFocus={() => handleFocus('pregnancy_number')}
            onBlur={() => handleBlur('pregnancy_number')}
          />
          <label
            htmlFor="pregnancy_number"
            className={
              styles['form-floating-label'] +
              ((focus.pregnancy_number || values.pregnancy_number) ? ' ' + styles['form-label--active'] : '')
            }
          >
            What # pregnancy/baby is this?*
          </label>
          {errors.pregnancy_number && <div className={styles['form-error']}>{errors.pregnancy_number.message as string}</div>}
        </div>
      </div>
      <div className={styles['step-buttons-row']}>
        <Button type="button" onClick={handleBack} disabled={step === 0}>Back</Button>
        <Button type="submit" onClick={() => handleNextStep()} disabled={!isStepValid || form.formState.isSubmitting}>{step === totalSteps - 1 ? 'Submit' : 'Next'}</Button>
      </div>
    </div>
  );
}

export function Step7PastPregnancies({ form, control, handleBack, handleNextStep, step, totalSteps }: any) {
  const values = form.getValues();
  const errors = form.formState.errors;
  const hadPrevious = useWatch({ control, name: 'had_previous_pregnancies' });
  const [focus, setFocus] = useState({
    previous_pregnancies_count: false,
    living_children_count: false,
    past_pregnancy_experience: false,
  });
  const handleFocus = (field: keyof typeof focus) => setFocus(f => ({ ...f, [field]: true }));
  const handleBlur = (field: keyof typeof focus) => setFocus(f => ({ ...f, [field]: false }));

  return (
    <div>
      <div className={styles['form-section-title']}>Past Pregnancie(s)</div>
      <div className={styles['form-grid']} style={{ alignItems: 'center' }}>
        <div className={styles['form-field']} style={{ gridColumn: '1 / span 4', display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            type="checkbox"
            id="had_previous_pregnancies"
            {...form.register('had_previous_pregnancies')}
            style={{ width: 24, height: 24, accentColor: hadPrevious ? '#00bcd4' : undefined }}
          />
          <label htmlFor="had_previous_pregnancies" style={{ fontSize: 20, color: '#444', marginLeft: 8 }}>
            Had previous pregnancie(s)
          </label>
        </div>
        {hadPrevious && (
          <>
            <div className={styles['form-field']}>
              <input
                className={styles['form-input']}
                type="number"
                min="0"
                {...form.register('previous_pregnancies_count')}
                id="previous_pregnancies_count"
                onFocus={() => handleFocus('previous_pregnancies_count')}
                onBlur={() => handleBlur('previous_pregnancies_count')}
              />
              <label
                htmlFor="previous_pregnancies_count"
                className={
                  styles['form-floating-label'] +
                  ((focus.previous_pregnancies_count || values.previous_pregnancies_count) ? ' ' + styles['form-label--active'] : '')
                }
              >
                # of previous pregnancies
              </label>
              {errors.previous_pregnancies_count && <div className={styles['form-error']}>{errors.previous_pregnancies_count.message as string}</div>}
            </div>
            <div className={styles['form-field']}>
              <input
                className={styles['form-input']}
                type="number"
                min="0"
                {...form.register('living_children_count')}
                id="living_children_count"
                onFocus={() => handleFocus('living_children_count')}
                onBlur={() => handleBlur('living_children_count')}
              />
              <label
                htmlFor="living_children_count"
                className={
                  styles['form-floating-label'] +
                  ((focus.living_children_count || values.living_children_count) ? ' ' + styles['form-label--active'] : '')
                }
              >
                # of living children
              </label>
              {errors.living_children_count && <div className={styles['form-error']}>{errors.living_children_count.message as string}</div>}
            </div>
            <div className={styles['form-field']} style={{ gridColumn: '1 / span 4' }}>
              <textarea
                className={styles['form-input']}
                style={{ minHeight: 40 }}
                {...form.register('past_pregnancy_experience')}
                id="past_pregnancy_experience"
                onFocus={() => handleFocus('past_pregnancy_experience')}
                onBlur={() => handleBlur('past_pregnancy_experience')}
              />
              <label
                htmlFor="past_pregnancy_experience"
                className={
                  styles['form-floating-label'] +
                  ((focus.past_pregnancy_experience || values.past_pregnancy_experience) ? ' ' + styles['form-label--active'] : '')
                }
              >
                Past pregnancy experience(s)
              </label>
              {errors.past_pregnancy_experience && <div className={styles['form-error']}>{errors.past_pregnancy_experience.message as string}</div>}
            </div>
          </>
        )}
      </div>
      <div className={styles['step-buttons-row']}>
        <Button type="button" onClick={handleBack} disabled={step === 0}>Back</Button>
        <Button type="submit" onClick={() => handleNextStep()} disabled={form.formState.isSubmitting}>{step === totalSteps - 1 ? 'Submit' : 'Next'}</Button>
      </div>
    </div>
  );
}

export function Step8ServicesInterested({ form, control, handleBack, handleNextStep, step, totalSteps }: any) {
  const values = form.getValues();
  const errors = form.formState.errors;
  const [focus, setFocus] = useState({
    services_interested: false,
    service_support_details: false,
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const handleFocus = (field: keyof typeof focus) => setFocus(f => ({ ...f, [field]: true }));
  const handleBlur = (field: keyof typeof focus) => setFocus(f => ({ ...f, [field]: false }));

  const serviceOptions = [
    'Labor Support',
    'Postpartum Support',
    '1st Night Care',
    'Lactation Support',
    'Perinatal Education',
    'Abortion Support',
    'Other',
  ];

  // Multi-select dropdown logic
  const selected = values.services_interested || [];
  const toggleService = (service: string) => {
    if (selected.includes(service)) {
      form.setValue('services_interested', selected.filter((s: string) => s !== service), { shouldValidate: true });
    } else {
      form.setValue('services_interested', [...selected, service], { shouldValidate: true });
    }
  };

  return (
    <div>
      <div className={styles['form-section-title']}>What service(s) are you interested in?</div>
      <div className={styles['form-grid']} style={{ alignItems: 'flex-start' }}>
        {/* Multi-select dropdown */}
        <div className={styles['form-field']} style={{ gridColumn: '1 / span 4' }}>
          <label className={styles['form-floating-label'] + ' ' + styles['form-label--active']} style={{ color: errors.services_interested ? '#d32f2f' : undefined }}>
            Select all that apply*
          </label>
          <Popover open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={styles['form-input']}
                style={{ textAlign: 'left', minHeight: 40, cursor: 'pointer', background: '#fff' }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {selected.length > 0 ? selected.join(', ') : 'Select'}
                <span style={{ float: 'right', pointerEvents: 'none' }}>▼</span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" side="bottom" sideOffset={4} style={{ minWidth: 600, maxWidth: 700, background: '#fff', border: '1px solid #bdbdbd', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 0, zIndex: 10 }}>
              {serviceOptions.map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', fontSize: 17, cursor: 'pointer', gap: 8, padding: '4px 0' }}>
                  <input
                    type="checkbox"
                    checked={selected.includes(opt)}
                    onChange={() => toggleService(opt)}
                    style={{ width: 20, height: 20, accentColor: selected.includes(opt) ? '#d32f2f' : '#bdbdbd' }}
                  />
                  {opt}
                </label>
              ))}
            </PopoverContent>
          </Popover>
          {errors.services_interested && <div className={styles['form-error']}>{errors.services_interested.message as string}</div>}
        </div>
        {/* Support details textarea */}
        <div className={styles['form-field']} style={{ gridColumn: '1 / span 4' }}>
          <textarea
            className={styles['form-input']}
            {...form.register('service_support_details')}
            id="service_support_details"
            onFocus={() => handleFocus('service_support_details')}
            onBlur={() => handleBlur('service_support_details')}
            style={{ minHeight: 48 }}
          />
          <label
            htmlFor="service_support_details"
            className={
              styles['form-floating-label'] +
              ((focus.service_support_details || values.service_support_details) ? ' ' + styles['form-label--active'] : '')
            }
          >
            What does doula support look like for you? Be specific. How can a labor doula help? For postpartum do you want daytime, overnights and for how many weeks*
          </label>
          {errors.service_support_details && <div className={styles['form-error']}>{errors.service_support_details.message as string}</div>}
        </div>
      </div>
      <div className={styles['step-buttons-row']}>
        <Button type="button" onClick={handleBack} disabled={step === 0}>Back</Button>
        <Button type="submit" onClick={() => handleNextStep()} disabled={form.formState.isSubmitting}>{step === totalSteps - 1 ? 'Submit' : 'Next'}</Button>
      </div>
    </div>
  );
}

export function Step9Payment({ form, control, handleBack, handleNextStep, step, totalSteps }: any) {
  const values = form.getValues();
  const errors = form.formState.errors;
  const [focus, setFocus] = useState({ payment_method: false });
  const [open, setOpen] = useState({ payment_method: false });
  const handleFocus = (field: keyof typeof focus) => setFocus(f => ({ ...f, [field]: true }));
  const handleBlur = (field: keyof typeof focus) => setFocus(f => ({ ...f, [field]: false }));

  const paymentMethodOptions = [
    'Credit Card',
    'Debit Card',
    'Bank Transfer',
    'Cash',
    'Check',
    'Other',
  ];

  return (
    <div>
      <div className={styles['form-section-title']}>Payment</div>
      <div style={{ color: '#666', fontSize: '1.15rem', marginBottom: '2.5rem', maxWidth: 900 }}>
        At Sokana Collective we believe that price should not be a barrier for our services. We have our full fee prices listed under each service section on our website and we would like that to be paid by those who can afford it. For those who are unable to pay the full fee we have the following sliding scale: <a href="https://www.sokanacollective.com/services" target="_blank" rel="noopener noreferrer">https://www.sokanacollective.com/services</a> (copy and paste link in browser) Check all that apply based on the services you are interested in.
      </div>
      <div className={styles['form-grid']}>
        {/* Payment Method Dropdown */}
        <div className={styles['form-field']} style={{ gridColumn: '1 / span 4', position: 'relative' }}>
          {/* Error message above input, centered */}
          {errors.payment_method && (
            <div style={{ color: '#d32f2f', textAlign: 'center', marginBottom: 8, fontWeight: 500, fontSize: 16 }}>
              {errors.payment_method.message === 'Required.' || errors.payment_method.message === 'Required' ? 'Please select your payment method.' : errors.payment_method.message}
            </div>
          )}
          <label
            htmlFor="payment_method"
            className={
              styles['form-floating-label'] +
              ((focus.payment_method || values.payment_method) ? ' ' + styles['form-label--active'] : '') +
              (errors.payment_method ? ' ' + styles['form-label--error'] : '')
            }
            style={{ color: errors.payment_method ? '#d32f2f' : undefined }}
          >
            Payment Method*
          </label>
          <Popover open={open.payment_method} onOpenChange={v => setOpen(o => ({ ...o, payment_method: v }))}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={styles['form-input']}
                style={{
                  textAlign: 'left',
                  minHeight: 40,
                  cursor: 'pointer',
                  background: '#fff',
                  borderBottom: `2px solid ${errors.payment_method ? '#d32f2f' : '#00bcd4'}`,
                  width: '100%',
                  fontSize: 18,
                  color: '#222',
                  borderRadius: 0,
                  boxShadow: 'none',
                  outline: 'none',
                  margin: 0,
                  padding: '12px 40px 12px 8px',
                  position: 'relative',
                }}
                onClick={() => setOpen(o => ({ ...o, payment_method: !o.payment_method }))}
                onFocus={() => setFocus(f => ({ ...f, payment_method: true }))}
                onBlur={() => setFocus(f => ({ ...f, payment_method: false }))}
                aria-invalid={!!errors.payment_method}
                id="payment_method"
              >
                {values.payment_method || 'Select Payment Method'}
                <span style={{ float: 'right', pointerEvents: 'none', position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>▼</span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" side="bottom" sideOffset={4} style={{ minWidth: 300, maxWidth: 400, background: '#fff', border: '1px solid #bdbdbd', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 0, zIndex: 10 }}>
              {paymentMethodOptions.map(opt => (
                <div
                  key={opt}
                  style={{
                    padding: '14px 18px',
                    fontSize: 17,
                    cursor: 'pointer',
                    background: values.payment_method === opt ? '#f5f5f5' : '#fff',
                    color: '#222',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    lineHeight: 1.5,
                  }}
                  onClick={() => {
                    form.setValue('payment_method', opt);
                    setOpen(o => ({ ...o, payment_method: false }));
                  }}
                >
                  {opt}
                </div>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className={styles['step-buttons-row']}>
        <Button type="button" onClick={handleBack} disabled={step === 0}>Back</Button>
        <Button type="submit" onClick={() => handleNextStep()} disabled={form.formState.isSubmitting}>{step === totalSteps - 1 ? 'Submit' : 'Next'}</Button>
      </div>
    </div>
  );
}

export function Step10ClientDemographics({ form, control, handleBack, handleNextStep, step, totalSteps }: any) {
  const values = form.getValues();
  const errors = form.formState.errors;
  const [focus, setFocus] = useState({
    race_ethnicity: false,
    primary_language: false,
    client_age_range: false,
    insurance: false,
    demographics_multi: false,
    demographics_annual_income: false,
  });

  const handleFocus = (field: keyof typeof focus) => setFocus(f => ({ ...f, [field]: true }));
  const handleBlur = (field: keyof typeof focus) => setFocus(f => ({ ...f, [field]: false }));

  // Dropdown options
  const raceOptions = [
    'African American/Black',
    'Asian/Pacific Islander',
    'Caucasian/White',
    'Hispanic',
    'Two or more races',
    'Other',
  ];
  const languageOptions = [
    'English',
    'Spanish',
    'French',
    'Mandarin',
    'Arabic',
    'Other',
  ];
  const ageOptions = [
    'Under 20',
    '20-25',
    '26-35',
    '36 and older',
  ];
  const insuranceOptions = [
    'Private',
    'Public Aid',
    "Currently don't have medical insurance",
  ];
  const demographicsMultiOptions = [
    'Annual income is less than $30,000',
    'Identify as a person of color',
    'Identify as LGBTQ+',
    'Disabled',
    'Survivor of violence',
    'Experienced pregnancy or birth trauma',
    'Experienced postpartum depression, anxiety/psychosis/mood disorder',
    'Referred from a social service agency',
    'Refugee or religious minority',
    'Active Military or Veteran Status',
    'None apply',
    'Other:',
  ];
  const incomeOptions = [
    '$0 - $25,000',
    '$25,001 - $44,999',
    '$45,000 - $64,999',
    '$65,000 - $84,999',
    '$85,000 - $99,999',
    '$100,000 and above',
  ];

  // Multi-select logic
  const selectedMulti = values.demographics_multi || [];

  // Helper for user-friendly error messages
  const getUserError = (err: any, fallback: string) => {
    if (!err) return null;
    if (err.message === 'Required.' || err.message === 'Required') return fallback;
    return err.message;
  };

  // Validation for required fields
  const isStepValid = [
    'race_ethnicity', 'primary_language', 'client_age_range'
  ].every(field => !errors[field]);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.demographics-multi-container')) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleMultiSelect = (opt: string) => {
    if (opt === 'None apply') {
      form.setValue('demographics_multi', ['None apply']);
      setDropdownOpen(false);
    } else {
      let updated = selectedMulti.filter((v: string) => v !== 'None apply');
      if (selectedMulti.includes(opt)) {
        updated = updated.filter((v: string) => v !== opt);
      } else {
        updated = [...updated, opt];
      }
      form.setValue('demographics_multi', updated);
      setDropdownOpen(false); // Close dropdown after any selection
    }
  };

  return (
    <div>
      <div className={styles['form-section-title']}>Client Demographics</div>
      <div style={{ color: '#757575', fontSize: '1.25rem', marginBottom: '2.5rem', maxWidth: 1200 }}>
        This section should be answered for the pregnant/primary parent only and is <b>OPTIONAL</b> (but we greatly appreciate it if you complete it.) We use this information for data collection to use for grant writing. The information collected is not connected to your name or personal information and your answers do not affect your matching or care with Sokana Collective
      </div>
      <div className={styles['form-grid']} style={{ alignItems: 'flex-start' }}>
        {/* Race/Ethnicity/Nationality */}
        <div className={styles['form-field']} style={{ gridColumn: '1 / span 2', position: 'relative' }}>
          <select
            className={styles['form-select']}
            {...form.register('race_ethnicity')}
            id="race_ethnicity"
            defaultValue=""
            onFocus={() => handleFocus('race_ethnicity')}
            onBlur={() => handleBlur('race_ethnicity')}
          >
            <option value="" disabled hidden></option>
            {raceOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <label
            htmlFor="race_ethnicity"
            className={
              styles['form-floating-label'] +
              ((focus.race_ethnicity || values.race_ethnicity) ? ' ' + styles['form-label--active'] : '')
            }
          >
            Race/ethnicity/nationality?
          </label>
          <span className={styles['form-select-arrow']}>▼</span>
          {errors.race_ethnicity && <div className={styles['form-error']}>{getUserError(errors.race_ethnicity, 'Please select your race/ethnicity/nationality.')}</div>}
        </div>
        {/* Primary Language */}
        <div className={styles['form-field']} style={{ gridColumn: '3 / span 2', position: 'relative' }}>
          <select
            className={styles['form-select']}
            {...form.register('primary_language')}
            id="primary_language"
            defaultValue=""
            onFocus={() => handleFocus('primary_language')}
            onBlur={() => handleBlur('primary_language')}
          >
            <option value="" disabled hidden></option>
            {languageOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <label
            htmlFor="primary_language"
            className={
              styles['form-floating-label'] +
              ((focus.primary_language || values.primary_language) ? ' ' + styles['form-label--active'] : '')
            }
          >
            Primary Language
          </label>
          <span className={styles['form-select-arrow']}>▼</span>
          {errors.primary_language && <div className={styles['form-error']}>{getUserError(errors.primary_language, 'Please select your primary language.')}</div>}
        </div>
        {/* Client Age Range */}
        <div className={styles['form-field']} style={{ gridColumn: '1 / span 2', position: 'relative' }}>
          <select
            className={styles['form-select']}
            {...form.register('client_age_range')}
            id="client_age_range"
            defaultValue=""
            onFocus={() => handleFocus('client_age_range')}
            onBlur={() => handleBlur('client_age_range')}
          >
            <option value="" disabled hidden></option>
            {ageOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <label
            htmlFor="client_age_range"
            className={
              styles['form-floating-label'] +
              ((focus.client_age_range || values.client_age_range) ? ' ' + styles['form-label--active'] : '')
            }
          >
            Client age range
          </label>
          <span className={styles['form-select-arrow']}>▼</span>
          {errors.client_age_range && <div className={styles['form-error']}>{getUserError(errors.client_age_range, 'Please select your age range.')}</div>}
        </div>
        {/* Medical Insurance Coverage */}
        <div className={styles['form-field']} style={{ gridColumn: '3 / span 2', position: 'relative' }}>
          <select
            className={styles['form-select']}
            {...form.register('insurance')}
            id="insurance"
            defaultValue=""
            onFocus={() => handleFocus('insurance')}
            onBlur={() => handleBlur('insurance')}
          >
            <option value="" disabled hidden></option>
            {insuranceOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <label
            htmlFor="insurance"
            className={
              styles['form-floating-label'] +
              ((focus.insurance || values.insurance) ? ' ' + styles['form-label--active'] : '')
            }
          >
            Medical Insurance Coverage
          </label>
          <span className={styles['form-select-arrow']}>▼</span>
          {errors.insurance && <div className={styles['form-error']}>{getUserError(errors.insurance, 'Please select your medical insurance coverage.')}</div>}
        </div>
        {/* Multi-select: Please select all that apply */}
        <div className={`${styles['form-field']} demographics-multi-container`} style={{
          gridColumn: '1 / span 2',
          position: 'relative',
          height: 'auto',
          minHeight: 56,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end'
        }}>
          <div
            className={styles['form-input']}
            style={{
              display: 'flex',
              alignItems: (selectedMulti.length === 0 ? 'center' : 'flex-start'),
              flexWrap: 'wrap',
              width: '100%',
              textAlign: 'left',
              background: '#fff',
              border: 'none',
              borderBottom: `2px solid ${errors.demographics_multi ? '#d32f2f' : '#bdbdbd'}`,
              borderRadius: 0,
              fontSize: 16,
              boxShadow: 'none',
              outline: 'none',
              padding: selectedMulti.length === 0 ? '16px 8px' : '22px 40px 6px 8px',
              color: '#222',
              minHeight: 48,
              lineHeight: 1.5,
              gap: 0,
              position: 'relative',
              height: 'auto',
              transition: 'border-color 0.18s cubic-bezier(.4,0,.2,1)',
              cursor: 'pointer',
            }}
            onFocus={() => handleFocus('demographics_multi')}
            onBlur={() => handleBlur('demographics_multi')}
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
            }}
          >
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              width: '100%',
              marginBottom: 6,
              minHeight: 48,
              maxHeight: 120,
              overflowY: selectedMulti.length > 2 ? 'auto' : 'visible',
              boxSizing: 'border-box',
            }}>
              {selectedMulti.map((opt: string) => (
                <span key={opt} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: '#e0e0e0',
                  borderRadius: 9999,
                  padding: '4px 12px',
                  marginRight: 8,
                  marginBottom: 8,
                  color: '#444',
                  fontSize: 14,
                  fontWeight: 500,
                  maxWidth: '100%',
                  minWidth: 0,
                  boxSizing: 'border-box',
                }}>
                  <span style={{
                    display: 'block',
                    maxWidth: 'calc(100% - 32px)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>{opt}</span>
                  <span
                    role="button"
                    aria-label={`Remove ${opt}`}
                    onClick={e => { e.stopPropagation(); handleMultiSelect(opt); }}
                    style={{
                      marginLeft: 8,
                      width: 20,
                      height: 20,
                      minWidth: 20,
                      minHeight: 20,
                      background: '#888',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      lineHeight: 1,
                      padding: 0,
                      userSelect: 'none',
                    }}
                  >
                    ×
                  </span>
                </span>
              ))}
            </div>
            <span
              style={{
                marginLeft: 'auto',
                marginRight: 0,
                pointerEvents: 'none',
                color: '#757575',
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                height: 24,
                width: 24,
              }}
            >
              <ArrowSVG color={focus.demographics_multi ? '#00bcd4' : (errors.demographics_multi ? '#d32f2f' : '#757575')} />
            </span>
          </div>
          <label
            className={
              styles['form-floating-label'] +
              ((focus.demographics_multi || selectedMulti.length > 0) ? ' ' + styles['form-label--active'] : '')
            }
          >
            Please select all that apply
          </label>
          <div
            id="demographics-dropdown"
            style={{
              position: 'absolute',
              bottom: '100%',
              left: 0,
              right: 0,
              background: '#fff',
              border: '1px solid #bdbdbd',
              borderRadius: 4,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              zIndex: 10,
              display: dropdownOpen ? 'block' : 'none',
              maxHeight: 300,
              overflowY: 'auto',
              marginBottom: 4,
            }}
          >
            {demographicsMultiOptions
              .filter(opt => !selectedMulti.includes(opt) || opt === 'None apply')
              .map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleMultiSelect(opt)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 16px',
                    margin: 0,
                    border: 'none',
                    background: selectedMulti.includes(opt) ? '#f5f5f5' : '#fff',
                    fontWeight: selectedMulti.includes(opt) ? 600 : 400,
                    color: selectedMulti.includes(opt) ? '#222' : '#444',
                    fontSize: 16,
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'background 0.15s, color 0.15s, font-weight 0.15s',
                  }}
                >
                  {opt}
                </button>
              ))}
          </div>
          {errors.demographics_multi && <div className={styles['form-error']}>{getUserError(errors.demographics_multi, 'Please select all that apply.')}</div>}
        </div>
        {/* Annual Household Income */}
        <div className={styles['form-field']} style={{
          gridColumn: '3 / span 2',
          position: 'relative',
          height: 'auto',
          minHeight: 56,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          marginTop: '2rem'
        }}>
          <select
            className={styles['form-select']}
            {...form.register('demographics_annual_income')}
            id="demographics_annual_income"
            defaultValue=""
            onFocus={() => handleFocus('demographics_annual_income')}
            onBlur={() => handleBlur('demographics_annual_income')}
          >
            <option value="" disabled hidden></option>
            {incomeOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <label
            htmlFor="demographics_annual_income"
            className={
              styles['form-floating-label'] +
              ((focus.demographics_annual_income || values.demographics_annual_income) ? ' ' + styles['form-label--active'] : '')
            }
          >
            Annual Household Income
          </label>
          <span
            className={styles['form-select-arrow']}
            style={{ color: focus.demographics_annual_income ? '#00bcd4' : '#757575' }}
          >
            ▼
          </span>
          {errors.demographics_annual_income && <div className={styles['form-error']}>{getUserError(errors.demographics_annual_income, 'Please select your annual household income.')}</div>}
        </div>
      </div>
      <div className={styles['step-buttons-row']}>
        <Button type="button" onClick={handleBack} disabled={step === 0}>Back</Button>
        <Button type="submit" onClick={() => handleNextStep()} disabled={!isStepValid || form.formState.isSubmitting}>{step === totalSteps - 1 ? 'Submit' : 'Next'}</Button>
      </div>
    </div>
  );
} 