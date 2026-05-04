export type HourType = 'prenatal' | 'postpartum' | 'unknown';

export const hourTypeOptions: Array<{ label: string; value: Exclude<HourType, 'unknown'> }> = [
  { label: 'Prenatal', value: 'prenatal' },
  { label: 'Postpartum', value: 'postpartum' },
];

export function normalizeHourType(value: unknown): HourType {
  if (typeof value !== 'string') return 'unknown';

  const normalized = value.trim().toLowerCase();

  if (normalized === 'prenatal' || normalized === 'postpartum') {
    return normalized;
  }

  return 'unknown';
}

export function getHourTypeLabel(type: HourType): string {
  switch (type) {
    case 'prenatal':
      return 'Prenatal';
    case 'postpartum':
      return 'Postpartum';
    default:
      return 'Unknown';
  }
}

export function getHourTypeBadgeClass(type: HourType): string {
  switch (type) {
    case 'prenatal':
      return 'border-sky-200 bg-sky-50 text-sky-700';
    case 'postpartum':
      return 'border-pink-200 bg-pink-50 text-pink-700';
    default:
      return 'border-gray-200 bg-gray-50 text-gray-600';
  }
}

export function formatDurationHours(totalHours: number): string {
  const safeHours = Math.max(0, totalHours);
  const totalMinutes = Math.round(safeHours * 60);
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${wholeHours}h ${minutes}m`;
}
