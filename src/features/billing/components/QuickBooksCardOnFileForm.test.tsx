import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import QuickBooksCardOnFileForm from './QuickBooksCardOnFileForm';

const { tokenizeIntuitCard, savePaymentMethod, getPaymentMethod } = vi.hoisted(() => ({
  tokenizeIntuitCard: vi.fn(),
  savePaymentMethod: vi.fn(),
  getPaymentMethod: vi.fn(),
}));

vi.mock('./quickbooksPayments', async () => {
  const actual = await vi.importActual<typeof import('./quickbooksPayments')>('./quickbooksPayments');
  return {
    ...actual,
    tokenizeIntuitCard,
    savePaymentMethod,
    getPaymentMethod,
  };
});

describe('QuickBooksCardOnFileForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPaymentMethod.mockResolvedValue(null);
  });

  it('tokenizes card details and saves only the token with the client id', async () => {
    tokenizeIntuitCard.mockResolvedValue('tok_123');
    savePaymentMethod.mockResolvedValue({
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
    });

    const onSuccess = vi.fn();
    const user = userEvent.setup();

    render(<QuickBooksCardOnFileForm clientId='client_123' onSuccess={onSuccess} />);

    await waitFor(() => expect(getPaymentMethod).toHaveBeenCalledTimes(1));
    await user.type(screen.getByLabelText(/name on card/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/card number/i), '4111111111111111');
    await user.type(screen.getByLabelText(/expiration/i), '07/25');
    await user.type(screen.getByLabelText(/security code/i), '123');
    await user.type(screen.getByLabelText(/^billing address$/i), '123 Main St');
    await user.type(screen.getByLabelText(/apartment, suite, or unit/i), 'Apt 4B');
    await user.type(screen.getByLabelText(/^city$/i), 'Boston');
    await user.type(screen.getByLabelText(/^state$/i), 'MA');
    await user.type(screen.getByLabelText(/postal code/i), '02118');

    await user.click(screen.getByRole('button', { name: /save card/i }));

    await waitFor(() => expect(tokenizeIntuitCard).toHaveBeenCalledTimes(1));
    expect(tokenizeIntuitCard).toHaveBeenCalledWith(
      expect.objectContaining({
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
      }),
      expect.any(Object)
    );

    await waitFor(() => expect(savePaymentMethod).toHaveBeenCalledTimes(1));
    expect(savePaymentMethod).toHaveBeenCalledWith(
      expect.objectContaining({
        client_id: 'client_123',
        intuit_token: 'tok_123',
        request_id: expect.any(String),
      }),
      expect.objectContaining({
        endpoints: expect.arrayContaining([
          '/api/payment-methods',
          '/api/quickbooks/payment-methods',
          '/quickbooks/payment-methods',
        ]),
      })
    );
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        client_id: 'client_123',
        quickbooks_customer_id: 'qb_456',
        provider_payment_method_reference: 'pm_789',
        card_brand: 'Visa',
        last4: '1111',
      })
    );
    expect(screen.getByText(/card saved/i)).toBeInTheDocument();
    expect(screen.getByText(/visa ending in 1111/i)).toBeInTheDocument();
  });

  it('prefills a disposable test card for QA', async () => {
    const user = userEvent.setup();

    render(<QuickBooksCardOnFileForm clientId='client_123' />);

    await user.click(screen.getByRole('button', { name: /prefill test card/i }));

    expect(screen.getByLabelText(/name on card/i)).toHaveValue('Test Cardholder');
    expect(screen.getByLabelText(/card number/i)).toHaveValue('4111111111111111');
    expect(screen.getByLabelText(/expiration/i)).toHaveValue('07/25');
    expect(screen.getByLabelText(/security code/i)).toHaveValue('123');
    expect(screen.getByLabelText(/^billing address$/i)).toHaveValue('123 Main St');
    expect(screen.getByLabelText(/apartment, suite, or unit/i)).toHaveValue('Apt 4B');
    expect(screen.getByLabelText(/^city$/i)).toHaveValue('Boston');
    expect(screen.getByLabelText(/^state$/i)).toHaveValue('MA');
    expect(screen.getByLabelText(/postal code/i)).toHaveValue('02118');
  });
});
