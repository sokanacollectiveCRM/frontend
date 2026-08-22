import { describe, expect, it, vi } from 'vitest';

describe('safeLog', () => {
  it('never forwards sensitive values to console in production', async () => {
    vi.resetModules();
    vi.doMock('@/config/env', () => ({ isProd: true }));
    const spies = [
      vi.spyOn(console, 'log').mockImplementation(() => undefined),
      vi.spyOn(console, 'error').mockImplementation(() => undefined),
      vi.spyOn(console, 'debug').mockImplementation(() => undefined),
    ];
    const { logOperation, logFailure, logHttpFailure } = await import('./safeLog');

    logOperation('client-api', 'update', { fieldCount: 3 });
    logFailure('client-api', 'update', { status: 500 });
    logHttpFailure('client-api', 'update', 403);

    expect(spies.every((spy) => spy.mock.calls.length === 0)).toBe(true);
  });
});
