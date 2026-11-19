import type {
  SigningCoordinates,
  SigningFieldKind,
  SigningManifestField,
} from '@/features/public-signing/types';

export const GUIDED_FIELD_KINDS: readonly SigningFieldKind[] = [
  'initials',
  'signature',
  'signing_date',
  'acknowledgment',
];

export function overlayStyle(
  coordinates: SigningCoordinates
): Record<'left' | 'top' | 'width' | 'height', string> {
  const pct = (value: number) => `${Math.round(value * 100000) / 1000}%`;
  return {
    left: pct(coordinates.x),
    top: pct(coordinates.y),
    width: pct(coordinates.width),
    height: pct(coordinates.height),
  };
}

export function overlayStylePx(
  coordinates: SigningCoordinates,
  pageWidth: number,
  pageHeight: number
): Record<'left' | 'top' | 'width' | 'height', string> {
  const px = (value: number) => `${Math.round(value * 1000) / 1000}px`;
  return {
    left: px(coordinates.x * pageWidth),
    top: px(coordinates.y * pageHeight),
    width: px(coordinates.width * pageWidth),
    height: px(coordinates.height * pageHeight),
  };
}

/** Match react-pdf canvas CSS dimensions (floored px) for overlay alignment. */
export function floorRenderedPageSize(
  width: number,
  height: number
): { width: number; height: number } | null {
  const w = Math.floor(width);
  const h = Math.floor(height);
  if (w <= 0 || h <= 0) return null;
  return { width: w, height: h };
}

export function isGuidedField(field: SigningManifestField): boolean {
  return GUIDED_FIELD_KINDS.includes(field.kind);
}

export function buildFieldQueue(
  manifest: readonly SigningManifestField[]
): SigningManifestField[] {
  return manifest
    .filter((field) => field.required && isGuidedField(field))
    .slice()
    .sort((left, right) => {
      if (left.page !== right.page) return left.page - right.page;
      if (left.coordinates.y !== right.coordinates.y) {
        return left.coordinates.y - right.coordinates.y;
      }
      return left.coordinates.x - right.coordinates.x;
    });
}

export function requiredSigningFieldCount(
  manifest: readonly SigningManifestField[]
): number {
  return buildFieldQueue(manifest).length;
}

export function completedFieldCount(
  manifest: readonly SigningManifestField[],
  appliedFieldIds: ReadonlySet<string>
): number {
  return buildFieldQueue(manifest).filter((field) =>
    appliedFieldIds.has(field.id)
  ).length;
}

export function completedFieldIds(
  manifest: readonly SigningManifestField[],
  appliedFieldIds: ReadonlySet<string>
): string[] {
  return manifest
    .filter((field) => appliedFieldIds.has(field.id))
    .map((field) => field.id);
}

export function missingRequiredFieldIds(
  manifest: readonly SigningManifestField[],
  appliedFieldIds: ReadonlySet<string>
): string[] {
  return buildFieldQueue(manifest)
    .filter((field) => !appliedFieldIds.has(field.id))
    .map((field) => field.id);
}

export function nextIncompleteFieldId(
  queue: readonly SigningManifestField[],
  appliedFieldIds: ReadonlySet<string>,
  startIndex = 0
): string | null {
  for (let index = startIndex; index < queue.length; index += 1) {
    const field = queue[index];
    if (!appliedFieldIds.has(field.id)) return field.id;
  }
  return null;
}

export function previousIncompleteFieldId(
  queue: readonly SigningManifestField[],
  appliedFieldIds: ReadonlySet<string>,
  fromFieldId: string
): string | null {
  const currentIndex = queue.findIndex((field) => field.id === fromFieldId);
  if (currentIndex <= 0) return null;
  for (let index = currentIndex - 1; index >= 0; index -= 1) {
    const field = queue[index];
    if (!appliedFieldIds.has(field.id)) return field.id;
  }
  return queue[currentIndex - 1]?.id ?? null;
}

export function fieldActionLabel(kind: SigningFieldKind): string {
  switch (kind) {
    case 'initials':
      return 'Click to initial';
    case 'signature':
      return 'Click to sign';
    case 'signing_date':
      return 'Click to add date';
    case 'acknowledgment':
      return 'Click to acknowledge';
    default:
      return 'Click to complete';
  }
}

export function fieldTagLabel(kind: SigningFieldKind): string {
  switch (kind) {
    case 'initials':
      return 'Initial';
    case 'signature':
      return 'Sign';
    case 'signing_date':
      return 'Date';
    case 'acknowledgment':
      return 'Acknowledge';
    default:
      return 'Required';
  }
}

export function canApplyField(
  field: SigningManifestField,
  appliedFieldIds: ReadonlySet<string>,
  adoptedInitials: string,
  hasAdoptedSignature: boolean
): boolean {
  if (appliedFieldIds.has(field.id)) return false;
  switch (field.kind) {
    case 'initials':
      return adoptedInitials.trim().length > 0;
    case 'signature':
      return hasAdoptedSignature;
    case 'signing_date':
    case 'acknowledgment':
      return true;
    default:
      return false;
  }
}

export function displaySigningDate(): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
    new Date()
  );
}
