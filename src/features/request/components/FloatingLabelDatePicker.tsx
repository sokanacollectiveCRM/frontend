import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { UseFormRegisterReturn, useFormContext } from "react-hook-form";
import styles from '../RequestForm.module.scss';

interface FloatingLabelDatePickerProps {
  label: string;
  placeholder?: string;
  register: UseFormRegisterReturn;
  error?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
}

export default function FloatingLabelDatePicker({
  label,
  placeholder = "mm/dd/yyyy",
  register,
  error,
  onFocus,
  onBlur,
  className = "",
}: FloatingLabelDatePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [hasUserSelected, setHasUserSelected] = useState(false);
  const lastSelectedDate = useRef<Date | null>(null);

  // Get form context to access setValue and getValues
  const { setValue, getValues, watch } = useFormContext();
  const fieldName = register.name;

  // Watch the form value to sync with component state
  const formValue = watch(fieldName);

  // Sync component state with form value, but preserve user selections
  useEffect(() => {
    console.log(`DatePicker ${fieldName}: formValue =`, formValue);
    if (formValue && formValue.trim() !== '') {
      const date = new Date(formValue);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        lastSelectedDate.current = date;
        console.log(`DatePicker ${fieldName}: set selectedDate to`, date);
      }
    } else if (!hasUserSelected && (formValue === '' || formValue === undefined)) {
      // Only clear if user hasn't manually selected a date
      setSelectedDate(null);
      lastSelectedDate.current = null;
      console.log(`DatePicker ${fieldName}: set selectedDate to null`);
    } else if (hasUserSelected && lastSelectedDate.current && (formValue === '' || formValue === undefined)) {
      // Restore the last selected date if form validation cleared it
      console.log(`DatePicker ${fieldName}: restoring last selected date`, lastSelectedDate.current);
      setSelectedDate(lastSelectedDate.current);
      const formattedDate = lastSelectedDate.current.toISOString().split('T')[0];
      setValue(fieldName, formattedDate, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    }
  }, [formValue, fieldName, hasUserSelected, setValue]);

  const hasValue = !!selectedDate;

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
    register.onBlur?.({ target: { name: register.name } });
  };

  const handleDateChange = (date: Date | null) => {
    console.log(`DatePicker ${fieldName}: handleDateChange called with`, date);
    setSelectedDate(date);
    setHasUserSelected(true); // Mark that the user has selected a date
    lastSelectedDate.current = date; // Store the selected date in ref

    // Update the form value using setValue
    if (date) {
      const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      console.log(`DatePicker ${fieldName}: setting form value to`, formattedDate);
      setValue(fieldName, formattedDate, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });

      // Verify the value was set
      setTimeout(() => {
        const currentValue = getValues(fieldName);
        console.log(`DatePicker ${fieldName}: verification - current form value =`, currentValue);
      }, 100);
    } else {
      console.log(`DatePicker ${fieldName}: clearing form value`);
      setValue(fieldName, '', {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
    }
  };

  // Show error if there's an error message, regardless of value
  const shouldShowError = !!error;

  // Debug logging
  console.log(`DatePicker ${fieldName}:`, {
    selectedDate,
    formValue,
    hasValue,
    error,
    shouldShowError,
    isFocused
  });

  const handleWrapperClick = () => {
    console.log(`DatePicker wrapper ${fieldName}: clicked`);
    // Try to focus the input manually
    const input = document.querySelector(`input[name="${fieldName}"]`) as HTMLInputElement;
    if (input) {
      input.focus();
      input.click();
    }
  };

  return (
    <div
      className={`${styles['form-field']} ${className}`}
      onClick={handleWrapperClick}
      style={{ cursor: 'text' }}
    >
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        dateFormat="MM/dd/yyyy"
        placeholderText=""
        className={styles['form-input']}
        name={register.name}
        ref={register.ref}
        popperClassName={styles['datepicker-popper']}
        autoComplete="off"
        isClearable={false}
        showYearDropdown
        showMonthDropdown
        dropdownMode="select"
        openToDate={selectedDate || new Date()}
      />
      <label
        className={clsx(
          styles['form-floating-label'],
          {
            [styles['form-label--active']]: isFocused || hasValue,
          }
        )}
      >
        {label}
      </label>
      {shouldShowError && (
        <div className={styles['form-error']}>
          {error}
        </div>
      )}
    </div>
  );
} 