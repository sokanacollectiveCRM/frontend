import { describe, expect, it, vi } from 'vitest';

import {
  createPaymentMethodRequestId,
  getPaymentMethod,
  parseExpiration,
  savePaymentMethod,
  tokenizeIntuitCard,
} from './quickbooksPayments';

describe('quickbooksPayments helpers', () => {
  it('parses and normalizes expiration dates', () => {
    expect(parseExpiration('07/25')).toEqual({ exp_month: '07', exp_year: '2025' });
    expect(parseExpiration('7/25')).toEqual({ exp_month: '07', exp_year: '2025' });
    expect(parseExpiration('13/25')).toBeNull();
  });

  it('tokenizes card data without sending it to the backend save helper', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ token: 'tok_123' }),
    } as Response);

    const token = await tokenizeIntuitCard(
      {
        clientId: 'client_123',
        cardNumber: '4111111111111111',
        expiration: '07/25',
        cvc: '123',
        cardholderName: 'Jane Doe',
        billingAddress1: '123 Main St',
        billingAddress2: 'Apt 4B',
        billingCity: 'Boston',
        billingState: 'MA',
        billingPostalCode: '02118',
        billingCountry: 'US',
      },
      { endpoint: 'https://example.com/tokenize', fetchImpl: fetchImpl as typeof fetch }
    );

    expect(token).toBe('tok_123');
    expect(fetchImpl).toHaveBeenCalledTimes(1);

    const [, init] = fetchImpl.mock.calls[0];
    expect(init?.body).toBeDefined();

    const body = JSON.parse(String(init?.body));
    expect(body).toEqual({
      client_id: 'client_123',
      cardholder_name: 'Jane Doe',
      card_number: '4111111111111111',
      cvc: '123',
      exp_month: '07',
      exp_year: '2025',
      billing_address: {
        line1: '123 Main St',
        line2: 'Apt 4B',
        city: 'Boston',
        state: 'MA',
        postal_code: '02118',
        country: 'US',
      },
    });
  });

  it('sends only client_id, intuit_token, and request_id when saving the card', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          success: true,
          data: {
            client_id: 'client_123',
            quickbooks_customer_id: 'qb_456',
            provider_payment_method_reference: 'pm_789',
            card_brand: 'Visa',
            last4: '1111',
            exp_month: '07',
            exp_year: '2025',
            status: 'saved',
            created_at: '2026-04-23T10:00:00Z',
            updated_at: '2026-04-23T10:00:00Z',
          },
        }),
    } as Response);

    const requestId = createPaymentMethodRequestId();
    const saved = await savePaymentMethod(
      { client_id: 'client_123', intuit_token: 'tok_123', request_id: requestId },
      { endpoints: ['https://example.com/save'], requestImpl: fetchImpl as typeof fetch }
    );

    expect(saved).toEqual({
      client_id: 'client_123',
      quickbooks_customer_id: 'qb_456',
      provider_payment_method_reference: 'pm_789',
      card_brand: 'Visa',
      last4: '1111',
      exp_month: 7,
      exp_year: 2025,
      status: 'saved',
      created_at: '2026-04-23T10:00:00Z',
      updated_at: '2026-04-23T10:00:00Z',
    });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [, init] = fetchImpl.mock.calls[0];
    expect(JSON.parse(String(init?.body))).toEqual({
      client_id: 'client_123',
      intuit_token: 'tok_123',
      request_id: requestId,
    });
  });

  it('returns null when the backend says no payment method exists', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: async () =>
        JSON.stringify({
          success: false,
          error: 'Payment method not found',
          code: 'payment_method_not_found',
        }),
    } as Response);

    await expect(
      getPaymentMethod({ clientId: 'client_123' }, { endpoints: ['https://example.com/save/123'], requestImpl: fetchImpl as typeof fetch })
    ).resolves.toBeNull();
  });
});
