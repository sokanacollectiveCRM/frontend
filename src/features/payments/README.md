# Payments Feature

This feature implements Stripe card storage functionality, allowing users to securely save payment methods for future use with default payment method management and card updating. Additionally, it provides admin functionality to charge customer payment methods.

## Setup

### 1. Environment Variables

Add the following environment variable to your `.env` file:

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### 2. Backend API

The feature expects the following API endpoints to be available:

**Store Card:** `POST /api/payments/customers/{customerId}/cards`
- Headers: `Authorization: Bearer {supabase_jwt_token}`
- Body: `{ "cardToken": "tok_1234567890abcdef" }`

**Update Card:** `PUT /api/payments/customers/{customerId}/cards/{paymentMethodId}`
- Headers: `Authorization: Bearer {supabase_jwt_token}`
- Body: `{ "cardToken": "tok_new_stripe_card_token" }`

**Get Cards:** `GET /api/payments/customers/{customerId}/cards`
- Headers: `Authorization: Bearer {supabase_jwt_token}`
- Response: `{ "success": true, "data": [StoredCard] }`

**Delete Card:** `DELETE /api/payments/customers/{customerId}/cards/{cardId}`
- Headers: `Authorization: Bearer {supabase_jwt_token}`

**Set Default Card:** `PUT /api/payments/customers/{customerId}/cards/{cardId}/default`
- Headers: `Authorization: Bearer {supabase_jwt_token}`

**Charge Card (Admin Only):** `POST /api/payments/customers/{customerId}/charge`
- Headers: `Authorization: Bearer {supabase_jwt_token}`
- Body: `{ "amount": 1000, "description": "Service fee" }`
- Note: Amount should be in cents (e.g., 1000 = $10.00)

### API Response Format

```typescript
interface StoredCard {
  id: string;
  stripePaymentMethodId: string;
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  createdAt: string;
}
```

## Features

### New User Experience
- **Add Payment Method**: When no cards exist, shows "Add New Payment Method" form
- **Secure Input**: Uses Stripe Elements for PCI compliance

### Existing User Experience  
- **Current Payment Method**: Prominently displays the default payment method
- **Update Payment Method**: Form changes to "Update Payment Method" mode and replaces the current card
- **Multiple Cards**: Additional saved cards shown below with management options
- **Default Management**: Set any card as the default payment method

### Admin Features
- **Charge Customer**: Admins can select any customer and charge their default payment method
- **Customer Search**: Search customers by name or email
- **Amount Input**: Dollar amount with automatic conversion to cents
- **Charge Description**: Required description for the charge
- **Real-time Validation**: Form validation and error handling

### Card Management Operations
- **Add New Card**: Store a completely new payment method
- **Update Existing Card**: Replace current payment method while preserving ID and default status
- **Set Default**: Change which card is the primary payment method
- **Delete Card**: Remove unwanted payment methods
- **Charge Default**: Admin can charge a customer's default payment method

### General Features
- **Real-time Updates**: Automatic refresh after add/update/delete/default operations
- **Error Handling**: User-friendly error messages and loading states
- **Brand Recognition**: Displays card brand icons and colors
- **Default Indicators**: Clear visual indication of default payment method
- **Creation Dates**: Shows when each card was added
- **Responsive Design**: Works on desktop and mobile
- **Role-based Access**: Different features available based on user role

## Security

- Card data is tokenized by Stripe before being sent to your backend
- No sensitive card information is stored in your frontend
- PCI compliance is handled by Stripe
- JWT authentication required for all API calls
- Update operations preserve existing card metadata while replacing payment details
- Admin charge functionality requires admin role verification

## Components

- `PaymentsPage`: Main page component with adaptive layout
- `AddCardForm`: Form for adding/updating payment methods (adaptive)
- `CurrentPaymentMethod`: Displays the active/default payment method
- `SavedCards`: Display and manage additional saved payment methods
- `ChargeCustomer`: Admin component for charging customer payment methods
- `PaymentsRoute`: Route configuration

## UI Flow

### No Cards Scenario
```
┌─────────────────────┐ ┌─────────────────────┐
│ Add New Payment     │ │ No saved payment    │
│ Method              │ │ methods message     │
│ [Card Input Form]   │ │                     │
└─────────────────────┘ └─────────────────────┘
```

### One Card Scenario
```
┌─────────────────────┐ ┌─────────────────────┐
│ Update Payment      │ │ Current Payment     │
│ Method              │ │ Method (Default)    │
│ Replace ••••1234    │ │ [Active Card Info]  │
│ [Card Input Form]   │ │                     │
└─────────────────────┘ └─────────────────────┘
```

### Multiple Cards Scenario
```
┌─────────────────────┐ ┌─────────────────────┐
│ Update Payment      │ │ Current Payment     │
│ Method              │ │ Method (Default)    │
│ Replace ••••1234    │ │ [Active Card Info]  │
│ [Card Input Form]   │ │                     │
└─────────────────────┘ └─────────────────────┘

        ┌─────────────────────────────────┐
        │ Additional Saved Cards          │
        │ [Star] Set Default  [Delete]    │
        └─────────────────────────────────┘
```

### Admin Charge Flow
```
┌─────────────────────────────────────────────┐
│ Charge Customer Payment Method (Admin)      │
│                                             │
│ [Search Customer] John Doe - john@email.com │
│ [Selected Customer Info Display]            │
│ [Amount Input] $25.00 (2500 cents)         │
│ [Description] Service consultation fee      │
│ [Charge Button]                             │
└─────────────────────────────────────────────┘
```

## Billing Page Integration

The charge functionality is integrated into the billing page with tabs:

- **My Invoices Tab**: Shows user's invoices (all users)
- **Charge Customer Tab**: Admin-only tab for charging customers

Admins see both tabs, regular users only see invoices.

## Default Payment Method Logic

- The **default card** (marked with `isDefault: true`) is shown as the current payment method
- If no card is marked as default, the first card in the list is used
- Users can set any card as default using the star button
- The current payment method is visually distinguished with green accents
- Additional cards show a star button to set them as default
- Admin charges use the customer's default payment method automatically

## Update vs Add Logic

### When "Update Payment Method" is used:
- Replaces the current default payment method with new card details
- **Preserves**: Card ID, default status, creation date (backend responsibility)
- **Updates**: Card number, expiry, brand, last4 digits
- Maintains the same position in the user's payment method list

### When "Add New Payment Method" is used:
- Creates a completely new payment method entry
- Does not affect existing cards
- New card gets its own unique ID and creation timestamp

## Usage

### For Regular Users:
1. **First Time**: Add their first payment method
2. **Existing Users**: See default payment method and option to update it
3. **Multiple Cards**: Manage multiple payment methods with default selection
4. **Set Default**: Click star icon on any non-default card to make it the default
5. **Update Current**: Replace the current payment method while keeping the same card record

### For Admins:
1. **All User Features**: Full access to payment method management
2. **Charge Customers**: Access billing page charge tab
3. **Customer Selection**: Search and select customers by name/email
4. **Charge Processing**: Enter amount and description to charge customer's default card
5. **Validation**: Form ensures all required fields and validates amounts

All operations are secured with JWT authentication and follow PCI compliance standards through Stripe's tokenization. 