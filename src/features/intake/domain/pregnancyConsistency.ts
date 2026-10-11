/** Current pregnancy number includes this pregnancy; prior count is at least n - 1. */
export function minimumPriorPregnancies(pregnancyNumber: number): number {
  if (!Number.isFinite(pregnancyNumber) || pregnancyNumber < 1) return 0;
  return Math.max(0, Math.trunc(pregnancyNumber) - 1);
}

export function priorPregnanciesMismatchMessage(
  pregnancyNumber: number
): string {
  const minPrior = minimumPriorPregnancies(pregnancyNumber);
  if (pregnancyNumber <= 1) {
    return 'You said this is your 1st pregnancy, which means there are no prior pregnancies. Choose “No past pregnancies”, or go back and update the pregnancy number.';
  }
  const priorLabel =
    minPrior === 1 ? '1 prior pregnancy' : `${minPrior} prior pregnancies`;
  return `You said this is pregnancy #${pregnancyNumber}, so you have had at least ${priorLabel}. Choose “Had past pregnancies” and enter at least ${minPrior}, or go back and update the pregnancy number.`;
}

export function priorPregnanciesCountTooLowMessage(
  pregnancyNumber: number
): string {
  const minPrior = minimumPriorPregnancies(pregnancyNumber);
  return `This is pregnancy #${pregnancyNumber}, so the number of prior pregnancies must be at least ${minPrior}.`;
}

export function parsePregnancyNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function parsePriorCount(value: unknown): number {
  if (value === '' || value === null || value === undefined) return 0;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  const parsed = parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}
