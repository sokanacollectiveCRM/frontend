import { describe, expect, it, vi } from 'vitest';

describe('production logger', () => {
  it('does not emit arbitrary sensitive arguments', async () => {
    vi.resetModules();
    vi.doMock('@/config/env', () => ({ isProd: true }));
    const spies = [
      vi.spyOn(console, 'log').mockImplementation(() => undefined),
      vi.spyOn(console, 'info').mockImplementation(() => undefined),
      vi.spyOn(console, 'warn').mockImplementation(() => undefined),
      vi.spyOn(console, 'error').mockImplementation(() => undefined),
      vi.spyOn(console, 'debug').mockImplementation(() => undefined),
    ];
    const { logger } = await import('./logger');
    const values = [
      'Avery Sensitive Client',
      'avery@example.test',
      '2030-04-17',
      'MEDICAID-INS-98765',
      '12500.00',
      'access-token-secret',
      'refresh-token-secret',
      '#access_token=access-token-secret',
      'https://payments.example.test/pay/secret-link',
    ];

    for (const value of values) {
      logger.log(value);
      logger.info(value);
      logger.warn(value);
      logger.error(new Error(value));
      logger.debug({ value });
    }

    expect(spies.every((spy) => spy.mock.calls.length === 0)).toBe(true);
  });
});
