import { Button } from '@/common/components/ui/button';
import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import {
  HOME_TYPE_OPTIONS,
  HOME_TYPE_OTHER_VALUE,
  toggleHomeTypeSelection,
} from './homeTypeOptions';
import styles from './RequestForm.module.scss';

function hasFilledValue(v: unknown): boolean {
  if (v === undefined || v === null) return false;
  if (typeof v === 'number') return !Number.isNaN(v);
  if (Array.isArray(v)) return v.length > 0;
  return String(v).trim() !== '';
}

function HomeTypeField({
  form,
  errors,
  focus,
  handleFocus,
  handleBlur,
}: {
  form: any;
  errors: any;
  focus: { home_type: boolean; home_type_other: boolean };
  handleFocus: (field: 'home_type' | 'home_type_other') => void;
  handleBlur: (field: 'home_type' | 'home_type_other') => void;
}) {
  const selectedHomeTypes = useWatch({
    control: form.control,
    name: 'home_type',
  }) as string[] | undefined;
  const homeTypeOther = useWatch({
    control: form.control,
    name: 'home_type_other',
  });
  const selected = selectedHomeTypes ?? [];
  const isOtherSelected = selected.includes(HOME_TYPE_OTHER_VALUE);

  const handleToggle = (option: string) => {
    const updated = toggleHomeTypeSelection(selected, option);
    form.setValue('home_type', updated, { shouldValidate: true });
    if (option === HOME_TYPE_OTHER_VALUE && !updated.includes(HOME_TYPE_OTHER_VALUE)) {
      form.setValue('home_type_other', '', { shouldValidate: true });
    }
  };

  return (
    <div className={styles['form-field']} style={{ width: '100%' }}>
      <p
        className={
          styles['form-floating-label'] + ' ' + styles['form-label--active']
        }
        style={{
          position: 'static',
          transform: 'none',
          marginBottom: 8,
          color: errors.home_type_other ? '#d32f2f' : '#757575',
        }}
      >
        Home type (check all that apply)
      </p>
      <div
        role='group'
        aria-label='Home type'
        style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        onFocus={() => handleFocus('home_type')}
        onBlur={() => handleBlur('home_type')}
      >
        {HOME_TYPE_OPTIONS.map((opt) => (
          <label
            key={opt}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              fontSize: '16px',
              cursor: 'pointer',
              gap: 12,
              margin: 0,
            }}
          >
            <input
              type='checkbox'
              checked={selected.includes(opt)}
              onChange={() => handleToggle(opt)}
              style={{
                width: 20,
                height: 20,
                accentColor: selected.includes(opt) ? '#d32f2f' : '#bdbdbd',
                marginTop: 2,
                flexShrink: 0,
              }}
            />
            <span style={{ lineHeight: 1.35 }}>{opt}</span>
          </label>
        ))}
      </div>
      {isOtherSelected && (
        <div style={{ marginTop: 16 }}>
          {errors.home_type_other && (
            <div className={styles['form-error']} style={{ marginBottom: 6 }}>
              {(errors.home_type_other.message as string) ||
                'Please describe your housing situation.'}
            </div>
          )}
          <input
            className={styles['form-input']}
            {...form.register('home_type_other')}
            id='home_type_other'
            autoComplete='off'
            placeholder='Please describe'
            onFocus={() => handleFocus('home_type_other')}
            onBlur={() => handleBlur('home_type_other')}
          />
          <label
            htmlFor='home_type_other'
            className={
              styles['form-floating-label'] +
              (focus.home_type_other || hasFilledValue(homeTypeOther)
                ? ' ' + styles['form-label--active']
                : '')
            }
          >
            Please describe your housing situation *
          </label>
        </div>
      )}
    </div>
  );
}

