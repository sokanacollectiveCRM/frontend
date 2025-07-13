import { Button } from '@/common/components/ui/button';
import { useState } from 'react';
import styles from './RequestForm.module.scss';

const homeTypeOptions = [
  'House',
  'Condo',
  'Apartment',
  'Shelter',
  'Other',
];

export function Step2Home({ form, control, handleBack, handleNextStep, step, totalSteps }: any) {
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

  const handleFocus = (field: keyof typeof focus) => setFocus(f => ({ ...f, [field]: true }));
  const handleBlur = (field: keyof typeof focus) => setFocus(f => ({ ...f, [field]: false }));

  const isStepValid = [
    'address', 'city', 'state', 'zip_code', 'home_phone', 'home_type', 'home_access', 'pets'
  ].every(field => !errors[field]);

  // Debug logs
  console.log('Step2Home values:', values);
  console.log('Step2Home errors:', errors);
  console.log('Step2Home isStepValid:', isStepValid);

  return (
    <div>
      <div className={styles['form-section-title']}>Home Details</div>
      <div className={styles['form-grid']}>
        {/* Address */}
        <div className={styles['form-field']} style={{ gridColumn: '1 / span 4' }}>
          <input
            className={styles['form-input']}
            {...form.register('address')}
            id="address"
            autoComplete="off"
            onFocus={() => handleFocus('address')}
            onBlur={() => handleBlur('address')}
          />
          <label
            htmlFor="address"
            className={
              styles['form-floating-label'] +
              ((focus.address || values.address) ? ' ' + styles['form-label--active'] : '')
            }
          >
            Address
          </label>
          {errors.address && <div className={styles['form-error']}>{errors.address.message as string}</div>}
        </div>
        {/* City */}
        <div className={styles['form-field']}>
          <input
            className={styles['form-input']}
            {...form.register('city')}
            id="city"
            autoComplete="off"
            onFocus={() => handleFocus('city')}
            onBlur={() => handleBlur('city')}
          />
          <label
            htmlFor="city"
            className={
              styles['form-floating-label'] +
              ((focus.city || values.city) ? ' ' + styles['form-label--active'] : '')
            }
          >
            City
          </label>
          {errors.city && <div className={styles['form-error']}>{errors.city.message as string}</div>}
        </div>
        {/* State/Province */}
        <div className={styles['form-field']}>
          <input
            className={styles['form-input']}
            {...form.register('state')}
            id="state"
            autoComplete="off"
            onFocus={() => handleFocus('state')}
            onBlur={() => handleBlur('state')}
          />
          <label
            htmlFor="state"
            className={
              styles['form-floating-label'] +
              ((focus.state || values.state) ? ' ' + styles['form-label--active'] : '')
            }
          >
            State/Province
          </label>
          {errors.state && <div className={styles['form-error']}>{errors.state.message as string}</div>}
        </div>
        {/* Zip Code */}
        <div className={styles['form-field']}>
          <input
            className={styles['form-input']}
            {...form.register('zip_code')}
            id="zip_code"
            autoComplete="off"
            onFocus={() => handleFocus('zip_code')}
            onBlur={() => handleBlur('zip_code')}
          />
          <label
            htmlFor="zip_code"
            className={
              styles['form-floating-label'] +
              ((focus.zip_code || values.zip_code) ? ' ' + styles['form-label--active'] : '')
            }
          >
            Zip
          </label>
          {errors.zip_code && <div className={styles['form-error']}>{errors.zip_code.message as string}</div>}
        </div>
        {/* Home Phone */}
        <div className={styles['form-field']} style={{ gridColumn: '1 / span 2' }}>
          <input
            className={styles['form-input']}
            {...form.register('home_phone')}
            id="home_phone"
            autoComplete="off"
            onFocus={() => handleFocus('home_phone')}
            onBlur={() => handleBlur('home_phone')}
          />
          <label
            htmlFor="home_phone"
            className={
              styles['form-floating-label'] +
              ((focus.home_phone || values.home_phone) ? ' ' + styles['form-label--active'] : '')
            }
          >
            Home Phone
          </label>
          {errors.home_phone && <div className={styles['form-error']}>{errors.home_phone.message as string}</div>}
        </div>
        {/* Home Type (select) */}
        <div className={styles['form-field']} style={{ gridColumn: '3 / span 2', position: 'relative' }}>
          <select
            className={styles['form-select']}
            {...form.register('home_type')}
            id="home_type"
            defaultValue=""
            onFocus={() => { handleFocus('home_type'); setHomeTypeOpen(true); }}
            onBlur={() => { handleBlur('home_type'); setHomeTypeOpen(false); }}
          >
            <option value="" disabled hidden></option>
            {homeTypeOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <label
            htmlFor="home_type"
            className={
              styles['form-floating-label'] +
              ((focus.home_type || values.home_type) ? ' ' + styles['form-label--active'] : '')
            }
            style={{ left: 0, color: homeTypeOpen ? '#00bcd4' : undefined, right: 0, maxWidth: 'calc(100% - 36px)' }}
          >
            Home Type
          </label>
          <span
            className={styles['form-select-arrow']}
            style={{ color: homeTypeOpen ? '#00bcd4' : '#757575' }}
          >
            ▼
          </span>
          {errors.home_type && <div className={styles['form-error']}>{errors.home_type.message as string}</div>}
        </div>
        {/* Home Access */}
        <div className={styles['form-field']} style={{ gridColumn: '1 / span 4' }}>
          <input
            className={styles['form-input']}
            {...form.register('home_access')}
            id="home_access"
            autoComplete="off"
            onFocus={() => handleFocus('home_access')}
            onBlur={() => handleBlur('home_access')}
          />
          <label
            htmlFor="home_access"
            className={
              styles['form-floating-label'] +
              ((focus.home_access || values.home_access) ? ' ' + styles['form-label--active'] : '')
            }
          >
            Home Access
          </label>
          {errors.home_access && <div className={styles['form-error']}>{errors.home_access.message as string}</div>}
        </div>
        {/* Pets */}
        <div className={styles['form-field']} style={{ gridColumn: '1 / span 4' }}>
          <input
            className={styles['form-input']}
            {...form.register('pets')}
            id="pets"
            autoComplete="off"
            onFocus={() => handleFocus('pets')}
            onBlur={() => handleBlur('pets')}
          />
          <label
            htmlFor="pets"
            className={
              styles['form-floating-label'] +
              ((focus.pets || values.pets) ? ' ' + styles['form-label--active'] : '')
            }
          >
            Pets
          </label>
          {errors.pets && <div className={styles['form-error']}>{errors.pets.message as string}</div>}
        </div>
      </div>
      <div className={styles['step-buttons-row']}>
        <Button type="button" onClick={handleBack} disabled={step === 0}>Back</Button>
        <Button type="submit" onClick={() => handleNextStep()} disabled={!isStepValid || form.formState.isSubmitting}>{step === totalSteps - 1 ? 'Submit' : 'Next'}</Button>
      </div>
    </div>
  );
} 