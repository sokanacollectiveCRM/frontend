import { Button } from '@/common/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/common/components/ui/popover';
import { useEffect, useState } from 'react';
import { useWatch, useFormState } from 'react-hook-form';
import styles from './RequestForm.module.scss';
import { PREGNANCY_BABY_POSTPARTUM_QUESTION_LABEL } from './stepConfig';
import {
  REFERRAL_SOURCE_OPTIONS,
  REFERRAL_SOURCE_OTHER_VALUE,
} from './referralSourceOptions';
import FloatingLabelDatePicker from './components/FloatingLabelDatePicker';
import {
  PAYMENT_METHOD_OPTIONS,
  getBirthLocationNameLabel,
  isSelfPayMethod,
} from './useRequestForm';
import {
  INSURANCE_PLAN_TYPE_OPTIONS,
  INSURANCE_POLICY_HOLDER_RELATIONSHIP_OPTIONS,
  isFullSupportMethod,
  isInsuranceMethod,
  isNotSurePaymentMethod,
  isSelfPaySlidingScaleMethod,
  requiresInsuranceDetails,
} from '@/lib/paymentRules';
import {
  SLIDING_SCALE_TIER_ROWS,
  SELF_PAY_SLIDING_SUPPORT_TYPES,
} from '@/lib/slidingScaleData';

function hasFilledFloatingValue(v: unknown): boolean {
  if (v === undefined || v === null) return false;
  if (typeof v === 'number') return !Number.isNaN(v);
  return String(v).trim() !== '';
}