export function Step2Home({
  form,
  handleBack,
  handleNextStep,
  step,
  totalSteps,
  isDesktopOrTablet = false,
}: any) {
  const errors = form.formState.errors;

  const [wAddress, wCity, wState, wZip, wHomeAccess, wPets] =
    useWatch({
      control: form.control,
      name: ['address', 'city', 'state', 'zip_code', 'home_access', 'pets'] as const,
    }) ?? ['', '', '', '', '', ''];

  const [focus, setFocus] = useState({
    address: false,
    city: false,
    state: false,
    zip_code: false,
    home_type: false,
    home_type_other: false,
    home_access: false,
    pets: false,
  });

  const handleFocus = (field: keyof typeof focus) =>
    setFocus((f) => ({ ...f, [field]: true }));
  const handleBlur = (field: keyof typeof focus) => {
    const currentValue = form.getValues(field);
    setFocus((f) => ({ ...f, [field]: hasFilledValue(currentValue) }));
  };

  const isStepValid = [
    'address',
    'city',
    'state',
    'zip_code',
    'home_type',
    'home_type_other',
    'home_access',
    'pets',
  ].every((field) => !errors[field]);

  const homeTypeFieldProps = {
    form,
    errors,
    focus,
    handleFocus,
    handleBlur,
  };

  return (
    <div className={styles['step-2-home']}>
      <div className={styles['form-grid']}>
        {/* Address - Full Width */}
        <div className={styles['form-field']}>
          {errors.address && (
            <div className={styles['form-error']} style={{ marginBottom: 6 }}>
              Please add a complete address.
            </div>
          )}
          <input
            className={styles['form-input']}
            {...form.register('address')}
            id='address'
            autoComplete='off'
            onFocus={() => handleFocus('address')}
            onBlur={() => handleBlur('address')}
          />
          <label
            htmlFor='address'
            className={
              styles['form-floating-label'] +
              (focus.address || hasFilledValue(wAddress)
                ? ' ' + styles['form-label--active']
                : '')
            }
          >
            Address
          </label>
        </div>

        {/* City and State Row - Desktop Only */}
        {isDesktopOrTablet ? (
          <div style={{ display: 'flex', gap: '1rem', width: '100%', marginBottom: '1rem' }}>
            <div className={styles['form-field']} style={{ flex: 1 }}>
              {errors.city && (
                <div className={styles['form-error']} style={{ marginBottom: 6 }}>
                  Please enter a city.
                </div>
              )}
              <input
                className={styles['form-input']}
                {...form.register('city')}
                id='city'
                autoComplete='off'
                onFocus={() => handleFocus('city')}
                onBlur={() => handleBlur('city')}
              />
              <label
                htmlFor='city'
                className={
                  styles['form-floating-label'] +
                  (focus.city || hasFilledValue(wCity)
                    ? ' ' + styles['form-label--active']
                    : '')
                }
              >
                City
              </label>
            </div>
            <div className={styles['form-field']} style={{ flex: 1 }}>
              {errors.state && (
                <div className={styles['form-error']} style={{ marginBottom: 6 }}>
                  Please enter a state/province.
                </div>
              )}
              <input
                className={styles['form-input']}
                {...form.register('state')}
                id='state'
                autoComplete='off'
                onFocus={() => handleFocus('state')}
                onBlur={() => handleBlur('state')}
              />
              <label
                htmlFor='state'
                className={
                  styles['form-floating-label'] +
                  (focus.state || hasFilledValue(wState)
                    ? ' ' + styles['form-label--active']
                    : '')
                }
              >
                State/Province
              </label>
            </div>
          </div>
        ) : (
          <>
            <div className={styles['form-field']}>
              {errors.city && (
                <div className={styles['form-error']} style={{ marginBottom: 6 }}>
                  Please enter a city.
                </div>
              )}
              <input
                className={styles['form-input']}
                {...form.register('city')}
                id='city'
                autoComplete='off'
                onFocus={() => handleFocus('city')}
                onBlur={() => handleBlur('city')}
              />
              <label
                htmlFor='city'
                className={
                  styles['form-floating-label'] +
                  (focus.city || hasFilledValue(wCity)
                    ? ' ' + styles['form-label--active']
                    : '')
                }
              >
                City
              </label>
            </div>

            <div className={styles['form-field']}>
              {errors.state && (
                <div className={styles['form-error']} style={{ marginBottom: 6 }}>
                  Please enter a state/province.
                </div>
              )}
              <input
                className={styles['form-input']}
                {...form.register('state')}
                id='state'
                autoComplete='off'
                onFocus={() => handleFocus('state')}
                onBlur={() => handleBlur('state')}
              />
              <label
                htmlFor='state'
                className={
                  styles['form-floating-label'] +
                  (focus.state || hasFilledValue(wState)
                    ? ' ' + styles['form-label--active']
                    : '')
                }
              >
                State/Province
              </label>
            </div>
          </>
        )}

        {/* Zip Code */}
        <div className={styles['form-field']}>
          {errors.zip_code && (
            <div className={styles['form-error']} style={{ marginBottom: 6 }}>
              Please enter a zip code.
            </div>
          )}
          <input
            className={styles['form-input']}
            {...form.register('zip_code')}
            id='zip_code'
            autoComplete='off'
            onFocus={() => handleFocus('zip_code')}
            onBlur={() => handleBlur('zip_code')}
          />
          <label
            htmlFor='zip_code'
            className={
              styles['form-floating-label'] +
              (focus.zip_code || hasFilledValue(wZip)
                ? ' ' + styles['form-label--active']
                : '')
            }
          >
            Zip
          </label>
        </div>

        <HomeTypeField {...homeTypeFieldProps} />

        {/* Home Access - Full Width */}
        <div className={styles['form-field']}>
          {errors.home_access && (
            <div className={styles['form-error']} style={{ marginBottom: 6 }}>
              Please describe home access.
            </div>
          )}
          <input
            className={styles['form-input']}
            {...form.register('home_access')}
            id='home_access'
            autoComplete='off'
            onFocus={() => handleFocus('home_access')}
            onBlur={() => handleBlur('home_access')}
          />
          <label
            htmlFor='home_access'
            className={
              styles['form-floating-label'] +
              (focus.home_access || hasFilledValue(wHomeAccess)
                ? ' ' + styles['form-label--active']
                : '')
            }
          >
            Home Access
          </label>
        </div>

        {/* Pets / Animals in Home - Full Width (required) */}
        <div className={styles['form-field']}>
          {errors.pets && (
            <div className={styles['form-error']} style={{ marginBottom: 6 }}>
              {(errors.pets.message as string) ||
                'Please list the types of any pets/animals that are in the home.'}
            </div>
          )}
          <input
            className={styles['form-input']}
            {...form.register('pets')}
            id='pets'
            autoComplete='off'
            aria-required='true'
            onFocus={() => handleFocus('pets')}
            onBlur={() => handleBlur('pets')}
          />
          <label
            htmlFor='pets'
            className={
              styles['form-floating-label'] +
              (focus.pets || hasFilledValue(wPets)
                ? ' ' + styles['form-label--active']
                : '')
            }
            style={{ left: 0, right: 0, maxWidth: 'calc(100% - 36px)' }}
          >
            Please list the types of any pets/animals that are in the home. *
          </label>
        </div>
      </div>

      <div className={styles['step-buttons-row']}>
        <Button
          type='button'
          onClick={handleBack}
          className={styles['step-button']}
          style={{ marginRight: 'auto' }}
        >
          Back
        </Button>
        <Button
          type='button'
          onClick={handleNextStep}
          className={styles['step-button']}
          disabled={form.formState.isSubmitting}
          style={{ marginLeft: 'auto' }}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
