import { describe, expect, it } from 'vitest';
import { isSessionExpiredError } from './sessionUtils';

describe('isSessionExpiredError', () => {
  it('treats 401 as session expiry', () => {
    expect(isSessionExpiredError(401, 'Unauthorized')).toBe(true);
  });

  it('does not treat 403 Forbidden as session expiry', () => {
    expect(isSessionExpiredError(403, 'Forbidden')).toBe(false);
    expect(isSessionExpiredError(403, 'unauthorized')).toBe(false);
  });

  it('detects expired-session messages on other statuses', () => {
    expect(isSessionExpiredError(500, 'token expired')).toBe(true);
    expect(isSessionExpiredError(400, 'session expired')).toBe(true);
  });
});