function ArrowSVG({ color = '#757575' }: { color?: string }) {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      style={{ display: 'block' }}
    >
      <polygon points='7,10 12,15 17,10' fill={color} />
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
const pronounOptions = ['She/Her', 'He/Him', 'They/Them', 'Ze/Hir/Zir', 'None'];

export function Step3FamilyMembers({
  form,
  handleBack,
  handleNextStep,
  step,
  totalSteps,
}: any) {
  const errors = form.formState.errors;
  const [
    wRelationship,
    wFamFirst,
    wFamLast,
    wFamPronouns,
    wFamMiddle,
    wFamEmail,
    wFamMobile,
  ] =
    useWatch({
      control: form.control,
      name: [
        'relationship_status',
        'family_first_name',
        'family_last_name',
        'family_pronouns',
        'family_middle_name',
        'family_email',
        'family_mobile_phone',
      ] as const,
    }) ?? ['', '', '', '', '', '', ''];

  const [focus, setFocus] = useState({
    relationship_status: false,
    family_first_name: false,
    family_last_name: false,
    family_pronouns: false,
    family_middle_name: false,
    family_email: false,
    family_mobile_phone: false,
  });
  const [relationshipOpen, setRelationshipOpen] = useState(false);
  const [pronounsOpen, setPronounsOpen] = useState(false);

  const handleFocus = (field: keyof typeof focus) =>
    setFocus((f) => ({ ...f, [field]: true }));
  const handleBlur = (field: keyof typeof focus) => {
    const v = form.getValues(field as never);
    setFocus((f) => ({ ...f, [field]: hasFilledFloatingValue(v) }));
  };

  return (
    <div>
      <div className={styles['form-grid']}>
        {/* Relationship status */}
        <div className={styles['form-field']}>
          <select
            className={styles['form-select']}
            {...form.register('relationship_status')}
            id='relationship_status'
            defaultValue=''
            onFocus={() => {
              handleFocus('relationship_status');
              setRelationshipOpen(true);
            }}
            onBlur={() => {
              handleBlur('relationship_status');
              setRelationshipOpen(false);
            }}
          >
            <option value='' disabled hidden></option>
            {relationshipOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <label
            htmlFor='relationship_status'
            className={
              styles['form-floating-label'] +
              (focus.relationship_status || hasFilledFloatingValue(wRelationship)
                ? ' ' + styles['form-label--active']
                : '')
            }
            style={{
              left: 0,
              color: relationshipOpen ? '#00bcd4' : undefined,
              right: 0,
              maxWidth: 'calc(100% - 36px)',
            }}
          >
            Relationship status
          </label>
          <span
            className={styles['form-select-arrow']}
            style={{ color: relationshipOpen ? '#00bcd4' : '#757575' }}
          >
            ▼
          </span>
          {errors.relationship_status && (
            <div className={styles['form-error']}>
              {errors.relationship_status.message as string}
            </div>
          )}
        </div>
        {/* First Name */}
        <div className={styles['form-field']}>
          <input
            className={styles['form-input']}
            {...form.register('family_first_name')}
            id='family_first_name'
            autoComplete='off'
            onFocus={() => handleFocus('family_first_name')}
            onBlur={() => handleBlur('family_first_name')}
          />
          <label
            htmlFor='family_first_name'
            className={
              styles['form-floating-label'] +
              (focus.family_first_name || hasFilledFloatingValue(wFamFirst)
                ? ' ' + styles['form-label--active']
                : '')
            }
          >
            First Name
          </label>
          {errors.family_first_name && (
            <div className={styles['form-error']}>
              {errors.family_first_name.message as string}
            </div>
          )}
        </div>
        {/* Last Name */}
        <div className={styles['form-field']}>
          <input
            className={styles['form-input']}
            {...form.register('family_last_name')}
            id='family_last_name'
            autoComplete='off'
            onFocus={() => handleFocus('family_last_name')}
            onBlur={() => handleBlur('family_last_name')}
          />
          <label
            htmlFor='family_last_name'
            className={
              styles['form-floating-label'] +
              (focus.family_last_name || hasFilledFloatingValue(wFamLast)
                ? ' ' + styles['form-label--active']
                : '')
            }
          >
            Last Name
          </label>
          {errors.family_last_name && (
            <div className={styles['form-error']}>
              {errors.family_last_name.message as string}
            </div>
          )}
        </div>
        {/* Pronouns */}
        <div className={styles['form-field']}>
          <select
            className={styles['form-select']}
            {...form.register('family_pronouns')}
            id='family_pronouns'
            defaultValue=''
            onFocus={() => {
              handleFocus('family_pronouns');
              setPronounsOpen(true);
            }}
            onBlur={() => {
              handleBlur('family_pronouns');
              setPronounsOpen(false);
            }}
          >
            <option value='' disabled hidden></option>
            {pronounOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <label
            htmlFor='family_pronouns'
            className={
              styles['form-floating-label'] +
              (focus.family_pronouns || hasFilledFloatingValue(wFamPronouns)
                ? ' ' + styles['form-label--active']
                : '')
            }
            style={{
              left: 0,
              color: pronounsOpen ? '#00bcd4' : undefined,
              right: 0,
              maxWidth: 'calc(100% - 36px)',
            }}
          >
            Pronouns
          </label>
          <span
            className={styles['form-select-arrow']}
            style={{ color: pronounsOpen ? '#00bcd4' : '#757575' }}
          >
            ▼
          </span>
          {errors.family_pronouns && (
            <div className={styles['form-error']}>
              {errors.family_pronouns.message as string}
            </div>
          )}
        </div>
        {/* Middle Name */}
        <div className={styles['form-field']}>
          <input
            className={styles['form-input']}
            {...form.register('family_middle_name')}
            id='family_middle_name'
            autoComplete='off'
            onFocus={() => handleFocus('family_middle_name')}
            onBlur={() => handleBlur('family_middle_name')}
          />
          <label
            htmlFor='family_middle_name'
            className={
              styles['form-floating-label'] +
              (focus.family_middle_name || hasFilledFloatingValue(wFamMiddle)
                ? ' ' + styles['form-label--active']
                : '')
            }
          >
            Middle Name
          </label>
          {errors.family_middle_name && (
            <div className={styles['form-error']}>
              {errors.family_middle_name.message as string}
            </div>
          )}
        </div>
        {/* Email */}
        <div className={styles['form-field']}>
          <input
            className={styles['form-input']}
            {...form.register('family_email')}
            id='family_email'
            autoComplete='off'
            onFocus={() => handleFocus('family_email')}
            onBlur={() => handleBlur('family_email')}
          />
          <label
            htmlFor='family_email'
            className={
              styles['form-floating-label'] +
              (focus.family_email || hasFilledFloatingValue(wFamEmail)
                ? ' ' + styles['form-label--active']
                : '')
            }
          >
            Email
          </label>
          {errors.family_email && (
            <div className={styles['form-error']}>
              {errors.family_email.message as string}
            </div>
          )}
        </div>
        {/* Mobile phone */}
        <div className={styles['form-field']}>
          <input
            className={styles['form-input']}
            {...form.register('family_mobile_phone')}
            id='family_mobile_phone'
            autoComplete='off'
            onFocus={() => handleFocus('family_mobile_phone')}
            onBlur={() => handleBlur('family_mobile_phone')}
          />
          <label
            htmlFor='family_mobile_phone'
            className={
              styles['form-floating-label'] +
              (focus.family_mobile_phone || hasFilledFloatingValue(wFamMobile)
                ? ' ' + styles['form-label--active']
                : '')
            }
          >
            Mobile phone
          </label>
          {errors.family_mobile_phone && (
            <div className={styles['form-error']}>
              {errors.family_mobile_phone.message as string}
            </div>
          )}
        </div>
      </div>
      <div className={styles['step-buttons-row']}>
        <Button type='button' onClick={handleBack} disabled={step === 0}>
          Back
        </Button>
        <Button
          type='submit'
          onClick={() => handleNextStep()}
          disabled={form.formState.isSubmitting}
        >
          {step === totalSteps - 1 ? 'Submit' : 'Next'}
        </Button>
      </div>
    </div>
  );
}

export function Step4Referral({
  form,
  handleBack,
  handleNextStep,
  step,
  totalSteps,
}: any) {
  const errors = form.formState.errors;
  const [focus, setFocus] = useState({
    referral_source: false,
    referral_source_other: false,
    referral_name: false,
    referral_email: false,
  });
  const [referralOpen, setReferralOpen] = useState(false);

  const referralSource = useWatch({
    control: form.control,
    name: 'referral_source',
  });
  const referralSourceOther = useWatch({
    control: form.control,
    name: 'referral_source_other',
  });
  const referralName = useWatch({
    control: form.control,
    name: 'referral_name',
  });
  const referralEmail = useWatch({
    control: form.control,
    name: 'referral_email',
  });

  const handleFocus = (field: keyof typeof focus) =>
    setFocus((f) => ({ ...f, [field]: true }));
  const handleBlur = (field: keyof typeof focus) => {
    const v = form.getValues(field);
    setFocus((f) => ({ ...f, [field]: hasFilledFloatingValue(v) }));
  };

  const hasReferralSource = Boolean(String(referralSource ?? '').trim());
  const isReferralOther = referralSource === REFERRAL_SOURCE_OTHER_VALUE;

  const referralSourceRegister = form.register('referral_source');

  return (
    <div>
      <div
        className={`${styles['form-grid']} ${styles['step-referral-grid']}`}
      >
        {/* Referral Source */}
        <div
          className={`${styles['form-field']} ${styles['form-field-label-above']}`}
        >
          <label
            htmlFor='referral_source'
            className={
              styles['form-floating-label'] +
              (focus.referral_source || hasReferralSource
                ? ' ' + styles['form-label--active']
                : '') +
              (errors.referral_source ? ' ' + styles['form-label--error'] : '')
            }
            style={{ left: 0, right: 0, maxWidth: 'calc(100% - 36px)' }}
          >
            How did you hear about us? *
          </label>
          <select
            className={
              styles['form-select'] +
              (errors.referral_source ? ' ' + styles['form-label--error'] : '')
            }
            {...referralSourceRegister}
            id='referral_source'
            defaultValue=''
            onChange={(e) => {
              referralSourceRegister.onChange(e);
              if (e.target.value !== REFERRAL_SOURCE_OTHER_VALUE) {
                form.setValue('referral_source_other', '', {
                  shouldValidate: true,
                });
              }
            }}
            onFocus={() => {
              handleFocus('referral_source');
              setReferralOpen(true);
            }}
            onBlur={() => {
              handleBlur('referral_source');
              setReferralOpen(false);
            }}
          >
            <option value='' disabled hidden></option>
            {REFERRAL_SOURCE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span
            className={styles['form-select-arrow']}
            style={{
              color: errors.referral_source
                ? '#d32f2f'
                : referralOpen
                  ? '#00bcd4'
                  : '#757575',
            }}
          >
            ▼
          </span>
          {errors.referral_source && (
            <div className={styles['form-error']}>
              {(errors.referral_source.message as string) ||
                'Please select how you heard about Sokana.'}
            </div>
          )}
        </div>
        {isReferralOther && (
          <div
            className={`${styles['form-field']} ${styles['form-field-label-above']}`}
            style={{ gridColumn: '1 / span 4' }}
          >
            <label
              htmlFor='referral_source_other'
              className={
                styles['form-floating-label'] +
                (focus.referral_source_other || hasFilledFloatingValue(referralSourceOther)
                  ? ' ' + styles['form-label--active']
                  : '') +
                (errors.referral_source_other
                  ? ' ' + styles['form-label--error']
                  : '')
              }
              style={{ left: 0, right: 0, maxWidth: 'calc(100% - 36px)' }}
            >
              Please describe how you heard about Sokana *
            </label>
            <textarea
              className={
                styles['form-input'] +
                (errors.referral_source_other
                  ? ' ' + styles['form-label--error']
                  : '')
              }
              {...form.register('referral_source_other')}
              id='referral_source_other'
              data-type='textarea'
              autoComplete='off'
              onFocus={() => handleFocus('referral_source_other')}
              onBlur={() => handleBlur('referral_source_other')}
              style={{ minHeight: 80, height: 'auto' }}
            />
            {errors.referral_source_other && (
              <div className={styles['form-error']}>
                {(errors.referral_source_other.message as string) ||
                  'Please describe how you heard about Sokana.'}
              </div>
            )}
          </div>
        )}
        {/* Referral Name */}
        <div
          className={`${styles['form-field']} ${styles['form-field-label-above']}`}
        >
          <label
            htmlFor='referral_name'
            className={
              styles['form-floating-label'] +
              (focus.referral_name || hasFilledFloatingValue(referralName)
                ? ' ' + styles['form-label--active']
                : '') +
              (errors.referral_name ? ' ' + styles['form-label--error'] : '')
            }
            style={{ left: 0, right: 0, maxWidth: 'calc(100% - 36px)' }}
          >
            Name of person, agency, midwife, or organization that referred you, if applicable
          </label>
          <input
            className={
              styles['form-input'] +
              (errors.referral_name ? ' ' + styles['form-label--error'] : '')
            }
            {...form.register('referral_name')}
            id='referral_name'
            autoComplete='off'
            onFocus={() => handleFocus('referral_name')}
            onBlur={() => handleBlur('referral_name')}
          />
          {errors.referral_name && (
            <div className={styles['form-error']}>
              {errors.referral_name.message as string}
            </div>
          )}
        </div>
        {/* Referral Email (optional) */}
        <div
          className={`${styles['form-field']} ${styles['form-field-label-above']}`}
        >
          <label
            htmlFor='referral_email'
            className={
              styles['form-floating-label'] +
              (focus.referral_email || hasFilledFloatingValue(referralEmail)
                ? ' ' + styles['form-label--active']
                : '') +
              (errors.referral_email ? ' ' + styles['form-label--error'] : '')
            }
          >
            Email
          </label>
          <input
            className={
              styles['form-input'] +
              (errors.referral_email ? ' ' + styles['form-label--error'] : '')
            }
            {...form.register('referral_email')}
            id='referral_email'
            autoComplete='off'
            onFocus={() => handleFocus('referral_email')}
            onBlur={() => handleBlur('referral_email')}
          />
          {errors.referral_email && (
            <div className={styles['form-error']}>
              {errors.referral_email.message as string}
            </div>
          )}
        </div>
      </div>
      <div className={styles['step-buttons-row']}>
        <Button type='button' onClick={handleBack} disabled={step === 0}>
          Back
        </Button>
        <Button
          type='submit'
          onClick={() => handleNextStep()}
          disabled={form.formState.isSubmitting}
        >
          {step === totalSteps - 1 ? 'Submit' : 'Next'}
        </Button>
      </div>
    </div>
  );
}

export function Step5HealthHistory({
  form,
  handleBack,
  handleNextStep,
  step,
  totalSteps,
}: any) {
  const values = form.getValues();
  const errors = form.formState.errors;
  const [focus, setFocus] = useState({
    health_history: false,
    allergies: false,
  });

  const handleFocus = (field: keyof typeof focus) =>
    setFocus((f) => ({ ...f, [field]: true }));
  const handleBlur = (field: keyof typeof focus) =>
    setFocus((f) => ({ ...f, [field]: false }));

  return (
    <div>
      <div className={styles['form-grid']}>
        <div
          className={styles['form-field']}
          style={{ gridColumn: '1 / span 4' }}
        >
          <textarea
            className={
              styles['form-input'] +
              (errors.health_history ? ' ' + styles['form-label--error'] : '')
            }
            {...form.register('health_history')}
            id='health_history'
            data-type='textarea'
            autoComplete='off'
            onFocus={() => handleFocus('health_history')}
            onBlur={() => handleBlur('health_history')}
            style={{ minHeight: 80, height: 'auto' }}
          />
          <label
            htmlFor='health_history'
            className={
              styles['form-floating-label'] +
              (focus.health_history || values.health_history
                ? ' ' + styles['form-label--active']
                : '') +
              (errors.health_history ? ' ' + styles['form-label--error'] : '')
            }
          >
            {PREGNANCY_BABY_POSTPARTUM_QUESTION_LABEL}
          </label>
          {errors.health_history && (
            <div className={styles['form-error']}>
              {errors.health_history.message as string}
            </div>
          )}
        </div>
        <div
          className={styles['form-field']}
          style={{ gridColumn: '1 / span 4' }}
        >
          <input
            className={
              styles['form-input'] +
              (errors.allergies ? ' ' + styles['form-label--error'] : '')
            }
            {...form.register('allergies')}
            id='allergies'
            autoComplete='off'
            onFocus={() => handleFocus('allergies')}
            onBlur={() => handleBlur('allergies')}
          />
          <label
            htmlFor='allergies'
            className={
              styles['form-floating-label'] +
              (focus.allergies || values.allergies
                ? ' ' + styles['form-label--active']
                : '') +
              (errors.allergies ? ' ' + styles['form-label--error'] : '')
            }
          >
            Allergies
          </label>
          {errors.allergies && (
            <div className={styles['form-error']}>
              {(errors.allergies.message as string) || 'Required.'}
            </div>
          )}
        </div>
      </div>
      <div className={styles['step-buttons-row']}>
        <Button type='button' onClick={handleBack} disabled={step === 0}>
          Back
        </Button>
        <Button
          type='submit'
          onClick={() => handleNextStep()}
          disabled={form.formState.isSubmitting}
        >
          {step === totalSteps - 1 ? 'Submit' : 'Next'}
        </Button>
      </div>
    </div>
  );
}

export function Step6PregnancyBaby({
  form,
  handleBack,
  handleNextStep,
  step,
  totalSteps,
}: any) {
  const values = form.getValues();
  const { errors } = useFormState({
    control: form.control,
    name: [
      'due_date',
      'birth_location',
      'number_of_babies',
      'provider_type',
      'pregnancy_number',
      'birth_hospital',
      'baby_name',
    ],
  });

  const [dueDate, birthLocation, numberOfBabies, providerType, pregnancyNumber] =
    useWatch({
      control: form.control,
      name: [
        'due_date',
        'birth_location',
        'number_of_babies',
        'provider_type',
        'pregnancy_number',
      ] as const,
    }) ?? ['', '', '', '', 0];

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

  const handleFocus = (field: keyof typeof focus) =>
    setFocus((f) => ({ ...f, [field]: true }));
  const handleBlur = (field: keyof typeof focus) =>
    setFocus((f) => ({ ...f, [field]: false }));

  const birthLocationOptions = ['Hospital', 'Home', 'Birth Center', 'Other'];
  const birthLocationNameLabel = getBirthLocationNameLabel(birthLocation || '');
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
  const providerTypeOptions = ['Midwife', 'OB', 'Family Doctor', 'Other'];

  return (
    <div>
      <div className={`${styles['form-grid']} ${styles['step-pregnancy-grid']}`}>
        {/* Due Date */}
        <FloatingLabelDatePicker
          label="Due Date or Date of Birth*"
          register={form.register('due_date')}
          error={errors.due_date?.message as string}
          onFocus={() => handleFocus('due_date')}
          onBlur={() => handleBlur('due_date')}
        />
        {/* Birth Location */}
        <div className={styles['form-field']}>
          <select
            className={styles['form-select']}
            {...form.register('birth_location')}
            id='birth_location'
            defaultValue=''
            onFocus={() => {
              handleFocus('birth_location');
              setBirthLocationOpen(true);
            }}
            onBlur={() => {
              handleBlur('birth_location');
              setBirthLocationOpen(false);
            }}
          >
            <option value='' disabled hidden></option>
            {birthLocationOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <label
            htmlFor='birth_location'
            className={
              styles['form-floating-label'] +
              (focus.birth_location || values.birth_location
                ? ' ' + styles['form-label--active']
                : '')
            }
            style={{
              left: 0,
              color: birthLocationOpen ? '#00bcd4' : undefined,
              right: 0,
              maxWidth: 'calc(100% - 36px)',
            }}
          >
            Birth location*
          </label>
          <span
            className={styles['form-select-arrow']}
            style={{ color: birthLocationOpen ? '#00bcd4' : '#757575' }}
          >
            ▼
          </span>
          {errors.birth_location && (
            <div className={styles['form-error']}>
              {errors.birth_location.message as string}
            </div>
          )}
        </div>
        {/* Hospital or Birth Center */}
        <div className={`${styles['form-field']} ${styles['hospital-label']}`}>
          <input
            className={styles['form-input']}
            {...form.register('birth_hospital')}
            id='birth_hospital'
            autoComplete='off'
            onFocus={() => handleFocus('birth_hospital')}
            onBlur={() => handleBlur('birth_hospital')}
          />
          <label
            htmlFor='birth_hospital'
            className={
              styles['form-floating-label'] +
              (focus.birth_hospital || values.birth_hospital
                ? ' ' + styles['form-label--active']
                : '')
            }
          >
            {birthLocationNameLabel}
          </label>
          {errors.birth_hospital && (
            <div className={styles['form-error']}>
              {errors.birth_hospital.message as string}
            </div>
          )}
        </div>
        {/* Baby's Name */}
        <div className={styles['form-field']}>
          <input
            className={styles['form-input']}
            {...form.register('baby_name')}
            id='baby_name'
            autoComplete='off'
            onFocus={() => handleFocus('baby_name')}
            onBlur={() => handleBlur('baby_name')}
          />
          <label
            htmlFor='baby_name'
            className={
              styles['form-floating-label'] +
              (focus.baby_name || values.baby_name
                ? ' ' + styles['form-label--active']
                : '')
            }
          >
            Baby's name (optional)
          </label>
          {errors.baby_name && (
            <div className={styles['form-error']}>
              {errors.baby_name.message as string}
            </div>
          )}
        </div>
        {/* Number of Babies */}
        <div className={styles['form-field']}>
          <select
            className={styles['form-select']}
            {...form.register('number_of_babies')}
            id='number_of_babies'
            defaultValue=''
            onFocus={() => {
              handleFocus('number_of_babies');
              setNumBabiesOpen(true);
            }}
            onBlur={() => {
              handleBlur('number_of_babies');
              setNumBabiesOpen(false);
            }}
          >
            <option value='' disabled hidden></option>
            {numberOfBabiesOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <label
            htmlFor='number_of_babies'
            className={
              styles['form-floating-label'] +
              (focus.number_of_babies || values.number_of_babies
                ? ' ' + styles['form-label--active']
                : '')
            }
            style={{
              left: 0,
              color: numBabiesOpen ? '#00bcd4' : undefined,
              right: 0,
              maxWidth: 'calc(100% - 36px)',
            }}
          >
            Number of babies*
          </label>
          <span
            className={styles['form-select-arrow']}
            style={{ color: numBabiesOpen ? '#00bcd4' : '#757575' }}
          >
            ▼
          </span>
          {errors.number_of_babies && (
            <div className={styles['form-error']}>
              {errors.number_of_babies.message as string}
            </div>
          )}
        </div>
        {/* Provider Type */}
        <div className={styles['form-field']}>
          <select
            className={styles['form-select']}
            {...form.register('provider_type')}
            id='provider_type'
            defaultValue=''
            onFocus={() => {
              handleFocus('provider_type');
              setProviderTypeOpen(true);
            }}
            onBlur={() => {
              handleBlur('provider_type');
              setProviderTypeOpen(false);
            }}
          >
            <option value='' disabled hidden></option>
            {providerTypeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <label
            htmlFor='provider_type'
            className={
              styles['form-floating-label'] +
              (focus.provider_type || values.provider_type
                ? ' ' + styles['form-label--active']
                : '')
            }
            style={{
              left: 0,
              color: providerTypeOpen ? '#00bcd4' : undefined,
              right: 0,
              maxWidth: 'calc(100% - 36px)',
            }}
          >
            Provider Type
          </label>
          <span
            className={styles['form-select-arrow']}
            style={{ color: providerTypeOpen ? '#00bcd4' : '#757575' }}
          >
            ▼
          </span>
          {errors.provider_type && (
            <div className={styles['form-error']}>
              {errors.provider_type.message as string}
            </div>
          )}
        </div>
        {/* Pregnancy Number */}
        <div className={styles['form-field']}>
          <input
            className={`${styles['form-input']} ${styles['pregnancy-number-input']}`}
            {...form.register('pregnancy_number')}
            id='pregnancy_number'
            type="number"
            min="1"
            autoComplete='off'
            onFocus={() => handleFocus('pregnancy_number')}
            onBlur={() => handleBlur('pregnancy_number')}
            placeholder=""
          />
          <label
            htmlFor='pregnancy_number'
            className={
              styles['form-floating-label'] +
              (focus.pregnancy_number || values.pregnancy_number
                ? ' ' + styles['form-label--active']
                : '')
            }
          >
            What # pregnancy/baby is this?*
          </label>
          {errors.pregnancy_number && (
            <div className={styles['form-error']}>
              {errors.pregnancy_number.message as string}
            </div>
          )}
        </div>
      </div>
      <div className={styles['step-buttons-row']}>
        <Button type='button' onClick={handleBack} disabled={step === 0}>
          Back
        </Button>
        <Button
          type='submit'
          onClick={() => handleNextStep()}
          disabled={form.formState.isSubmitting}
        >
          {step === totalSteps - 1 ? 'Submit' : 'Next'}
        </Button>
      </div>
    </div>
  );
}

export function Step7PastPregnancies({
  form,
  handleBack,
  handleNextStep,
  step,
  totalSteps,
}: any) {
  const values = form.getValues();
  const errors = form.formState.errors;
  const hadPrevious = useWatch({ control: form.control, name: 'had_previous_pregnancies' });
  const [focus, setFocus] = useState({
    previous_pregnancies_count: false,
    living_children_count: false,
    past_pregnancy_experience: false,
  });
  const handleFocus = (field: keyof typeof focus) =>
    setFocus((f) => ({ ...f, [field]: true }));
  const handleBlur = (field: keyof typeof focus) =>
    setFocus((f) => ({ ...f, [field]: false }));

  return (
    <div>
      <div className={styles['form-grid']} style={{ alignItems: 'center' }}>
        <div
          className={styles['form-field']}
          style={{
            gridColumn: '1 / span 4',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '16px 0',
          }}
        >
          <input
            type='checkbox'
            id='had_previous_pregnancies'
            {...form.register('had_previous_pregnancies')}
            style={{
              width: 24,
              height: 24,
              accentColor: hadPrevious ? '#00bcd4' : undefined,
              margin: 0,
            }}
          />
          <label
            htmlFor='had_previous_pregnancies'
            style={{
              fontSize: 20,
              color: '#444',
              marginLeft: 12,
              cursor: 'pointer',
            }}
          >
            Had previous pregnancie(s)
          </label>
        </div>
        {hadPrevious && (
          <>
            <div className={styles['form-field']}>
              <input
                className={styles['form-input']}
                type='number'
                min='0'
                {...form.register('previous_pregnancies_count', {
                  setValueAs: (value: string) =>
                    value === '' ? undefined : parseInt(value) || 0,
                })}
                id='previous_pregnancies_count'
                onFocus={() => handleFocus('previous_pregnancies_count')}
                onBlur={() => handleBlur('previous_pregnancies_count')}
              />
              <label
                htmlFor='previous_pregnancies_count'
                className={
                  styles['form-floating-label'] +
                  (focus.previous_pregnancies_count ||
                    values.previous_pregnancies_count ||
                    values.previous_pregnancies_count === 0
                    ? ' ' + styles['form-label--active']
                    : '')
                }
              >
                # of previous pregnancies
              </label>
              {errors.previous_pregnancies_count && (
                <div className={styles['form-error']}>
                  {errors.previous_pregnancies_count.message as string}
                </div>
              )}
            </div>
            <div className={styles['form-field']}>
              <input
                className={styles['form-input']}
                type='number'
                min='0'
                {...form.register('living_children_count', {
                  setValueAs: (value: string) =>
                    value === '' ? undefined : parseInt(value) || 0,
                })}
                id='living_children_count'
                onFocus={() => handleFocus('living_children_count')}
                onBlur={() => handleBlur('living_children_count')}
              />
              <label
                htmlFor='living_children_count'
                className={
                  styles['form-floating-label'] +
                  (focus.living_children_count ||
                    values.living_children_count ||
                    values.living_children_count === 0
                    ? ' ' + styles['form-label--active']
                    : '')
                }
              >
                # of living children
              </label>
              {errors.living_children_count && (
                <div className={styles['form-error']}>
                  {errors.living_children_count.message as string}
                </div>
              )}
            </div>
            <div
              className={styles['form-field']}
              style={{ gridColumn: '1 / span 4' }}
            >
              <textarea
                className={styles['form-input']}
                style={{ minHeight: 40 }}
                {...form.register('past_pregnancy_experience')}
                id='past_pregnancy_experience'
                onFocus={() => handleFocus('past_pregnancy_experience')}
                onBlur={() => handleBlur('past_pregnancy_experience')}
              />
              <label
                htmlFor='past_pregnancy_experience'
                className={
                  styles['form-floating-label'] +
                  (focus.past_pregnancy_experience ||
                    values.past_pregnancy_experience
                    ? ' ' + styles['form-label--active']
                    : '')
                }
              >
                Past pregnancy experience(s)
              </label>
              {errors.past_pregnancy_experience && (
                <div className={styles['form-error']}>
                  {errors.past_pregnancy_experience.message as string}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <div className={styles['step-buttons-row']}>
        <Button type='button' onClick={handleBack} disabled={step === 0}>
          Back
        </Button>
        <Button
          type='submit'
          onClick={() => handleNextStep()}
          disabled={form.formState.isSubmitting}
        >
          {step === totalSteps - 1 ? 'Submit' : 'Next'}
        </Button>
      </div>
    </div>
  );
}

export function Step8ServicesInterested({
  form,
  handleBack,
  handleNextStep,
  step,
  totalSteps,
}: any) {
  const values = form.getValues();
  const errors = form.formState.errors;
  const [focus, setFocus] = useState({
    services_interested: false,
    service_support_details: false,
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const handleFocus = (field: keyof typeof focus) =>
    setFocus((f) => ({ ...f, [field]: true }));
  const handleBlur = (field: keyof typeof focus) =>
    setFocus((f) => ({ ...f, [field]: false }));

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
      form.setValue(
        'services_interested',
        selected.filter((s: string) => s !== service),
        { shouldValidate: true }
      );
    } else {
      form.setValue('services_interested', [...selected, service], {
        shouldValidate: true,
      });
    }
  };

  return (
    <div>
      <div className={styles['form-grid']} style={{ alignItems: 'flex-start' }}>
        {/* Multi-select dropdown */}
        <div
          className={styles['form-field']}
          style={{ gridColumn: '1 / span 4' }}
        >
          <label
            className={
              styles['form-floating-label'] + ' ' + styles['form-label--active']
            }
            style={{
              color: errors.services_interested ? '#d32f2f' : undefined,
            }}
          >
            Which services are you interested in? (Select all that apply)*
          </label>
          <Popover open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <PopoverTrigger asChild>
              <button
                type='button'
                className={styles['form-input']}
                style={{
                  textAlign: 'left',
                  minHeight: 40,
                  cursor: 'pointer',
                  background: '#fff',
                  wordBreak: 'break-word',
                  whiteSpace: 'normal',
                  lineHeight: '1.3',
                }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {selected.length > 0 ? selected.join(', ') : 'Select'}
                <span style={{ float: 'right', pointerEvents: 'none', marginLeft: '8px' }}>▼</span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              align='start'
              side='bottom'
              sideOffset={4}
              style={{
                minWidth: 'calc(100vw - 40px)',
                maxWidth: '400px',
                background: '#fff',
                border: '1px solid #bdbdbd',
                borderRadius: 4,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                padding: '12px 0',
                zIndex: 10,
              }}
            >
              {serviceOptions.map((opt) => (
                <label
                  key={opt}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '16px',
                    cursor: 'pointer',
                    gap: 12,
                    padding: '12px 16px',
                    margin: 0,
                  }}
                >
                  <input
                    type='checkbox'
                    checked={selected.includes(opt)}
                    onChange={() => toggleService(opt)}
                    style={{
                      width: 20,
                      height: 20,
                      accentColor: selected.includes(opt)
                        ? '#d32f2f'
                        : '#bdbdbd',
                      margin: 0,
                    }}
                  />
                  {opt}
                </label>
              ))}
            </PopoverContent>
          </Popover>
          {errors.services_interested && (
            <div className={styles['form-error']}>
              {errors.services_interested.message as string}
            </div>
          )}
        </div>
        {/* Support details textarea */}
        <div
          className={styles['form-field']}
          style={{ gridColumn: '1 / span 4' }}
        >
          <textarea
            className={styles['form-input']}
            {...form.register('service_support_details')}
            id='service_support_details'
            data-type="textarea"
            onFocus={() => handleFocus('service_support_details')}
            onBlur={() => handleBlur('service_support_details')}
            style={{ minHeight: 80, height: 'auto' }}
          />
          <label
            htmlFor='service_support_details'
            className={
              styles['form-floating-label'] +
              (focus.service_support_details || values.service_support_details
                ? ' ' + styles['form-label--active']
                : '')
            }
          >
            Describe the support you are looking for — for example how a doula
            can help during labor, or for postpartum whether you prefer daytime
            visits, overnights, and roughly how many weeks. If you chose
            'Other' above, explain here.*
          </label>
          {errors.service_support_details && (
            <div className={styles['form-error']}>
              {errors.service_support_details.message as string}
            </div>
          )}
        </div>
      </div>
      <div className={styles['step-buttons-row']}>
        <Button type='button' onClick={handleBack} disabled={step === 0}>
          Back
        </Button>
        <Button
          type='submit'
          onClick={() => handleNextStep()}
          disabled={form.formState.isSubmitting}
        >
          {step === totalSteps - 1 ? 'Submit' : 'Next'}
        </Button>
      </div>
    </div>
  );
}

export function Step9Payment({
  form,
  handleBack,
  handleNextStep,
  step,
  totalSteps,
}: any) {
  const values = form.getValues();
  const errors = form.formState.errors;
  const paymentMethod = useWatch({
    control: form.control,
    name: 'payment_method',
  });
  const hasSecondaryInsurance = useWatch({
    control: form.control,
    name: 'has_secondary_insurance',
  });
  const isSelfPay = isSelfPayMethod(paymentMethod || '');
  const isSelfPaySlidingScale = isSelfPaySlidingScaleMethod(paymentMethod || '');
  const isFullSupport = isFullSupportMethod(paymentMethod || '');
  const isNotSure = isNotSurePaymentMethod(paymentMethod || '');
  const needsInsuranceDetails = requiresInsuranceDetails(paymentMethod || '');
  const slidingSupportType = useWatch({
    control: form.control,
    name: 'self_pay_sliding_support_type',
  });
  const slidingTier = useWatch({
    control: form.control,
    name: 'self_pay_sliding_tier',
  });
  const [focus, setFocus] = useState({ payment_method: false });
  const [open, setOpen] = useState({ payment_method: false });
  const handleFocus = (field: keyof typeof focus) =>
    setFocus((f) => ({ ...f, [field]: true }));
  const handleBlur = (field: keyof typeof focus) =>
    setFocus((f) => ({ ...f, [field]: false }));

  const insuranceFieldError = (field: keyof typeof errors, fallback: string) => {
    const error = errors[field];
    if (!error) return null;
    if (error.message === 'Required.' || error.message === 'Required') return fallback;
    return error.message as string;
  };

  return (
    <div>
      <div
        style={{
          color: '#666',
          fontSize: 'clamp(1rem, 3.2vw, 1.15rem)',
          marginBottom: '2.5rem',
          maxWidth: 900,
          lineHeight: 1.55,
          wordBreak: 'break-word',
        }}
      >
        <p style={{ margin: '0 0 1rem' }}>
          {`At Sokana Collective, we believe everyone deserves access to care, regardless of financial circumstances. We offer several payment options, including insurance and sliding scale support to meet your needs.`}
        </p>
        <p style={{ margin: 0 }}>
          {`Please select how you'd like to pay for services below. If you're not sure what you qualify for, we're here to support you.`}
        </p>
      </div>
      <div className={styles['form-grid']}>
        {/* Payment Method Dropdown */}
        <div
          className={styles['form-field']}
          style={{ gridColumn: '1 / span 4', position: 'relative' }}
        >
          {/* Error message above input, centered */}
          {errors.payment_method && (
            <div
              style={{
                color: '#d32f2f',
                textAlign: 'center',
                marginBottom: 8,
                fontWeight: 500,
                fontSize: 16,
              }}
            >
              {errors.payment_method.message === 'Required.' ||
                errors.payment_method.message === 'Required'
                ? 'Please select how you plan to pay for services.'
                : errors.payment_method.message}
            </div>
          )}
          <Popover
            open={open.payment_method}
            onOpenChange={(v) => setOpen((o) => ({ ...o, payment_method: v }))}
          >
            <PopoverTrigger asChild>
              <button
                type='button'
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
                onClick={() =>
                  setOpen((o) => ({ ...o, payment_method: !o.payment_method }))
                }
                onFocus={() =>
                  setFocus((f) => ({ ...f, payment_method: true }))
                }
                onBlur={() =>
                  setFocus((f) => ({ ...f, payment_method: false }))
                }
                aria-invalid={!!errors.payment_method}
                id='payment_method'
                >
                {values.payment_method || 'How do you plan to pay for services?'}
                <span
                  style={{
                    float: 'right',
                    pointerEvents: 'none',
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                >
                  ▼
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              align='start'
              side='bottom'
              sideOffset={4}
              style={{
                minWidth: 300,
                maxWidth: 400,
                background: '#fff',
                border: '1px solid #bdbdbd',
                borderRadius: 4,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                padding: 0,
                zIndex: 10,
              }}
                >
              {PAYMENT_METHOD_OPTIONS.map((opt) => (
                <div
                  key={opt}
                  style={{
                    padding: '14px 18px',
                    fontSize: 17,
                    cursor: 'pointer',
                    background:
                      values.payment_method === opt ? '#f5f5f5' : '#fff',
                    color: '#222',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    lineHeight: 1.5,
                  }}
                  onClick={() => {
                    form.setValue('payment_method', opt, { shouldValidate: true });
                    if (!isSelfPaySlidingScaleMethod(opt)) {
                      form.setValue('self_pay_sliding_support_type', '');
                      form.setValue('self_pay_sliding_tier', '');
                    }
                    if (
                      isSelfPayMethod(opt) ||
                      isFullSupportMethod(opt) ||
                      isNotSurePaymentMethod(opt)
                    ) {
                      form.setValue('insurance_policy_holder_name', '');
                      form.setValue('insurance_policy_holder_dob', '');
                      form.setValue('insurance_policy_holder_relationship', '');
                      form.setValue('insurance_provider', '');
                      form.setValue('insurance_member_id', '');
                      form.setValue('policy_number', '');
                      form.setValue('insurance_plan_type', '');
                      form.setValue('insurance_phone_number', '');
                      form.setValue('has_secondary_insurance', false);
                      form.setValue('secondary_insurance_provider', '');
                      form.setValue('secondary_insurance_member_id', '');
                      form.setValue('secondary_policy_number', '');
                    }
                    setOpen((o) => ({ ...o, payment_method: false }));
                  }}
                >
                  {opt}
                </div>
              ))}
            </PopoverContent>
          </Popover>
        </div>

        {isFullSupport ? (
          <div
            className={styles['form-field']}
            style={{ gridColumn: '1 / span 4', marginTop: 8 }}
          >
            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: 8,
                padding: '14px 16px',
                color: '#92400e',
                fontSize: 15,
                lineHeight: 1.55,
                whiteSpace: 'normal',
              }}
            >
              If you are unable to pay for services at any level, you may request full support.
              Approved clients receive labor and postpartum care at no cost, including up to 32
              hours of postpartum support. You will have to pay a one-time $150 administrative
              fee. A team member will follow up with you.
            </div>
          </div>
        ) : isNotSure ? (
          <div
            className={styles['form-field']}
            style={{ gridColumn: '1 / span 4', marginTop: 8 }}
          >
            <div
              style={{
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: 8,
                padding: '14px 16px',
                color: '#0c4a6e',
                fontSize: 15,
                lineHeight: 1.55,
                whiteSpace: 'normal',
              }}
            >
              That is completely fine. A team member will contact you to help sort out insurance,
              Medicaid, sliding scale, or other options—no payment details are needed here.
            </div>
          </div>
        ) : isSelfPay ? (
          <div
            className={styles['form-field']}
            style={{ gridColumn: '1 / span 4', marginTop: 8 }}
          >
            {isSelfPaySlidingScale ? (
              <div
                style={{
                  marginBottom: 16,
                  padding: '18px 18px 20px',
                  background: '#fafafa',
                  border: '1px solid #e0e0e0',
                  borderRadius: 8,
                  color: '#333',
                  fontSize: 16,
                  lineHeight: 1.6,
                  maxWidth: '100%',
                }}
              >
                <p style={{ margin: '0 0 12px' }}>
                  We offer a sliding scale for self-pay clients based on financial need. Please review
                  the options below and select what feels most appropriate for your current situation.
                </p>
                <p style={{ margin: 0, fontWeight: 600, color: '#1a365d' }}>
                  This is a trust-based sliding scale. No documentation required.
                </p>

                <input type='hidden' {...form.register('self_pay_sliding_support_type')} />
                <input type='hidden' {...form.register('self_pay_sliding_tier')} />

                <fieldset
                  id='self_pay_sliding_support_type'
                  style={{
                    border: 'none',
                    margin: '20px 0 0',
                    padding: 0,
                  }}
                >
                  <legend
                    style={{
                      fontWeight: 600,
                      fontSize: 15,
                      marginBottom: 10,
                      color: '#222',
                    }}
                  >
                    Which support are you considering?
                  </legend>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 10,
                    }}
                  >
                    {SELF_PAY_SLIDING_SUPPORT_TYPES.map((label) => (
                      <button
                        key={label}
                        type='button'
                        onClick={() => {
                          form.setValue('self_pay_sliding_support_type', label, {
                            shouldValidate: true,
                          });
                          form.setValue('self_pay_sliding_tier', '', { shouldValidate: true });
                        }}
                        style={{
                          flex: '1 1 140px',
                          minHeight: 44,
                          padding: '10px 14px',
                          fontSize: 15,
                          cursor: 'pointer',
                          borderRadius: 6,
                          border:
                            slidingSupportType === label
                              ? '2px solid #00bcd4'
                              : '1px solid #bdbdbd',
                          background: slidingSupportType === label ? '#e0f7fa' : '#fff',
                          color: '#222',
                          fontWeight: slidingSupportType === label ? 600 : 400,
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {errors.self_pay_sliding_support_type && (
                    <div className={styles['form-error']} style={{ marginTop: 8 }}>
                      {errors.self_pay_sliding_support_type.message as string}
                    </div>
                  )}
                </fieldset>

                {slidingSupportType ? (
                  <div style={{ marginTop: 22 }} id='self_pay_sliding_tier'>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 15,
                        marginBottom: 10,
                        color: '#222',
                      }}
                    >
                      Sliding scale — select the row that fits your household
                    </div>
                    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                      <table
                        style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          fontSize: 14,
                          background: '#fff',
                          border: '1px solid #e0e0e0',
                        }}
                      >
                        <thead>
                          <tr style={{ background: '#f5f5f5' }}>
                            <th
                              style={{
                                textAlign: 'left',
                                padding: '10px 8px',
                                borderBottom: '1px solid #e0e0e0',
                                width: 40,
                              }}
                            >
                              {' '}
                            </th>
                            <th
                              style={{
                                textAlign: 'left',
                                padding: '10px 8px',
                                borderBottom: '1px solid #e0e0e0',
                              }}
                            >
                              Annual household income
                            </th>
                            {(slidingSupportType === 'Labor support' ||
                              slidingSupportType === 'Both') && (
                              <th
                                style={{
                                  textAlign: 'left',
                                  padding: '10px 8px',
                                  borderBottom: '1px solid #e0e0e0',
                                }}
                              >
                                Labor support
                              </th>
                            )}
                            {(slidingSupportType === 'Postpartum support' ||
                              slidingSupportType === 'Both') && (
                              <th
                                style={{
                                  textAlign: 'left',
                                  padding: '10px 8px',
                                  borderBottom: '1px solid #e0e0e0',
                                }}
                              >
                                Postpartum support
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {SLIDING_SCALE_TIER_ROWS.map((row) => {
                            const selected = slidingTier === row.incomeLabel;
                            return (
                              <tr
                                key={row.id}
                                style={{
                                  background: selected ? '#e0f7fa' : undefined,
                                  cursor: 'pointer',
                                }}
                                onClick={() => {
                                  form.setValue('self_pay_sliding_tier', row.incomeLabel, {
                                    shouldValidate: true,
                                  });
                                }}
                              >
                                <td
                                  style={{
                                    padding: '10px 8px',
                                    borderBottom: '1px solid #eee',
                                    verticalAlign: 'top',
                                  }}
                                >
                                  <input
                                    type='radio'
                                    name='self_pay_sliding_tier_choice'
                                    checked={selected}
                                    onChange={() => {
                                      form.setValue('self_pay_sliding_tier', row.incomeLabel, {
                                        shouldValidate: true,
                                      });
                                    }}
                                    aria-label={`Select ${row.incomeLabel}`}
                                  />
                                </td>
                                <td
                                  style={{
                                    padding: '10px 8px',
                                    borderBottom: '1px solid #eee',
                                    verticalAlign: 'top',
                                    fontWeight: 500,
                                  }}
                                >
                                  {row.incomeLabel}
                                </td>
                                {(slidingSupportType === 'Labor support' ||
                                  slidingSupportType === 'Both') && (
                                  <td
                                    style={{
                                      padding: '10px 8px',
                                      borderBottom: '1px solid #eee',
                                      verticalAlign: 'top',
                                    }}
                                  >
                                    {row.laborRate}
                                  </td>
                                )}
                                {(slidingSupportType === 'Postpartum support' ||
                                  slidingSupportType === 'Both') && (
                                  <td
                                    style={{
                                      padding: '10px 8px',
                                      borderBottom: '1px solid #eee',
                                      verticalAlign: 'top',
                                    }}
                                  >
                                    {row.postpartumRate}
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {errors.self_pay_sliding_tier && (
                      <div className={styles['form-error']} style={{ marginTop: 8 }}>
                        {errors.self_pay_sliding_tier.message as string}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 8,
                padding: '14px 16px',
                color: '#1e40af',
                fontSize: 15,
                lineHeight: 1.5,
              }}
            >
              Payment authorization is required. We&apos;ll send you a payment authorization form to
              complete and return—card numbers are not collected in this form.
            </div>
          </div>
        ) : paymentMethod && isInsuranceMethod(paymentMethod) ? (
          <div
            className={styles['form-field']}
            style={{ gridColumn: '1 / span 4', marginTop: 8 }}
          >
            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 8,
                padding: '14px 16px',
                color: '#1e40af',
                fontSize: 15,
                lineHeight: 1.5,
                marginBottom: 8,
              }}
            >
              Payment authorization may be required for copays, deductibles, or self-pay balances.
              Our team will send a payment authorization form when applicable—not collected here.
            </div>
          </div>
        ) : null}

        {needsInsuranceDetails ? (
          <>
            {isInsuranceMethod(paymentMethod) ? null : (
              <div
                className={styles['form-field']}
                style={{ gridColumn: '1 / span 4', marginTop: 4, marginBottom: 4 }}
              >
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 8,
                    padding: '12px 14px',
                    color: '#166534',
                    fontSize: 15,
                    lineHeight: 1.5,
                  }}
                >
                  Enter your Medicaid coverage details exactly as they appear on your member ID card.
                </div>
              </div>
            )}

            <div className={styles['form-field']} style={{ gridColumn: '1 / span 2' }}>
              <input
                className={styles['form-input']}
                {...form.register('insurance_policy_holder_name')}
                id='insurance_policy_holder_name'
                autoComplete='name'
              />
              <label
                htmlFor='insurance_policy_holder_name'
                className={
                  styles['form-floating-label'] +
                  (values.insurance_policy_holder_name ? ' ' + styles['form-label--active'] : '')
                }
              >
                Policy holder name *
              </label>
              {insuranceFieldError(
                'insurance_policy_holder_name',
                'Please enter the policy holder name.'
              ) && (
                <div className={styles['form-error']}>
                  {insuranceFieldError(
                    'insurance_policy_holder_name',
                    'Please enter the policy holder name.'
                  )}
                </div>
              )}
            </div>

            <div className={styles['form-field']} style={{ gridColumn: '3 / span 2' }}>
              <input
                className={styles['form-input']}
                {...form.register('insurance_policy_holder_dob')}
                id='insurance_policy_holder_dob'
                type='date'
              />
              <label
                htmlFor='insurance_policy_holder_dob'
                className={
                  styles['form-floating-label'] +
                  (values.insurance_policy_holder_dob ? ' ' + styles['form-label--active'] : '')
                }
              >
                Policy holder date of birth *
              </label>
              {insuranceFieldError(
                'insurance_policy_holder_dob',
                'Please enter the policy holder date of birth.'
              ) && (
                <div className={styles['form-error']}>
                  {insuranceFieldError(
                    'insurance_policy_holder_dob',
                    'Please enter the policy holder date of birth.'
                  )}
                </div>
              )}
            </div>

            <div className={styles['form-field']} style={{ gridColumn: '1 / span 4' }}>
              <label
                htmlFor='insurance_policy_holder_relationship'
                style={{ display: 'block', fontSize: 14, color: '#555', marginBottom: 6 }}
              >
                Relationship of policy holder to you *
              </label>
              <select
                id='insurance_policy_holder_relationship'
                className={styles['form-input']}
                style={{ width: '100%', fontSize: 17 }}
                {...form.register('insurance_policy_holder_relationship')}
              >
                <option value=''>Select relationship</option>
                {INSURANCE_POLICY_HOLDER_RELATIONSHIP_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {insuranceFieldError(
                'insurance_policy_holder_relationship',
                'Please select the policy holder’s relationship to you.'
              ) && (
                <div className={styles['form-error']}>
                  {insuranceFieldError(
                    'insurance_policy_holder_relationship',
                    'Please select the policy holder’s relationship to you.'
                  )}
                </div>
              )}
            </div>

            <div className={styles['form-field']} style={{ gridColumn: '1 / span 4' }}>
              <input
                className={styles['form-input']}
                {...form.register('insurance_provider')}
                id='insurance_provider'
                autoComplete='organization'
                onFocus={() => handleFocus('payment_method')}
                onBlur={() => handleBlur('payment_method')}
              />
              <label
                htmlFor='insurance_provider'
                className={
                  styles['form-floating-label'] +
                  (values.insurance_provider ? ' ' + styles['form-label--active'] : '')
                }
              >
                Insurance company name *
              </label>
              {insuranceFieldError('insurance_provider', 'Please enter your insurance company name.') && (
                <div className={styles['form-error']}>
                  {insuranceFieldError('insurance_provider', 'Please enter your insurance company name.')}
                </div>
              )}
            </div>

            <div className={styles['form-field']} style={{ gridColumn: '1 / span 2' }}>
              <input
                className={styles['form-input']}
                {...form.register('insurance_member_id')}
                id='insurance_member_id'
                autoComplete='off'
              />
              <label
                htmlFor='insurance_member_id'
                className={
                  styles['form-floating-label'] +
                  (values.insurance_member_id ? ' ' + styles['form-label--active'] : '')
                }
              >
                Member ID / Subscriber ID *
              </label>
              {insuranceFieldError(
                'insurance_member_id',
                'Please enter your member ID or subscriber ID.'
              ) && (
                <div className={styles['form-error']}>
                  {insuranceFieldError(
                    'insurance_member_id',
                    'Please enter your member ID or subscriber ID.'
                  )}
                </div>
              )}
            </div>

            <div className={styles['form-field']} style={{ gridColumn: '3 / span 2' }}>
              <input
                className={styles['form-input']}
                {...form.register('policy_number')}
                id='policy_number'
                autoComplete='off'
              />
              <label
                htmlFor='policy_number'
                className={
                  styles['form-floating-label'] +
                  (values.policy_number ? ' ' + styles['form-label--active'] : '')
                }
              >
                Group number (if applicable)
              </label>
            </div>

            <div className={styles['form-field']} style={{ gridColumn: '1 / span 4' }}>
              <label
                htmlFor='insurance_plan_type'
                style={{ display: 'block', fontSize: 14, color: '#555', marginBottom: 6 }}
              >
                Plan type *
              </label>
              <select
                id='insurance_plan_type'
                className={styles['form-input']}
                style={{ width: '100%', fontSize: 17 }}
                {...form.register('insurance_plan_type')}
              >
                <option value=''>Select plan type</option>
                {INSURANCE_PLAN_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {insuranceFieldError('insurance_plan_type', 'Please select a plan type.') && (
                <div className={styles['form-error']}>
                  {insuranceFieldError('insurance_plan_type', 'Please select a plan type.')}
                </div>
              )}
            </div>

            <div className={styles['form-field']} style={{ gridColumn: '1 / span 4' }}>
              <input
                className={styles['form-input']}
                {...form.register('insurance_phone_number')}
                id='insurance_phone_number'
                autoComplete='tel'
              />
              <label
                htmlFor='insurance_phone_number'
                className={
                  styles['form-floating-label'] +
                  (values.insurance_phone_number ? ' ' + styles['form-label--active'] : '')
                }
              >
                Insurance Phone Number (optional)
              </label>
            </div>

            <div
              className={styles['form-field']}
              style={{ gridColumn: '1 / span 4', marginTop: 4 }}
            >
              <label
                htmlFor='has_secondary_insurance'
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                  fontSize: 16,
                  color: '#222',
                }}
              >
                <input
                  id='has_secondary_insurance'
                  type='checkbox'
                  checked={!!hasSecondaryInsurance}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    form.setValue('has_secondary_insurance', checked);
                    if (!checked) {
                      form.setValue('secondary_insurance_provider', '');
                      form.setValue('secondary_insurance_member_id', '');
                      form.setValue('secondary_policy_number', '');
                    }
                  }}
                />
                Secondary Insurance?
              </label>
            </div>

            {hasSecondaryInsurance ? (
              <>
                <div className={styles['form-field']} style={{ gridColumn: '1 / span 4' }}>
                  <input
                    className={styles['form-input']}
                    {...form.register('secondary_insurance_provider')}
                    id='secondary_insurance_provider'
                    autoComplete='organization'
                  />
                  <label
                    htmlFor='secondary_insurance_provider'
                    className={
                      styles['form-floating-label'] +
                      (values.secondary_insurance_provider
                        ? ' ' + styles['form-label--active']
                        : '')
                    }
                  >
                    Secondary Provider *
                  </label>
                  {insuranceFieldError(
                    'secondary_insurance_provider',
                    'Please enter the secondary insurance provider.'
                  ) && (
                    <div className={styles['form-error']}>
                      {insuranceFieldError(
                        'secondary_insurance_provider',
                        'Please enter the secondary insurance provider.'
                      )}
                    </div>
                  )}
                </div>

                <div className={styles['form-field']} style={{ gridColumn: '1 / span 2' }}>
                  <input
                    className={styles['form-input']}
                    {...form.register('secondary_insurance_member_id')}
                    id='secondary_insurance_member_id'
                    autoComplete='off'
                  />
                  <label
                    htmlFor='secondary_insurance_member_id'
                    className={
                      styles['form-floating-label'] +
                      (values.secondary_insurance_member_id
                        ? ' ' + styles['form-label--active']
                        : '')
                    }
                  >
                    Secondary Member ID *
                  </label>
                  {insuranceFieldError(
                    'secondary_insurance_member_id',
                    'Please enter the secondary insurance member ID.'
                  ) && (
                    <div className={styles['form-error']}>
                      {insuranceFieldError(
                        'secondary_insurance_member_id',
                        'Please enter the secondary insurance member ID.'
                      )}
                    </div>
                  )}
                </div>

                <div className={styles['form-field']} style={{ gridColumn: '3 / span 2' }}>
                  <input
                    className={styles['form-input']}
                    {...form.register('secondary_policy_number')}
                    id='secondary_policy_number'
                    autoComplete='off'
                  />
                  <label
                    htmlFor='secondary_policy_number'
                    className={
                      styles['form-floating-label'] +
                      (values.secondary_policy_number
                        ? ' ' + styles['form-label--active']
                        : '')
                    }
                  >
                    Secondary Policy Number *
                  </label>
                  {insuranceFieldError(
                    'secondary_policy_number',
                    'Please enter the secondary policy number.'
                  ) && (
                    <div className={styles['form-error']}>
                      {insuranceFieldError(
                        'secondary_policy_number',
                        'Please enter the secondary policy number.'
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </>
        ) : null}
      </div>
      {needsInsuranceDetails ? (
        <div
          style={{
            color: '#666',
            fontSize: '0.95rem',
            marginTop: '-1rem',
            marginBottom: '1.5rem',
          }}
        >
          Please provide the insurance details exactly as they appear on the card.
        </div>
      ) : null}
      <div className={styles['step-buttons-row']}>
        <Button type='button' onClick={handleBack} disabled={step === 0}>
          Back
        </Button>
        <Button
          type='submit'
          onClick={() => handleNextStep()}
          disabled={form.formState.isSubmitting}
        >
          {step === totalSteps - 1 ? 'Submit' : 'Next'}
        </Button>
      </div>
    </div>
  );
}

export function Step10ClientDemographics({
  form,
  handleBack,
  handleNextStep,
  step,
  totalSteps,
}: any) {
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

  const handleFocus = (field: keyof typeof focus) =>
    setFocus((f) => ({ ...f, [field]: true }));
  const handleBlur = (field: keyof typeof focus) =>
    setFocus((f) => ({ ...f, [field]: false }));

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
  const ageOptions = ['Under 20', '20-25', '26-35', '36 and older'];
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
    if (err.message === 'Required.' || err.message === 'Required')
      return fallback;
    return err.message;
  };

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
      <div
        style={{
          color: '#757575',
          fontSize: '1.25rem',
          marginBottom: '2.5rem',
          maxWidth: 1200,
        }}
      >
        This section should be answered for the pregnant/primary parent only and
        is <b>OPTIONAL</b> (but we greatly appreciate it if you complete it.) We
        use this information for data collection to use for grant writing. The
        information collected is not connected to your name or personal
        information and your answers do not affect your matching or care with
        Sokana Collective
      </div>
      <div className={styles['form-grid']} style={{ alignItems: 'flex-start' }}>
        {/* Race/Ethnicity/Nationality */}
        <div
          className={styles['form-field']}
          style={{ gridColumn: '1 / span 2', position: 'relative' }}
        >
          <select
            className={styles['form-select']}
            {...form.register('race_ethnicity')}
            id='race_ethnicity'
            defaultValue=''
            onFocus={() => handleFocus('race_ethnicity')}
            onBlur={() => handleBlur('race_ethnicity')}
          >
            <option value='' disabled hidden></option>
            {raceOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <label
            htmlFor='race_ethnicity'
            className={
              styles['form-floating-label'] +
              (focus.race_ethnicity || values.race_ethnicity
                ? ' ' + styles['form-label--active']
                : '')
            }
          >
            Race/ethnicity/nationality (optional)
          </label>
          <span className={styles['form-select-arrow']}>▼</span>
          {errors.race_ethnicity && (
            <div className={styles['form-error']}>
              {getUserError(
                errors.race_ethnicity,
                'Please select your race/ethnicity/nationality.'
              )}
            </div>
          )}
        </div>
        {/* Primary Language */}
        <div
          className={styles['form-field']}
          style={{ gridColumn: '3 / span 2', position: 'relative' }}
        >
          <select
            className={styles['form-select']}
            {...form.register('primary_language')}
            id='primary_language'
            defaultValue=''
            onFocus={() => handleFocus('primary_language')}
            onBlur={() => handleBlur('primary_language')}
          >
            <option value='' disabled hidden></option>
            {languageOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <label
            htmlFor='primary_language'
            className={
              styles['form-floating-label'] +
              (focus.primary_language || values.primary_language
                ? ' ' + styles['form-label--active']
                : '')
            }
          >
            Primary Language (optional)
          </label>
          <span className={styles['form-select-arrow']}>▼</span>
          {errors.primary_language && (
            <div className={styles['form-error']}>
              {getUserError(
                errors.primary_language,
                'Please select your primary language.'
              )}
            </div>
          )}
        </div>
        {/* Client Age Range */}
        <div
          className={styles['form-field']}
          style={{ gridColumn: '1 / span 2', position: 'relative' }}
        >
          <select
            className={styles['form-select']}
            {...form.register('client_age_range')}
            id='client_age_range'
            defaultValue=''
            onFocus={() => handleFocus('client_age_range')}
            onBlur={() => handleBlur('client_age_range')}
          >
            <option value='' disabled hidden></option>
            {ageOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <label
            htmlFor='client_age_range'
            className={
              styles['form-floating-label'] +
              (focus.client_age_range || values.client_age_range
                ? ' ' + styles['form-label--active']
                : '')
            }
          >
            Client age range (optional)
          </label>
          <span className={styles['form-select-arrow']}>▼</span>
          {errors.client_age_range && (
            <div className={styles['form-error']}>
              {getUserError(
                errors.client_age_range,
                'Please select your age range.'
              )}
            </div>
          )}
        </div>
        {/* Medical Insurance Coverage */}
        <div
          className={styles['form-field']}
          style={{ gridColumn: '3 / span 2', position: 'relative' }}
        >
          <select
            className={styles['form-select']}
            {...form.register('insurance')}
            id='insurance'
            defaultValue=''
            onFocus={() => handleFocus('insurance')}
            onBlur={() => handleBlur('insurance')}
          >
            <option value='' disabled hidden></option>
            {insuranceOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <label
            htmlFor='insurance'
            className={
              styles['form-floating-label'] +
              (focus.insurance || values.insurance
                ? ' ' + styles['form-label--active']
                : '')
            }
          >
            Medical Insurance Coverage (optional)
          </label>
          <span className={styles['form-select-arrow']}>▼</span>
          {errors.insurance && (
            <div className={styles['form-error']}>
              {getUserError(
                errors.insurance,
                'Please select your medical insurance coverage.'
              )}
            </div>
          )}
        </div>
        {/* Multi-select: Please select all that apply */}
        <div
          className={`${styles['form-field']} demographics-multi-container`}
          style={{
            gridColumn: '1 / span 2',
            position: 'relative',
            height: 'auto',
            minHeight: 56,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          <div
            className={styles['form-input']}
            style={{
              display: 'flex',
              alignItems: selectedMulti.length === 0 ? 'center' : 'flex-start',
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
              padding:
                selectedMulti.length === 0 ? '16px 8px' : '22px 40px 6px 8px',
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
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                width: '100%',
                marginBottom: 6,
                minHeight: 48,
                maxHeight: 120,
                overflowY: selectedMulti.length > 2 ? 'auto' : 'visible',
                boxSizing: 'border-box',
              }}
            >
              {selectedMulti.map((opt: string) => (
                <span
                  key={opt}
                  style={{
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
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      maxWidth: 'calc(100% - 32px)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {opt}
                  </span>
                  <span
                    role='button'
                    aria-label={`Remove ${opt}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMultiSelect(opt);
                    }}
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
              <ArrowSVG
                color={
                  focus.demographics_multi
                    ? '#00bcd4'
                    : errors.demographics_multi
                      ? '#d32f2f'
                      : '#757575'
                }
              />
            </span>
          </div>
          <label
            className={
              styles['form-floating-label'] +
              (focus.demographics_multi || selectedMulti.length > 0
                ? ' ' + styles['form-label--active']
                : '')
            }
          >
            Please select all that apply (optional)
          </label>
          <div
            id='demographics-dropdown'
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
              .filter(
                (opt) => !selectedMulti.includes(opt) || opt === 'None apply'
              )
              .map((opt) => (
                <button
                  key={opt}
                  type='button'
                  onClick={() => handleMultiSelect(opt)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 16px',
                    margin: 0,
                    border: 'none',
                    background: selectedMulti.includes(opt)
                      ? '#f5f5f5'
                      : '#fff',
                    fontWeight: selectedMulti.includes(opt) ? 600 : 400,
                    color: selectedMulti.includes(opt) ? '#222' : '#444',
                    fontSize: 16,
                    cursor: 'pointer',
                    outline: 'none',
                    transition:
                      'background 0.15s, color 0.15s, font-weight 0.15s',
                  }}
                >
                  {opt}
                </button>
              ))}
          </div>
          {errors.demographics_multi && (
            <div className={styles['form-error']}>
              {getUserError(
                errors.demographics_multi,
                'Please select all that apply.'
              )}
            </div>
          )}
        </div>
        {/* Annual Household Income */}
        <div
          className={styles['form-field']}
          style={{
            gridColumn: '3 / span 2',
            position: 'relative',
            height: 'auto',
            minHeight: 56,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            marginTop: '2rem',
          }}
        >
          <select
            className={styles['form-select']}
            {...form.register('demographics_annual_income')}
            id='demographics_annual_income'
            defaultValue=''
            onFocus={() => handleFocus('demographics_annual_income')}
            onBlur={() => handleBlur('demographics_annual_income')}
          >
            <option value='' disabled hidden></option>
            {incomeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <label
            htmlFor='demographics_annual_income'
            className={
              styles['form-floating-label'] +
              (focus.demographics_annual_income ||
                values.demographics_annual_income
                ? ' ' + styles['form-label--active']
                : '')
            }
          >
            Annual Household Income (optional)
          </label>
          <span
            className={styles['form-select-arrow']}
            style={{
              color: focus.demographics_annual_income ? '#00bcd4' : '#757575',
            }}
          >
            ▼
          </span>
          {errors.demographics_annual_income && (
            <div className={styles['form-error']}>
              {getUserError(
                errors.demographics_annual_income,
                'Please select your annual household income.'
              )}
            </div>
          )}
        </div>
      </div>
      <div className={styles['step-buttons-row']}>
        <Button type='button' onClick={handleBack} disabled={step === 0}>
          Back
        </Button>
        <Button
          type='submit'
          onClick={() => handleNextStep()}
          disabled={form.formState.isSubmitting}
        >
          {step === totalSteps - 1 ? 'Submit' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
