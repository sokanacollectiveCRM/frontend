import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { getRequestAuth, fetchWithAuth, get, post } from './http';
import {
  getSelectedOrganization,
  setSelectedOrganization,
} from './organizationContext';
const mocks = vi.hoisted(() => ({
  config: {
    baseUrl: 'http://localhost:5050',
    useLegacyApi: false,
    isProd: false,
  },
}));
vi.mock('./config', () => ({ API_CONFIG: mocks.config }));
vi.mock('@/common/utils/sessionUtils', () => ({
  handleSessionExpiration: vi.fn(),
}));
const fetchMock = vi.fn();
beforeEach(() => {
  setSelectedOrganization(null);
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
  mocks.config.useLegacyApi = false;
});
afterEach(() => {
  setSelectedOrganization(null);
  vi.unstubAllGlobals();
});
it('keeps organization routing per tab without storing credentials', async () => {
  setSelectedOrganization('org-b');
  expect(getSelectedOrganization()).toBe('org-b');
  expect(await getRequestAuth()).toEqual({
    credentials: 'include',
    headers: { 'X-Tenant-Id': 'org-b' },
  });
  setSelectedOrganization(null);
  expect(await getRequestAuth()).toEqual({
    credentials: 'include',
    headers: {},
  });
});
it('adds the selected organization to raw authenticated requests', async () => {
  setSelectedOrganization('org-b');
  fetchMock.mockResolvedValue(new Response('{}'));
  await fetchWithAuth('http://localhost:5050/doulas/profile');
  expect(
    (fetchMock.mock.calls[0][1].headers as Headers).get('X-Tenant-Id')
  ).toBe('org-b');
});
it.each([false, true])(
  'adds organization headers to canonical and legacy API requests (legacy=%s)',
  async (legacy) => {
    setSelectedOrganization('org-b');
    mocks.config.useLegacyApi = legacy;
    fetchMock.mockImplementation(
      async () =>
        new Response(JSON.stringify(legacy ? [] : { success: true, data: [] }))
    );
    await get('/clients');
    await post('/hours', { hours: 1 });
    for (const [, init] of fetchMock.mock.calls)
      expect(init.headers['X-Tenant-Id']).toBe('org-b');
  }
);
