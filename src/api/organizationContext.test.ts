import { beforeEach, expect, it } from 'vitest';
import {
  organizationHeaders,
  selectOrganization,
  selectedOrganization,
} from './organizationContext';
beforeEach(() => sessionStorage.clear());
it('keeps the selected organization in this browser session and clears it on switching', () => {
  expect(organizationHeaders()).toEqual({});
  selectOrganization('org-b');
  expect(selectedOrganization()).toBe('org-b');
  expect(organizationHeaders()).toEqual({ 'X-Tenant-Id': 'org-b' });
  selectOrganization(null);
  expect(organizationHeaders()).toEqual({});
});
