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

  it('stores and reads a login JWT for header auth', () => {
    setSessionAccessToken('abc.def.ghi');
    expect(getSessionAccessToken()).toBe('abc.def.ghi');
  });

  it('clears an empty or missing token', () => {
    setSessionAccessToken('abc.def.ghi');
    setSessionAccessToken('  ');
    expect(getSessionAccessToken()).toBeNull();
  });
});
