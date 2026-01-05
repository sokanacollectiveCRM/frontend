# Client Portal Authentication Implementation

## Overview

Two authentication pages have been implemented for the client portal:
1. **Set Password Page** (`/auth/set-password`) - Where clients set their password after receiving the invite email
2. **Client Login Page** (`/auth/client-login`) - Separate login page for clients

## Files Created/Modified

### New Files
1. **`src/lib/supabase.ts`** - Supabase client configuration
2. **`src/features/auth/SetPassword.tsx`** - Set password page component
3. **`src/features/auth/ClientLogin.tsx`** - Client login page component

### Modified Files
1. **`src/features/auth/AuthRoutes.tsx`** - Added routes for both new pages

## Dependencies

### Installed
- `@supabase/supabase-js` - Supabase JavaScript client library

### Required Environment Variables

Add these to your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Routes

### Set Password Page
- **Route**: `/auth/set-password`
- **URL Format**: `http://localhost:3001/auth/set-password#access_token=TOKEN&type=recovery`
- **Access**: Public (no authentication required)
- **Purpose**: Clients set their password after clicking the invite link from email

### Client Login Page
- **Route**: `/auth/client-login`
- **Access**: Public (no authentication required)
- **Purpose**: Separate login page for clients (different from admin/doula login)

## Implementation Details

### Set Password Page Features
- ✅ Extracts `access_token` from URL hash
- ✅ Validates token type is 'recovery'
- ✅ Password validation with real-time feedback:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- ✅ Password confirmation matching
- ✅ Show/hide password toggle
- ✅ Real-time password strength indicator
- ✅ Error handling for invalid/expired tokens
- ✅ Success state with auto-redirect to login
- ✅ Uses Supabase Auth: `supabase.auth.verifyOtp()` and `supabase.auth.updateUser()`

### Client Login Page Features
- ✅ Email and password login form
- ✅ "Remember me" checkbox
- ✅ "Forgot password?" link
- ✅ Role verification (only allows 'client' role)
- ✅ Portal status check (optional endpoint)
- ✅ Session check on mount (redirects if already logged in)
- ✅ Error handling for invalid credentials
- ✅ Uses Supabase Auth: `supabase.auth.signInWithPassword()`
- ✅ Redirects non-client users with error message

## Authentication Flow

1. **Admin invites client** → Backend sends email with "Set Your Password" link
2. **Client clicks link** → Redirected to `/auth/set-password#access_token=...`
3. **Client sets password** → Password updated via Supabase Auth
4. **Success** → Auto-redirects to `/auth/client-login` after 3 seconds
5. **Client logs in** → Enters email/password
6. **Success** → Redirects to home page (`/`) (client dashboard can be added later)

## Backend Integration

### Already Implemented (Backend)
- ✅ `POST /api/admin/clients/:id/portal/invite` - Send portal invite
- ✅ `POST /api/admin/clients/:id/portal/resend` - Resend portal invite
- ✅ `POST /api/admin/clients/:id/portal/disable` - Disable portal access

### Frontend Only (No Backend Endpoint Needed)
- ✅ Password setting: `supabase.auth.updateUser({ password })`
- ✅ Client login: `supabase.auth.signInWithPassword({ email, password })`

### Optional Endpoints (Recommended)
- `GET /api/clients/portal/verify` - Verify token validity (for set password page)
- `GET /api/clients/me/portal-status` - Check portal status (for authenticated clients)

The client login page already includes optional portal status checking that gracefully handles missing endpoints.

## Error Handling

### Set Password Page
- ❌ Missing/invalid access token → Shows error, suggests requesting new invite
- ❌ Expired token (24 hour expiry) → Shows error message
- ❌ Weak password → Shows inline validation errors
- ❌ Passwords don't match → Shows error message
- ❌ Network errors → Shows error with retry option

### Client Login Page
- ❌ Invalid email/password → Shows generic error (doesn't reveal if email exists)
- ❌ Wrong role (admin/doula) → Signs out and shows error
- ❌ Portal disabled → Signs out and shows error
- ❌ Network errors → Shows error message

## UI/UX Features

- ✅ Consistent design with existing auth pages
- ✅ Mobile responsive
- ✅ Loading states with spinners
- ✅ Toast notifications for success/error
- ✅ Accessible form labels and ARIA attributes
- ✅ Keyboard navigation support
- ✅ Clear error messages
- ✅ Password strength indicator (Set Password page)

## Testing Checklist

- [ ] Set password page loads with valid token
- [ ] Set password page shows error with invalid/missing token
- [ ] Password validation works (requirements, matching)
- [ ] Password update succeeds
- [ ] Redirect to login page after success
- [ ] Client login page loads
- [ ] Login succeeds with correct credentials
- [ ] Login fails with wrong credentials
- [ ] Role verification works (blocks non-clients)
- [ ] Redirect to home page after login
- [ ] Mobile responsive on both pages
- [ ] Error messages are user-friendly
- [ ] Loading states work correctly

## Next Steps

1. **Add Environment Variables**: Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env`
2. **Create Client Dashboard**: Currently redirects to home page (`/`). Create a dedicated client dashboard route if needed
3. **Test with Real Supabase**: Test the full flow with actual Supabase project
4. **Optional**: Implement the optional backend endpoints for token verification and portal status

## Notes

- The access token in the URL hash is a Supabase recovery token, valid for 24 hours
- After setting password, the user can log in normally
- The client login is separate from admin/doula login for security and UX
- Portal status check is optional and gracefully handles missing endpoints
- Currently redirects to home page after login; can be updated to a dedicated client dashboard route

