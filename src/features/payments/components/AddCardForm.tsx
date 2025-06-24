import { storeCard, StoredCard, updateCard } from '@/api/payments/stripe';
import { Alert, AlertDescription } from '@/common/components/ui/alert';
import { Button } from '@/common/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/common/components/ui/card';
import { UserContext } from '@/common/contexts/UserContext';
import { Icons } from '@/features/admin-payment/icons';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Plus, RefreshCw } from 'lucide-react';
import React, { useContext, useState } from 'react';
import { toast } from 'react-toastify';

interface AddCardFormProps {
  onCardAdded: () => void;
  hasExistingCards: boolean;
  currentCard?: StoredCard | null;
}

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      backgroundColor: 'transparent',
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: false,
};

export default function AddCardForm({ onCardAdded, hasExistingCards, currentCard }: AddCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isUpdateMode = hasExistingCards && currentCard;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!stripe || !elements || !user) {
      setError('Stripe has not loaded properly or user is not authenticated');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found');
      return;
    }

    setIsLoading(true);

    try {
      // Create token from card element
      const { token, error: stripeError } = await stripe.createToken(cardElement);

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (!token) {
        throw new Error('Failed to create card token');
      }

      if (isUpdateMode && currentCard) {
        // Update existing card
        await updateCard(user.id, currentCard.id, token.id);
        toast.success('Payment method updated successfully!');
      } else {
        // Store new card
        await storeCard(user.id, token.id);
        toast.success('Card saved successfully!');
      }

      onCardAdded();

      // Clear the card element
      cardElement.clear();

    } catch (err: any) {
      console.error('Error saving card:', err);
      setError(err.message || 'Failed to save card');
      toast.error(err.message || 'Failed to save card');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isUpdateMode ? (
            <>
              <RefreshCw className="w-5 h-5" />
              Update Payment Method
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Add New Payment Method
            </>
          )}
        </CardTitle>
        <CardDescription>
          {isUpdateMode
            ? `Replace your current payment method (•••• •••• •••• ${currentCard?.last4}) with a new card`
            : 'Securely store a new credit or debit card for future payments'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Card Information
            </label>
            <div className="border rounded-md p-3 bg-white">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={!stripe || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                {isUpdateMode ? 'Updating...' : 'Saving Card...'}
              </>
            ) : (
              <>
                {isUpdateMode ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Update Payment Method
                  </>
                ) : (
                  'Save Card'
                )}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 