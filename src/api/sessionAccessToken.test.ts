import { afterEach, describe, expect, it } from 'vitest';
import {
  clearSessionAccessToken,
  getSessionAccessToken,
  setSessionAccessToken,
} from './sessionAccessToken';

describe('sessionAccessToken', () => {
  afterEach(() => {
    clearSessionAccessToken();
  });

  it('does not persist tokens in browser storage', () => {
    setSessionAccessToken('abc.def.ghi');
    expect(getSessionAccessToken()).toBeNull();
    expect(localStorage.getItem('sokana.session-token')).toBeNull();
  });

  it('purges legacy stored tokens on read and clear', () => {
    localStorage.setItem('sokana.session-token', 'legacy-token');
    clearSessionAccessToken();
    expect(localStorage.getItem('sokana.session-token')).toBeNull();
    expect(getSessionAccessToken()).toBeNull();
  });
});
