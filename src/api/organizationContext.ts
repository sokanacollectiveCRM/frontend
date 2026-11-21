/** Organization routing only; authentication stays in the HttpOnly cookie. */
export interface OrganizationChoice {
  id: string;
  slug: string;
  name: string;
}
const STORAGE_KEY = 'sokana.selected-organization';
let memorySelection: string | null = null;

export function getSelectedOrganization(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY) || memorySelection;
  } catch {
    return memorySelection;
  }
}

export function setSelectedOrganization(id: string | null): void {
  memorySelection = id;
  try {
    if (id) sessionStorage.setItem(STORAGE_KEY, id);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Keep this tab functional if browser storage is unavailable.
  }
}

export function organizationChoices(value: unknown): OrganizationChoice[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is OrganizationChoice =>
      typeof item?.id === 'string' &&
      typeof item?.slug === 'string' &&
      typeof item?.name === 'string'
  );
}

/** A full navigation discards all previous organization's in-memory data. */
export function enterOrganization(path = '/'): void {
  window.location.assign(path);
}
