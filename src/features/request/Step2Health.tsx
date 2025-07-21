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
}: any) {
  const values = form.getValues();
  const errors = form.formState.errors;
  const [focus, setFocus] = useState({
    address: false,
    city: false,
    state: false,
    zip_code: false,
    home_phone: false,
    home_type: false,
    home_access: false,
    pets: false,
  });
  const [homeTypeOpen, setHomeTypeOpen] = useState(false);

  const handleFocus = (field: keyof typeof focus) =>
    setFocus((f) => ({ ...f, [field]: true }));
  const handleBlur = (field: keyof typeof focus) =>
    setFocus((f) => ({ ...f, [field]: false }));

  const isStepValid = [
    'address',
    'city',
    'state',
    'zip_code',
    'home_phone',
    'home_type',
    'home_access',
    'pets',
  ].every((field) => !errors[field]);

  // Debug logs
  console.log('Step2Home values:', values);
  console.log('Step2Home errors:', errors);
  console.log('Step2Home isStepValid:', isStepValid);

  return (
    <div>
      <div className={styles['form-section-title']}>Home Details</div>
      <div className={styles['form-grid']}>
        {/* Address */}
        <div
          className={styles['form-field']}
          style={{ gridColumn: '1 / span 4' }}
        >
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
        {/* City */}
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
        {/* State/Province */}
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
              (focus.zip_code || values.zip_code
                ? ' ' + styles['form-label--active']
                : '')
            }
          >
            Zip
          </label>
        </div>
        {/* Phone */}
        <div
          className={styles['form-field']}
          style={{ gridColumn: '1 / span 2' }}
        >
          {errors.home_phone && (
            <div className={styles['form-error']} style={{ marginBottom: 6 }}>
              Please enter a phone number.
            </div>
          )}
          <input
            className={styles['form-input']}
            {...form.register('home_phone')}
            id='home_phone'
            autoComplete='off'
            onFocus={() => handleFocus('home_phone')}
            onBlur={() => handleBlur('home_phone')}
          />
          <label
            htmlFor='home_phone'
            className={
              styles['form-floating-label'] +
              (focus.home_phone || values.home_phone
                ? ' ' + styles['form-label--active']
                : '')
            }
          >
            Phone
          </label>
        </div>
        {/* Home Type (select) */}
        <div
          className={styles['form-field']}
          style={{ gridColumn: '3 / span 2', position: 'relative' }}
        >
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
            style={{
              left: 0,
              color: homeTypeOpen ? '#00bcd4' : undefined,
              right: 0,
              maxWidth: 'calc(100% - 36px)',
            }}
          >
            Home Type
          </label>
          <span
            className={styles['form-select-arrow']}
            style={{ color: homeTypeOpen ? '#00bcd4' : '#757575' }}
          >
            ▼
          </span>
        </div>
        {/* Home Access */}
        <div
          className={styles['form-field']}
          style={{ gridColumn: '1 / span 4' }}
        >
          {errors.home_access && (
            <div className={styles['form-error']} style={{ marginBottom: 6 }}>
              Please enter home access details.
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
        {/* Pets */}
        <div
          className={styles['form-field']}
          style={{ gridColumn: '1 / span 4' }}
        >
          {errors.pets && (
            <div className={styles['form-error']} style={{ marginBottom: 6 }}>
              Please enter pet details.
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
        <Button type='button' onClick={handleBack} disabled={step === 0}>
          Back
        </Button>
        <Button
          type='submit'
          onClick={() => handleNextStep()}
          disabled={!isStepValid || form.formState.isSubmitting}
        >
          {step === totalSteps - 1 ? 'Submit' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
