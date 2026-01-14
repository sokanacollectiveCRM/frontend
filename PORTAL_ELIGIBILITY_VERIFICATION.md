# Portal Eligibility Verification

## ✅ Implementation Status

The frontend is **correctly** checking contract/payment status for eligibility, NOT `portal_status`.

## Code Flow

### 1. Portal Status (Invitation State)
- **Function**: `derivePortalStatus(lead)`
- **Returns**: `'not_invited'`, `'invited'`, `'active'`, or `'disabled'`
- **Source**: Directly from backend `portal_status` field
- **Purpose**: Shows invitation state, NOT eligibility

### 2. Eligibility Check (Contract + Payment)
- **Function**: `isPortalEligible(lead)`
- **Returns**: `true` or `false`
- **Logic**: 
  - Contract status = `'signed'` AND
  - Payment status = `'succeeded'`
- **Purpose**: Determines if client can be invited

### 3. UI Components

#### `users-columns.tsx` (Portal Column)
```typescript
const portalStatus = derivePortalStatus(lead);  // Gets invitation state
const eligible = isPortalEligible(lead);        // Checks contract + payment

// If not eligible → Show "Not eligible" badge
if (!eligible) {
  return <Badge>Not eligible</Badge>;
}

// If eligible AND not_invited → Show "Invite" button
if (eligible && portalStatus === 'not_invited') {
  return <Button>Invite</Button>;
}
```

#### `data-table-row-actions.tsx` (Dropdown Menu)
```typescript
const portalStatus = derivePortalStatus(lead);
const eligible = isPortalEligible(lead);

// Enable invite button if eligible AND not_invited
const isInviteEnabled = eligible && (portalStatus === 'not_invited' || !portalStatus);
```

## Data Sources Checked

The `isPortalEligible()` function checks for contract/payment data in multiple places:

1. **Explicit flags**:
   - `portal_eligible === true`
   - `is_portal_eligible === true`

2. **Contract status**:
   - `contracts` array → looks for `status === 'signed'`
   - `contract_status === 'signed'`
   - `has_signed_contract === true`
   - `contract_signed === true`

3. **Payment status**:
   - `payments` array → looks for `status === 'succeeded'`
   - `payment_status === 'succeeded'`
   - `has_completed_payment === true`
   - `payment_succeeded === true`

## Debugging

Console logs have been added to show:
- What contract/payment data is available
- Why eligibility is true/false
- What fields are being checked

**To see the logs:**
1. Open browser console (F12)
2. Refresh the page
3. Look for logs starting with:
   - `🔍 DEBUG: Client mapping:` - Shows raw API data
   - `🔍 [Portal Eligibility]` - Shows eligibility check process

## Expected Behavior

For a client like "Jerry Bony" with:
- Contract status: `'signed'`
- Payment status: `'succeeded'`
- Portal status: `'not_invited'`

**Expected result**: "Invite" button should be enabled ✅

If the button is still disabled, check the console logs to see:
1. What contract/payment data the backend is sending
2. Why the eligibility check is returning `false`
3. What field names/structure the data uses

