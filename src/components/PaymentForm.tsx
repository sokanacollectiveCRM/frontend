// src/components/PaymentForm.tsx
import React, { useState } from 'react';

interface PaymentResponse {
  id?: string;
  status?: string;
  amount?: string;
  error?: any;
}

interface PaymentFormProps {
  amount: number;
  docNumber?: string;
}

const PaymentForm = ({ amount, docNumber }: PaymentFormProps) => {
  const [card, setCard] = useState({
    number: '',
    expMonth: '',
    expYear: '',
    cvc: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PaymentResponse | null>(null);

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCard(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/quickbooks/simulate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, card, doc_number: docNumber })
      });

      const data: PaymentResponse = await response.json();

      if (!response.ok) {
        throw new Error(JSON.stringify(data.error || 'An unknown error occurred.'));
      }
      setResult(data);

    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h2>Simulate a Payment</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ marginBottom: '0.75rem', fontWeight: 600 }}>
          Amount: ${amount.toFixed(2)}
        </div>
        <input
          name="number"
          value={card.number}
          onChange={handleCardChange}
          placeholder="Card Number (e.g., 4111...)"
          required
          style={{
            marginBottom: '0.75rem',
            border: '1px solid #ccc',
            borderRadius: '6px',
            padding: '0.5rem',
            fontSize: '1rem',
          }}
        />
        <input
          name="expMonth"
          value={card.expMonth}
          onChange={handleCardChange}
          placeholder="Expiry Month (e.g., 12)"
          required
          style={{
            marginBottom: '0.75rem',
            border: '1px solid #ccc',
            borderRadius: '6px',
            padding: '0.5rem',
            fontSize: '1rem',
          }}
        />
        <input
          name="expYear"
          value={card.expYear}
          onChange={handleCardChange}
          placeholder="Expiry Year (e.g., 2025)"
          required
          style={{
            marginBottom: '0.75rem',
            border: '1px solid #ccc',
            borderRadius: '6px',
            padding: '0.5rem',
            fontSize: '1rem',
          }}
        />
        <input
          name="cvc"
          value={card.cvc}
          onChange={handleCardChange}
          placeholder="CVC (e.g., 123)"
          required
          style={{
            marginBottom: '0.75rem',
            border: '1px solid #ccc',
            borderRadius: '6px',
            padding: '0.5rem',
            fontSize: '1rem',
          }}
        />
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '0.75rem',
            borderRadius: '6px',
            border: 'none',
            background: '#065f46',
            color: 'white',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginTop: '0.5rem',
          }}
        >
          {isLoading ? 'Processing...' : 'Pay Now'}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
          <h4>API Response:</h4>
          {result.error ? (
            <pre style={{ color: 'red', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{result.error}</pre>
          ) : (
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{JSON.stringify(result, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentForm; 