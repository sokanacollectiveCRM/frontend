# Contract Payment System

This system provides a visual payment interface for contract-related payments using your existing Stripe infrastructure.

## Components

### 1. ContractPayment Component
**Location**: `src/features/payments/components/ContractPayment.tsx`

A reusable payment component that:
- Displays contract details (ID, client name, service type)
- Allows customizable payment amounts
- Integrates with your existing Stripe payment system
- Provides success/error callbacks
- Supports URL parameters for dynamic data

### 2. ContractPaymentDemo Component
**Location**: `src/features/payments/components/ContractPaymentDemo.tsx`

A demo interface that shows how to use the ContractPayment component with:
- Configurable contract details
- Live preview of payment form
- Example usage patterns

## Routes

- `/contract-payment` - Main payment page
- `/contract-payment-demo` - Demo page for testing

## Usage

### Basic Usage
```tsx
import ContractPayment from '@/features/payments/components/ContractPayment';

<ContractPayment
  contractId="CON-2024-001"
  clientName="Sarah Johnson"
  serviceType="Postpartum Support"
  amount={2500} // $25.00 in cents
  onPaymentSuccess={() => console.log('Payment successful!')}
  onPaymentError={(error) => console.error('Payment failed:', error)}
/>
```

### With URL Parameters
The component can also read data from URL parameters:
```
/contract-payment?contractId=CON-2024-001&clientName=Sarah%20Johnson&serviceType=Postpartum%20Support&amount=2500
```

### Integration with Contract Flow
The `SelectClientModal` automatically navigates to the payment page after sending a contract:
```tsx
// After successful contract sending
const queryParams = new URLSearchParams({
  contractId: `CON-${Date.now()}`,
  clientName: `${selectedClient.firstname} ${selectedClient.lastname}`,
  serviceType: selectedTemplateData?.name || 'Doula Services',
  amount: '5000', // Default $50.00 in cents
});
navigate(`/contract-payment?${queryParams.toString()}`);
```

## Features

- ✅ **Stripe Integration**: Uses your existing Stripe setup
- ✅ **Responsive Design**: Works on desktop and mobile
- ✅ **Loading States**: Shows processing indicators
- ✅ **Error Handling**: Comprehensive error messages
- ✅ **URL Parameters**: Dynamic data via query strings
- ✅ **TypeScript**: Fully typed for better development experience
- ✅ **Toast Notifications**: User feedback via Sonner
- ✅ **Security**: Stripe-secured payments

## Styling

The component uses your existing UI theme:
- Tailwind CSS classes
- Radix UI components
- Teal color scheme matching your brand
- Professional, clean design

## Testing

1. Visit `/contract-payment-demo` to test the component
2. Customize contract details in the demo form
3. Click "Launch Payment Form" to see the payment interface
4. Test with your Stripe test keys

## Dependencies

- `@stripe/react-stripe-js` - Stripe React components
- `@stripe/stripe-js` - Stripe JavaScript SDK
- `sonner` - Toast notifications
- `react-router-dom` - Navigation and URL parameters
- Your existing UI components and contexts

