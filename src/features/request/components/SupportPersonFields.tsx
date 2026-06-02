import { useState } from 'react';
import { useWatch, type UseFormReturn } from 'react-hook-form';
import styles from '../RequestForm.module.scss';
import type { RequestFormInput } from '../useRequestForm';
import {
  SUPPORT_PERSON_PRONOUN_OPTIONS,
  SUPPORT_PERSON_RELATIONSHIP_OPTIONS,
  SUPPORT_PERSON_SECTION_LABEL,
} from '../supportPersonOptions';

function hasFilledFloatingValue(v: unknown): boolean {
  if (v === undefined || v === null) return false;
  if (typeof v === 'number') return !Number.isNaN(v);
  return String(v).trim() !== '';
}

type SupportPersonFieldsProps = {
  form: UseFormReturn<RequestFormInput>;
};

export function SupportPersonFields({ form }: SupportPersonFieldsProps) {
  const errors = form.formState.errors;

  const [
    wRelationship,
    wFirst,
    wLast,
    wPronouns,
    wMiddle,
    wEmail,
    wMobile,
  ] =
    useWatch({
      control: form.control,
      name: [
        'relationship_status',
        'first_name',
        'last_name',
        'family_pronouns',
        'middle_name',
        'family_email',
        'mobile_phone',
      ] as const,
    }) ?? ['', '', '', '', '', '', ''];

  const [focus, setFocus] = useState({
    relationship_status: false,
    first_name: false,
    last_name: false,
    family_pronouns: false,
    middle_name: false,
    family_email: false,
    mobile_phone: false,
  });
  const [relationshipOpen, setRelationshipOpen] = useState(false);
  const [pronounsOpen, setPronounsOpen] = useState(false);

  const handleFocus = (field: keyof typeof focus) =>
    setFocus((f) => ({ ...f, [field]: true }));
  const handleBlur = (field: keyof typeof focus) => {
    const v = form.getValues(field);
    setFocus((f) => ({ ...f, [field]: hasFilledFloatingValue(v) }));
  };

  return (
    <>
      <p
        className={
          styles['form-floating-label'] + ' ' + styles['form-label--active']
        }
        style={{
          position: 'static',
          transform: 'none',
          marginBottom: 8,
          marginTop: 8,
          color: '#757575',
          width: '100%',
          gridColumn: '1 / -1',
        }}
      >
        {SUPPORT_PERSON_SECTION_LABEL}
      </p>

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
          {SUPPORT_PERSON_RELATIONSHIP_OPTIONS.map((opt) => (
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

      <div className={styles['form-field']}>
        <input
          className={styles['form-input']}
          {...form.register('first_name')}
          id='first_name'
          autoComplete='off'
          onFocus={() => handleFocus('first_name')}
          onBlur={() => handleBlur('first_name')}
        />
        <label
          htmlFor='first_name'
          className={
            styles['form-floating-label'] +
            (focus.first_name || hasFilledFloatingValue(wFirst)
              ? ' ' + styles['form-label--active']
              : '')
          }
        >
          First Name
        </label>
        {errors.first_name && (
          <div className={styles['form-error']}>
            {errors.first_name.message as string}
          </div>
        )}
      </div>

      <div className={styles['form-field']}>
        <input
          className={styles['form-input']}
          {...form.register('last_name')}
          id='last_name'
          autoComplete='off'
          onFocus={() => handleFocus('last_name')}
          onBlur={() => handleBlur('last_name')}
        />
        <label
          htmlFor='last_name'
          className={
            styles['form-floating-label'] +
            (focus.last_name || hasFilledFloatingValue(wLast)
              ? ' ' + styles['form-label--active']
              : '')
          }
        >
          Last Name
        </label>
        {errors.last_name && (
          <div className={styles['form-error']}>
            {errors.last_name.message as string}
          </div>
        )}
      </div>

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
          {SUPPORT_PERSON_PRONOUN_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <label
          htmlFor='family_pronouns'
          className={
            styles['form-floating-label'] +
            (focus.family_pronouns || hasFilledFloatingValue(wPronouns)
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

      <div className={styles['form-field']}>
        <input
          className={styles['form-input']}
          {...form.register('middle_name')}
          id='middle_name'
          autoComplete='off'
          onFocus={() => handleFocus('middle_name')}
          onBlur={() => handleBlur('middle_name')}
        />
        <label
          htmlFor='middle_name'
          className={
            styles['form-floating-label'] +
            (focus.middle_name || hasFilledFloatingValue(wMiddle)
              ? ' ' + styles['form-label--active']
              : '')
          }
        >
          Middle Name
        </label>
        {errors.middle_name && (
          <div className={styles['form-error']}>
            {errors.middle_name.message as string}
          </div>
        )}
      </div>

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
            (focus.family_email || hasFilledFloatingValue(wEmail)
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

      <div className={styles['form-field']}>
        <input
          className={styles['form-input']}
          {...form.register('mobile_phone')}
          id='mobile_phone'
          autoComplete='off'
          onFocus={() => handleFocus('mobile_phone')}
          onBlur={() => handleBlur('mobile_phone')}
        />
        <label
          htmlFor='mobile_phone'
          className={
            styles['form-floating-label'] +
            (focus.mobile_phone || hasFilledFloatingValue(wMobile)
              ? ' ' + styles['form-label--active']
              : '')
          }
        >
          Mobile phone
        </label>
        {errors.mobile_phone && (
          <div className={styles['form-error']}>
            {errors.mobile_phone.message as string}
          </div>
        )}
      </div>
    </>
  );
}
