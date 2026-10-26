const KEY = 'sokana-selected-organization';
export function selectedOrganization(): string | null {
  return sessionStorage.getItem(KEY);
}
export function selectOrganization(id: string | null): void {
  if (id) sessionStorage.setItem(KEY, id);
  else sessionStorage.removeItem(KEY);
}
export function organizationHeaders(): Record<string, string> {
  const id = selectedOrganization();
  return id ? { 'X-Tenant-Id': id } : {};
}
