export const MAX_REPEAT_WEEKS = 12;

export interface AvailabilityFormValues {
  date: string;
  startTime: string;
  endTime: string;
  repeatWeeks: number;
}

export interface BlackoutFormValues {
  fromDate: string;
  toDate: string;
  reason: string;
}

export function validateAvailabilityForm(
  values: AvailabilityFormValues
): string | null {
  if (!values.date.trim()) return 'Choose a date for this availability window.';
  if (!values.startTime.trim() || !values.endTime.trim()) {
    return 'Choose a start time and an end time.';
  }
  if (values.startTime >= values.endTime) {
    return 'End time must be after start time.';
  }
  if (
    !Number.isInteger(values.repeatWeeks) ||
    values.repeatWeeks < 1 ||
    values.repeatWeeks > MAX_REPEAT_WEEKS
  ) {
    return `Repeat weeks must be between 1 and ${MAX_REPEAT_WEEKS}.`;
  }
  return null;
}

export function validateBlackoutForm(
  values: BlackoutFormValues
): string | null {
  if (!values.fromDate.trim() || !values.toDate.trim()) {
    return 'Choose both a start date and an end date for the blackout.';
  }
  if (values.fromDate > values.toDate) {
    return 'Blackout end date must be on or after the start date.';
  }
  return null;
}
