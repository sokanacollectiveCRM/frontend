# Billing Feature

The billing feature provides comprehensive payment management functionality for both users and administrators in the CRM system.

## Overview

The billing page serves two primary purposes:
1. **Customer Invoice Management**: Allow users to view and pay their invoices
2. **Admin Charge Functionality**: Enable admins to charge customer payment methods

## Features

### For All Users
- **Invoice Viewing**: Display user's invoices with details (invoice number, due date, total, status)
- **Invoice Payment**: Pay invoices using the integrated payment form
- **Real-time Updates**: Automatic refresh of invoice status after payment

### For Admins Only
- **Customer Selection**: Search and select customers by name or email
- **Charge Processing**: Charge a customer's default payment method
- **Amount Input**: Enter charge amount in dollars (automatically converted to cents)
- **Charge Description**: Add descriptive text for the charge
- **Form Validation**: Comprehensive validation for all required fields

## User Interface

The billing page uses a tabbed interface:

```
┌─────────────────────────────────────────────┐
│ [My Invoices] [Charge Customer] (Admin only) │
├─────────────────────────────────────────────┤
│                                             │
│ Tab Content Area                            │
│                                             │
└─────────────────────────────────────────────┘
```

### My Invoices Tab
- Available to all users
- Shows user's personal invoices
- Pay button for each invoice
- Modal payment form integration

### Charge Customer Tab (Admin Only)
- Only visible to users with admin role
- Customer search and selection
- Amount and description input
- Real-time validation and error handling

## API Integration

### Invoice Management
Uses existing QuickBooks invoice API:
- `getQuickBooksInvoices()`: Fetches user invoices

### Charge Functionality
Uses the new Stripe charge API:
- `POST /api/payments/customers/{customerId}/charge`
- Request body: `{ "amount": number, "description": string }`
- Amount in cents (e.g., 1000 = $10.00)

## Components

### BillingPage.tsx
Main page component that orchestrates the billing functionality:
- Tab management based on user role
- Invoice fetching and display
- Payment modal handling
- Admin/user permission checking

### ChargeCustomer.tsx
Admin-only component for charging customers:
- Customer search and selection
- Form validation and submission
- Error handling and success notifications
- Real-time amount conversion (dollars to cents)

## User Flow

### Regular User Flow
1. Navigate to billing page
2. View "My Invoices" tab (default)
3. See list of personal invoices
4. Click "Pay" button on invoice
5. Complete payment in modal

### Admin Flow
1. Navigate to billing page
2. See both "My Invoices" and "Charge Customer" tabs
3. Default to "Charge Customer" tab
4. Search for customer by name or email
5. Select customer from dropdown
6. Enter charge amount (in dollars)
7. Enter charge description
8. Submit charge request
9. See success/error notification

## Security & Validation

### Client-side Validation
- Required field validation
- Positive amount validation
- Customer selection requirement
- Real-time form state management

### Server-side Security
- JWT authentication required
- Admin role verification for charge functionality
- Stripe tokenization for secure payment processing

### Error Handling
- Network error handling
- API error display
- User-friendly error messages
- Toast notifications for feedback

## Integration Points

### Authentication
- Requires valid JWT token
- Role-based feature access
- User context integration

### Payment Processing
- Stripe API integration
- Default payment method usage
- Secure tokenization

### User Management
- Customer list fetching
- Admin permission checking
- User search functionality

## Development Notes

### Dependencies
- React Toastify for notifications
- Stripe API for payment processing
- Tailwind CSS for styling
- Lucide icons for UI elements

### State Management
- Local component state for form management
- Context for user authentication
- Real-time validation states

### Performance Considerations
- Customer list caching
- Debounced search functionality
- Efficient re-rendering patterns

## Testing

To test the charge functionality:

1. **Setup**: Ensure admin user account and customer accounts exist
2. **Navigation**: Access billing page as admin
3. **Customer Selection**: Search and select a customer
4. **Charge Entry**: Enter valid amount and description
5. **Submission**: Submit form and verify success notification
6. **Verification**: Check payment was processed correctly

## Future Enhancements

Potential improvements for the billing feature:

- **Charge History**: Display history of admin-initiated charges
- **Batch Charging**: Charge multiple customers simultaneously
- **Recurring Charges**: Set up automatic recurring charges
- **Refund Functionality**: Process refunds for charges
- **Detailed Reporting**: Enhanced billing analytics and reports
- **Payment Method Selection**: Allow admins to choose which payment method to charge

## Configuration

Environment variables required:
- `VITE_APP_BACKEND_URL`: Backend API base URL
- Stripe configuration (inherited from payments feature)

## Error Scenarios

Common error cases and handling:

1. **No Payment Method**: Customer has no saved payment methods
2. **Insufficient Funds**: Payment method declined
3. **Network Issues**: API connectivity problems
4. **Permission Denied**: Non-admin accessing charge functionality
5. **Invalid Customer**: Selected customer not found or inactive 