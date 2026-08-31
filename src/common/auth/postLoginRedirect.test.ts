import { safePostLoginPath } from '@/common/auth/postLoginRedirect';
import { describe, expect, it } from 'vitest';

describe('safePostLoginPath', () => {
  it('accepts internal CRM paths', () => {
    expect(
      safePostLoginPath(
        '/billing/contracts/556da696-87b0-43a3-a0f6-b9aa16ae2084'
      )
    ).toBe('/billing/contracts/556da696-87b0-43a3-a0f6-b9aa16ae2084');
  });

  it('rejects external and auth redirect targets', () => {
    expect(safePostLoginPath('https://evil.example')).toBeNull();
    expect(safePostLoginPath('//evil.example')).toBeNull();
    expect(safePostLoginPath('/login')).toBeNull();
    expect(safePostLoginPath('/auth/client-login')).toBeNull();
  });
});
