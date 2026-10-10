import type { IntakeCatalogField, IntakeDefinition } from './types';

const PREVIEW_KEY = 'sokana.intakeFormClientPreview';

export type IntakeClientPreviewPayload = {
  definition: IntakeDefinition;
  catalog: IntakeCatalogField[];
  tenantName: string;
  slug: string;
  logoUrl: string | null;
};

export function saveIntakeClientPreview(
  payload: IntakeClientPreviewPayload
): void {
  localStorage.setItem(PREVIEW_KEY, JSON.stringify(payload));
}

export function readIntakeClientPreview(): IntakeClientPreviewPayload | null {
  try {
    const raw = localStorage.getItem(PREVIEW_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as IntakeClientPreviewPayload;
    if (!parsed?.definition?.steps || !parsed.slug) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function intakePreviewStorageKey(): string {
  return PREVIEW_KEY;
}
