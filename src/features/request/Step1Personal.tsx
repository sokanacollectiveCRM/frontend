import { Button } from '@/common/components/ui/button';
import { useState } from 'react';
import styles from './RequestForm.module.scss';
import { stepFields } from './useRequestForm';

function ArrowSVG({ color = '#757575' }: { color?: string }) {
  return (
    <svg
      width='18'
      height='18'
      viewBox='0 0 24 24'
      style={{ display: 'block' }}
    >
      <polygon points='7,10 12,15 17,10' fill={color} />
    </svg>
  );
}

type FocusField =
  | 'firstname'
  | 'lastname'
  | 'email'
  | 'phone_number'
  | 'preferred_contact_method'
  | 'pronouns'
  | 'preferred_name'
  | 'pregnancy_number'
  | 'birth_hospital';

export function Step1Personal({
  form,
  control,
  handleBack,
  handleNextStep,
  step,
  totalSteps,
  isDesktopOrTablet = false,
}: any) {
  const values = form.getValues();
  const errors = form.formState.errors;
  // Floating label focus state
  const [focus, setFocus] = useState<Record<FocusField, boolean>>({
    firstname: false,
    lastname: false,
    email: false,
    phone_number: false,
    preferred_contact_method: false,
    pronouns: false,
    preferred_name: false,
    pregnancy_number: false,
    birth_hospital: false,
  });
  // Select open state
  const [pronounsOpen, setPronounsOpen] = useState(false);
  const [pcmOpen, setPcmOpen] = useState(false);

  const handleFocus = (field: FocusField) =>
    setFocus((f) => ({ ...f, [field]: true }));
  const handleBlur = (field: FocusField) =>
    setFocus((f) => ({ ...f, [field]: false }));

  // Arrow color logic
  const getArrowColor = (field: FocusField) => {
    if (errors[field]) return '#d32f2f';
    if (focus[field]) return '#00897b';
    return '#757575';
  };

  // Add debug logs
  console.log('Step1Personal values:', values);
  console.log('Step1Personal errors:', errors);
  console.log('Step1Personal isValid:', form.formState.isValid);

  // Only disable Next if any field in the current step has an error
  const isStepValid = stepFields[step].every((field) => !errors[field]);

  return (
    <div>
      <div className={styles['form-section-title']}>Client Details</div>
      <div className={styles['form-grid']}>
        {/* First Row */}
        <div className={styles['form-field']}>
          {isDesktopOrTablet && <label htmlFor='firstname' className={styles['form-floating-label']}>First Name</label>}
          <input
            className={styles['form-input']}
            {...form.register('firstname')}
            id='firstname'
            autoComplete='off'
            onFocus={() => handleFocus('firstname')}
            onBlur={() => handleBlur('firstname')}
          />
          {!isDesktopOrTablet && (
            <label
              htmlFor='firstname'
              className={
                styles['form-floating-label'] +
                (focus.firstname || values.firstname
                  ? ' ' + styles['form-label--active']
                  : '')
              }
            >
              First Name
            </label>
          )}
          {errors.firstname && (
            <div className={styles['form-error']} style={{ marginBottom: 6 }}>
              Please enter your first name.
            </div>
          )}
        </div>
        <div className={styles['form-field']}>
          {isDesktopOrTablet && <label htmlFor='lastname' className={styles['form-floating-label']}>Last Name</label>}
          <input
            className={styles['form-input']}
            {...form.register('lastname')}
            id='lastname'
            autoComplete='off'
            onFocus={() => handleFocus('lastname')}
            onBlur={() => handleBlur('lastname')}
          />
          {!isDesktopOrTablet && (
            <label
              htmlFor='lastname'
              className={
                styles['form-floating-label'] +
                (focus.lastname || values.lastname
                  ? ' ' + styles['form-label--active']
                  : '')
              }
            >
              Last Name
            </label>
          )}
          {errors.lastname && (
            <div className={styles['form-error']} style={{ marginBottom: 6 }}>
              Please enter your last name.
            </div>
          )}
        </div>
        <div className={styles['form-field']}>
          {isDesktopOrTablet && <label htmlFor='email' className={styles['form-floating-label']}>Email</label>}
          <input
            className={styles['form-input']}
            {...form.register('email')}
            id='email'
            autoComplete='off'
            type='email'
            onFocus={() => handleFocus('email')}
            onBlur={() => handleBlur('email')}
          />
          {!isDesktopOrTablet && (
            <label
              htmlFor='email'
              className={
                styles['form-floating-label'] +
                (focus.email || values.email
                  ? ' ' + styles['form-label--active']
                  : '')
              }
            >
              Email
            </label>
          )}
          {errors.email && (
            <div className={styles['form-error']} style={{ marginBottom: 6 }}>
              Please enter your email address.
            </div>
          )}
        </div>
        <div className={styles['form-field']}>
          {isDesktopOrTablet && <label htmlFor='phone_number' className={styles['form-floating-label']}>Mobile phone</label>}
          <input
            className={styles['form-input']}
            {...form.register('phone_number')}
            id='phone_number'
            autoComplete='off'
            onFocus={() => handleFocus('phone_number')}
            onBlur={() => handleBlur('phone_number')}
          />
          {!isDesktopOrTablet && (
            <label
              htmlFor='phone_number'
              className={
                styles['form-floating-label'] +
                (focus.phone_number || values.phone_number
                  ? ' ' + styles['form-label--active']
                  : '')
              }
            >
              Mobile phone
            </label>
          )}
          {errors.phone_number && (
            <div className={styles['form-error']} style={{ marginBottom: 6 }}>
              Please enter your mobile phone number.
            </div>
          )}
        </div>
        {/* Second Row */}
        <div className={styles['form-field']} style={{ position: 'relative' }}>
          {isDesktopOrTablet && <label htmlFor='preferred_contact_method' className={styles['form-floating-label']}>Preferred contact method</label>}
          <select
            className={styles['form-select']}
            style={{ paddingRight: 36 }}
            {...form.register('preferred_contact_method')}
            id='preferred_contact_method'
            defaultValue=''
            onFocus={() => {
              handleFocus('preferred_contact_method');
              setPcmOpen(true);
            }}
            onBlur={() => {
              handleBlur('preferred_contact_method');
              setPcmOpen(false);
            }}
          >
            <option value='' disabled hidden></option>
            <option value='Phone'>Phone</option>
            <option value='Email'>Email</option>
          </select>
          {!isDesktopOrTablet && (
            <label
              htmlFor='preferred_contact_method'
              className={
                styles['form-floating-label'] +
                (focus.preferred_contact_method || values.preferred_contact_method
                  ? ' ' + styles['form-label--active']
                  : '')
              }
              style={{
                left: 0,
                color: pcmOpen ? '#00bcd4' : undefined,
                right: 0,
                maxWidth: 'calc(100% - 36px)',
              }}
            >
              Preferred contact method
            </label>
          )}
          <span
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              height: 18,
            }}
          >
            <ArrowSVG color={getArrowColor('preferred_contact_method')} />
          </span>
          {errors.preferred_contact_method && (
            <div className={styles['form-error']}>
              {errors.preferred_contact_method.message as string}
            </div>
          )}
        </div>
        <div className={styles['form-field']} style={{ position: 'relative' }}>
          {isDesktopOrTablet && <label htmlFor='pronouns' className={styles['form-floating-label']}>Pronouns</label>}
          <select
            className={styles['form-select']}
            style={{ paddingRight: 36 }}
            {...form.register('pronouns')}
            id='pronouns'
            defaultValue=''
            onFocus={() => {
              handleFocus('pronouns');
              setPronounsOpen(true);
            }}
            onBlur={() => {
              handleBlur('pronouns');
              setPronounsOpen(false);
            }}
          >
            <option value='' disabled hidden></option>
            <option value='She/Her'>She/Her</option>
            <option value='He/Him'>He/Him</option>
            <option value='They/Them'>They/Them</option>
            <option value='Ze/Hir/Zir'>Ze/Hir/Zir</option>
            <option value='None'>None</option>
            <option value='Other'>Other</option>
          </select>
          {!isDesktopOrTablet && (
            <label
              htmlFor='pronouns'
              className={
                styles['form-floating-label'] +
                (focus.pronouns || values.pronouns
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
          )}
          <span
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              height: 18,
            }}
          >
            <ArrowSVG color={getArrowColor('pronouns')} />
          </span>
          {errors.pronouns && (
            <div className={styles['form-error']}>
              {errors.pronouns.message as string}
            </div>
          )}
        </div>
        <div className={styles['form-field']}>
          {isDesktopOrTablet && <label htmlFor='preferred_name' className={styles['form-floating-label']}>Preferred name</label>}
          <input
            className={styles['form-input']}
            {...form.register('preferred_name')}
            id='preferred_name'
            autoComplete='off'
            onFocus={() => handleFocus('preferred_name')}
            onBlur={() => handleBlur('preferred_name')}
          />
          {!isDesktopOrTablet && (
            <label
              htmlFor='preferred_name'
              className={
                styles['form-floating-label'] +
                (focus.preferred_name || values.preferred_name
                  ? ' ' + styles['form-label--active']
                  : '')
              }
            >
              Preferred name
            </label>
          )}
          {errors.preferred_name && (
            <div className={styles['form-error']}>
              {errors.preferred_name.message as string}
            </div>
          )}
        </div>
        {/* For the pregnancy number input field */}
        {/* For hospital/birth center input field */}
        <div />
      </div>
      <div className={styles['step-buttons-row']}>
        <Button type='button' onClick={handleBack} disabled={step === 0}>
          Back
        </Button>
        <Button
          type='submit'
          onClick={() => {
            console.log('handleNextStep called');
            handleNextStep();
          }}
          disabled={!isStepValid || form.formState.isSubmitting}
        >
          {step === totalSteps - 1 ? 'Submit' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
