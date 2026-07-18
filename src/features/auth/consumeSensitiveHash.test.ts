import { afterEach, describe, expect, it, vi } from 'vitest';

import { consumeSensitiveHash } from './consumeSensitiveHash';

const SENSITIVE_VALUES = [
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

afterEach(() => {
  vi.restoreAllMocks();
  window.history.replaceState({}, '', '/');
});

describe('sensitive authentication fragments', () => {
  it('removes the fragment immediately without logging representative sensitive values', () => {
    const spies = [
      vi.spyOn(console, 'log').mockImplementation(() => undefined),
      vi.spyOn(console, 'info').mockImplementation(() => undefined),
      vi.spyOn(console, 'warn').mockImplementation(() => undefined),
      vi.spyOn(console, 'error').mockImplementation(() => undefined),
      vi.spyOn(console, 'debug').mockImplementation(() => undefined),
    ];
    const hash = new URLSearchParams({
      access_token: SENSITIVE_VALUES[5],
      refresh_token: SENSITIVE_VALUES[6],
      type: 'recovery',
      client_name: SENSITIVE_VALUES[0],
      email: SENSITIVE_VALUES[1],
      due_date: SENSITIVE_VALUES[2],
      insurance_id: SENSITIVE_VALUES[3],
      contract_amount: SENSITIVE_VALUES[4],
      payment_link: SENSITIVE_VALUES[8],
    });
    window.history.replaceState({}, '', `/set-password?source=invite#${hash}`);

    const params = consumeSensitiveHash(window.location, window.history);

    expect(params.get('access_token')).toBe(SENSITIVE_VALUES[5]);
    expect(window.location.href).not.toContain('#');
    const captured = spies
      .flatMap((spy) => spy.mock.calls)
      .flat()
      .join(' ');
    for (const value of SENSITIVE_VALUES) expect(captured).not.toContain(value);
  });
});
