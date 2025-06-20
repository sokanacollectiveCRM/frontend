import { loadStripe, Stripe } from '@stripe/stripe-js';
import { createContext, ReactNode, useContext } from 'react';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

interface StripeContextType {
  stripePromise: Promise<Stripe | null>;
}

const StripeContext = createContext<StripeContextType | undefined>(undefined);

interface StripeProviderProps {
  children: ReactNode;
}

export function StripeProvider({ children }: StripeProviderProps) {
  return (
    <StripeContext.Provider value={{ stripePromise }}>
      {children}
    </StripeContext.Provider>
  );
}

export function useStripe() {
  const context = useContext(StripeContext);
  if (context === undefined) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
} 