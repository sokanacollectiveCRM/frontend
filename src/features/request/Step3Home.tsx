import { Button } from '@/common/components/ui/button';
import { useState } from 'react';
import styles from './RequestForm.module.scss';

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
    first_name: false,
    last_name: false,
    pronouns: false,
    middle_name: false,
    email: false,
    mobile_phone: false,
    work_phone: false,
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
            {...form.register('first_name')}
            id="first_name"
            autoComplete="off"
            onFocus={() => handleFocus('first_name')}
            onBlur={() => handleBlur('first_name')}
          />
          <label
            htmlFor="first_name"
            className={
              styles['form-floating-label'] +
              ((focus.first_name || values.first_name) ? ' ' + styles['form-label--active'] : '')
            }
          >
            First Name
          </label>
          {errors.first_name && <div className={styles['form-error']}>{errors.first_name.message as string}</div>}
        </div>
        {/* Last Name */}
        <div className={styles['form-field']}>
          <input
            className={styles['form-input']}
            {...form.register('last_name')}
            id="last_name"
            autoComplete="off"
            onFocus={() => handleFocus('last_name')}
            onBlur={() => handleBlur('last_name')}
          />
          <label
            htmlFor="last_name"
            className={
              styles['form-floating-label'] +
              ((focus.last_name || values.last_name) ? ' ' + styles['form-label--active'] : '')
            }
          >
            Last Name
          </label>
          {errors.last_name && <div className={styles['form-error']}>{errors.last_name.message as string}</div>}
        </div>
        {/* Pronouns */}
        <div className={styles['form-field']}>
          <select
            className={styles['form-select']}
            {...form.register('pronouns')}
            id="pronouns"
            defaultValue=""
            onFocus={() => { handleFocus('pronouns'); setPronounsOpen(true); }}
            onBlur={() => { handleBlur('pronouns'); setPronounsOpen(false); }}
          >
            <option value="" disabled hidden></option>
            {pronounOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <label
            htmlFor="pronouns"
            className={
              styles['form-floating-label'] +
              ((focus.pronouns || values.pronouns) ? ' ' + styles['form-label--active'] : '')
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
          {errors.pronouns && <div className={styles['form-error']}>{errors.pronouns.message as string}</div>}
        </div>
        {/* Middle Name */}
        <div className={styles['form-field']}>
          <input
            className={styles['form-input']}
            {...form.register('middle_name')}
            id="middle_name"
            autoComplete="off"
            onFocus={() => handleFocus('middle_name')}
            onBlur={() => handleBlur('middle_name')}
          />
          <label
            htmlFor="middle_name"
            className={
              styles['form-floating-label'] +
              ((focus.middle_name || values.middle_name) ? ' ' + styles['form-label--active'] : '')
            }
          >
            Middle Name
          </label>
          {errors.middle_name && <div className={styles['form-error']}>{errors.middle_name.message as string}</div>}
        </div>
        {/* Email */}
        <div className={styles['form-field']}>
          <input
            className={styles['form-input']}
            {...form.register('email')}
            id="email"
            autoComplete="off"
            onFocus={() => handleFocus('email')}
            onBlur={() => handleBlur('email')}
          />
          <label
            htmlFor="email"
            className={
              styles['form-floating-label'] +
              ((focus.email || values.email) ? ' ' + styles['form-label--active'] : '')
            }
          >
            Email
          </label>
          {errors.email && <div className={styles['form-error']}>{errors.email.message as string}</div>}
        </div>
        {/* Mobile phone */}
        <div className={styles['form-field']}>
          <input
            className={styles['form-input']}
            {...form.register('mobile_phone')}
            id="mobile_phone"
            autoComplete="off"
            onFocus={() => handleFocus('mobile_phone')}
            onBlur={() => handleBlur('mobile_phone')}
          />
          <label
            htmlFor="mobile_phone"
            className={
              styles['form-floating-label'] +
              ((focus.mobile_phone || values.mobile_phone) ? ' ' + styles['form-label--active'] : '')
            }
          >
            Mobile phone
          </label>
          {errors.mobile_phone && <div className={styles['form-error']}>{errors.mobile_phone.message as string}</div>}
        </div>
        {/* Workphone */}
        <div className={styles['form-field']}>
          <input
            className={styles['form-input']}
            {...form.register('work_phone')}
            id="work_phone"
            autoComplete="off"
            onFocus={() => handleFocus('work_phone')}
            onBlur={() => handleBlur('work_phone')}
          />
          <label
            htmlFor="work_phone"
            className={
              styles['form-floating-label'] +
              ((focus.work_phone || values.work_phone) ? ' ' + styles['form-label--active'] : '')
            }
          >
            Workphone
          </label>
          {errors.work_phone && <div className={styles['form-error']}>{errors.work_phone.message as string}</div>}
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
    'referral_source', 'referral_name', 'referral_email'
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
            Full name/ agency*
          </label>
          {errors.referral_name && <div className={styles['form-error']}>{errors.referral_name.message as string || 'Required.'}</div>}
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
    'health_history', 'allergies', 'health_notes'
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
          {errors.health_history && <div className={styles['form-error']}>{errors.health_history.message as string || 'Required.'}</div>}
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

export function Step7PastPregnancies({ handleBack, handleNextStep, step, totalSteps }: any) {
  return (
    <div>
      <div className={styles['form-section-title']}>Past Pregnancies (Placeholder)</div>
      <div className={styles['step-buttons-row']}>
        <Button type="button" onClick={handleBack} disabled={step === 0}>Back</Button>
        <Button type="submit" onClick={() => handleNextStep()}>{step === totalSteps - 1 ? 'Submit' : 'Next'}</Button>
      </div>
    </div>
  );
}

export function Step8ServicesInterested({ handleBack, handleNextStep, step, totalSteps }: any) {
  return (
    <div>
      <div className={styles['form-section-title']}>Services Interested In (Placeholder)</div>
      <div className={styles['step-buttons-row']}>
        <Button type="button" onClick={handleBack} disabled={step === 0}>Back</Button>
        <Button type="submit" onClick={() => handleNextStep()}>{step === totalSteps - 1 ? 'Submit' : 'Next'}</Button>
      </div>
    </div>
  );
}

export function Step9Payment({ handleBack, handleNextStep, step, totalSteps }: any) {
  return (
    <div>
      <div className={styles['form-section-title']}>Payment (Placeholder)</div>
      <div className={styles['step-buttons-row']}>
        <Button type="button" onClick={handleBack} disabled={step === 0}>Back</Button>
        <Button type="submit" onClick={() => handleNextStep()}>{step === totalSteps - 1 ? 'Submit' : 'Next'}</Button>
      </div>
    </div>
  );
}

export function Step10ClientDemographics({ handleBack, handleNextStep, step, totalSteps }: any) {
  return (
    <div>
      <div className={styles['form-section-title']}>Client Demographics (Placeholder)</div>
      <div className={styles['step-buttons-row']}>
        <Button type="button" onClick={handleBack} disabled={step === 0}>Back</Button>
        <Button type="submit" onClick={() => handleNextStep()}>{step === totalSteps - 1 ? 'Submit' : 'Next'}</Button>
      </div>
    </div>
  );
} 