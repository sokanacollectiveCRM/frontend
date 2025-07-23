import { Button } from '@/common/components/ui/button';
import { useState } from 'react';
import styles from './RequestForm.module.scss';

const homeTypeOptions = ['House', 'Condo', 'Apartment', 'Shelter', 'Other'];

export function Step2Home({
  form,
  handleBack,
  handleNextStep,
  step,
  totalSteps,
  isDesktopOrTablet = false,
}: any) {
  const values = form.getValues();
  const errors = form.formState.errors;
  const [focus, setFocus] = useState({
    address: !!values.address,
    city: !!values.city,
    state: !!values.state,
    zip_code: !!values.zip_code,
    home_type: !!values.home_type,
    home_access: !!values.home_access,
    pets: !!values.pets,
  });
  const [homeTypeOpen, setHomeTypeOpen] = useState(false);

  const handleFocus = (field: keyof typeof focus) =>
    setFocus((f) => ({ ...f, [field]: true }));
  const handleBlur = (field: keyof typeof focus) => {
    const currentValue = values[field];
    setFocus((f) => ({ ...f, [field]: !!currentValue }));
  };

  const isStepValid = [
    'address',
    'city',
    'state',
    'zip_code',
    'home_type',
    'home_access',
    'pets',
  ].every((field) => !errors[field]);

  // Debug logs
  console.log('Step2Home values:', values);
  console.log('Step2Home errors:', errors);
  console.log('Step2Home isStepValid:', isStepValid);
  console.log('Step2Home isDesktopOrTablet:', isDesktopOrTablet);

  return (
    <div className={styles['step-2-home']}>
      <div className={styles['form-section-title']}>Home Details</div>
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
              (focus.address || values.address
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
            {/* City */}
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
                  (focus.city || values.city
                    ? ' ' + styles['form-label--active']
                    : '')
                }
              >
                City
              </label>
            </div>
            {/* State/Province */}
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
                  (focus.state || values.state
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
            {/* City - Mobile */}
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
                  (focus.city || values.city
                    ? ' ' + styles['form-label--active']
                    : '')
                }
              >
                City
              </label>
            </div>

            {/* State/Province - Mobile */}
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
                  (focus.state || values.state
                    ? ' ' + styles['form-label--active']
                    : '')
                }
              >
                State/Province
              </label>
            </div>
          </>
        )}

        {/* Zip and Home Type Row - Desktop Only */}
        {isDesktopOrTablet ? (
          <div style={{ display: 'flex', gap: '1rem', width: '100%', marginBottom: '1rem' }}>
            {/* Zip Code */}
            <div className={styles['form-field']} style={{ flex: 1 }}>
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
                  (focus.zip_code || values.zip_code
                    ? ' ' + styles['form-label--active']
                    : '')
                }
              >
                Zip
              </label>
            </div>

            {/* Home Type (select) */}
            <div className={styles['form-field']} style={{ flex: 1 }}>
              {errors.home_type && (
                <div className={styles['form-error']} style={{ marginBottom: 6 }}>
                  Please select a home type.
                </div>
              )}
              <select
                className={styles['form-select']}
                {...form.register('home_type')}
                id='home_type'
                defaultValue=''
                onFocus={() => {
                  handleFocus('home_type');
                  setHomeTypeOpen(true);
                }}
                onBlur={() => {
                  handleBlur('home_type');
                  setHomeTypeOpen(false);
                }}
              >
                <option value='' disabled hidden></option>
                {homeTypeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <label
                htmlFor='home_type'
                className={
                  styles['form-floating-label'] +
                  (focus.home_type || values.home_type
                    ? ' ' + styles['form-label--active']
                    : '')
                }
              >
                Home Type
              </label>
              <div className={styles['form-select-arrow']}>
                <svg
                  width='18'
                  height='18'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M7 10l5 5 5-5'
                    stroke='#757575'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Zip Code - Mobile */}
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
                  (focus.zip_code || values.zip_code
                    ? ' ' + styles['form-label--active']
                    : '')
                }
              >
                Zip
              </label>
            </div>

            {/* Home Type (select) - Mobile */}
            <div className={styles['form-field']}>
              {errors.home_type && (
                <div className={styles['form-error']} style={{ marginBottom: 6 }}>
                  Please select a home type.
                </div>
              )}
              <select
                className={styles['form-select']}
                {...form.register('home_type')}
                id='home_type'
                defaultValue=''
                onFocus={() => {
                  handleFocus('home_type');
                  setHomeTypeOpen(true);
                }}
                onBlur={() => {
                  handleBlur('home_type');
                  setHomeTypeOpen(false);
                }}
              >
                <option value='' disabled hidden></option>
                {homeTypeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <label
                htmlFor='home_type'
                className={
                  styles['form-floating-label'] +
                  (focus.home_type || values.home_type
                    ? ' ' + styles['form-label--active']
                    : '')
                }
              >
                Home Type
              </label>
              <div className={styles['form-select-arrow']}>
                <svg
                  width='18'
                  height='18'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M7 10l5 5 5-5'
                    stroke='#757575'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </div>
            </div>
          </>
        )}

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
              (focus.home_access || values.home_access
                ? ' ' + styles['form-label--active']
                : '')
            }
          >
            Home Access
          </label>
        </div>

        {/* Pets - Full Width */}
        <div className={styles['form-field']}>
          {errors.pets && (
            <div className={styles['form-error']} style={{ marginBottom: 6 }}>
              Please describe pets.
            </div>
          )}
          <input
            className={styles['form-input']}
            {...form.register('pets')}
            id='pets'
            autoComplete='off'
            onFocus={() => handleFocus('pets')}
            onBlur={() => handleBlur('pets')}
          />
          <label
            htmlFor='pets'
            className={
              styles['form-floating-label'] +
              (focus.pets || values.pets
                ? ' ' + styles['form-label--active']
                : '')
            }
          >
            Pets
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
          disabled={!isStepValid}
          style={{ marginLeft: 'auto' }}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
