# Client Login Test Instructions

## Prerequisites

1. **Environment Variables**: Ensure these are set in your production environment (Vercel/Netlify/etc.):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. **Supabase Setup**: 
   - Access your Supabase dashboard
   - Note your project URL and anon key
   - Ensure email authentication is enabled

3. **Test Client Account**: You'll need a test client user in Supabase

---

## Test Scenario 1: Complete Client Portal Flow (Happy Path)

### Step 1: Create Test Client in Supabase

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" → "Create new user"
3. Enter:
   - **Email**: `test.client@example.com`
   - **Password**: (leave empty - will be set via invite)
   - **User Metadata** (click "Raw App Meta Data"):
     ```json
     {
       "role": "client",
       "firstname": "Test",
       "lastname": "Client"
     }
     ```
4. Click "Create user"
5. **Important**: The user should be created but NOT have a password yet

### Step 2: Send Portal Invite (Admin Side)

1. Log in as **Admin** to your CRM
2. Navigate to **Leads** page (`/clients`)
3. Find or create a lead with email matching your test client (`test.client@example.com`)
4. Ensure the lead has:
   - Status: `matching` (to make them eligible for portal)
   - OR manually set `portal_status: "eligible"` in database
5. Click the **"Invite"** button in the Portal column
   - OR use the row actions menu (three dots) → "Invite to portal"
6. Click **"Send Invite"** in the modal
7. **Expected**: 
   - Success toast: "Invite sent to test.client@example.com"
   - Portal status changes to "Invited" badge
   - Check Supabase → Authentication → Users → the user should receive an email

### Step 3: Set Password (Client Side)

1. Check the email inbox for `test.client@example.com`
2. Open the invite email from Supabase
3. Click the invite link (should look like: `https://yourdomain.com/auth/set-password#access_token=...&type=recovery`)
4. **Expected on Set Password Page**:
   - Page loads at `/auth/set-password`
   - Form shows password and confirm password fields
   - Password requirements visible (min 8 chars, uppercase, lowercase, number)
5. Enter password:
   - **Password**: `Test1234!`
   - **Confirm Password**: `Test1234!`
6. Click **"Set Password"**
7. **Expected**:
   - Loading state shows
   - Success message: "Password set successfully! Redirecting to login..."
   - Automatic redirect to `/auth/client-login` after 2 seconds

### Step 4: Client Login

1. You should be redirected to `/auth/client-login` (or navigate manually)
2. **Expected on Login Page**:
   - Page shows email and password fields
   - "Remember me" checkbox
   - "Forgot password?" link
   - "Client Portal Login" title
3. Enter credentials:
   - **Email**: `test.client@example.com`
   - **Password**: `Test1234!`
   - Check "Remember me" (optional)
4. Click **"Sign In"**
5. **Expected**:
   - Loading state shows
   - Success: Redirect to `/` (home page)
   - Client dashboard loads with tabs: Profile, Contracts, Payment History
   - Sidebar shows "Client Portal" section with Dashboard link
   - User avatar in sidebar footer shows client name/email

### Step 5: Verify Client Dashboard

1. **Profile Tab**:
   - Shows client information
   - Can edit profile fields (firstname, lastname, phone, address, etc.)
   - Email is read-only
   - Avatar shows initials

2. **Contracts Tab**:
   - Shows list of contracts (if any)
   - Or empty state: "No contracts found"

3. **Payment History Tab**:
   - Shows payment history (if any)
   - Or empty state: "No payment history found"
   - Shows total paid amount

### Step 6: Client Logout

1. Click user avatar in sidebar footer
2. Click **"Log out"** from dropdown
3. **Expected**:
   - Redirect to `/auth/client-login`
   - Session cleared
   - Cannot access client dashboard anymore

---

## Test Scenario 2: Error Cases

### Test 2.1: Invalid Invite Link

1. Navigate to `/auth/set-password#access_token=invalid&type=recovery`
2. **Expected**: Error message: "Invalid or missing access token. Please request a new invite."

### Test 2.2: Expired Invite Link

1. Wait 24+ hours after invite sent (or manually expire in Supabase)
2. Try to access the invite link
3. **Expected**: Error message about expired/invalid link

### Test 2.3: Wrong Password on Login

1. Go to `/auth/client-login`
2. Enter correct email but wrong password
3. **Expected**: Error message: "Invalid email or password"

### Test 2.4: Non-Client User Trying to Login

1. Create a Supabase user with `role: "admin"` or no role
2. Try to log in at `/auth/client-login`
3. **Expected**: Error message: "Access denied. Only clients can access this portal."

### Test 2.5: Portal Disabled Client

1. In admin panel, disable portal access for a client
2. Try to log in as that client
3. **Expected**: Error message about portal access being disabled

### Test 2.6: Weak Password

1. On Set Password page, enter password: `weak`
2. **Expected**: 
   - Validation errors show
   - Submit button disabled
   - Error messages: "Password must be at least 8 characters", etc.

### Test 2.7: Password Mismatch

1. On Set Password page:
   - Password: `Test1234!`
   - Confirm Password: `Different123!`
2. **Expected**: Error message: "Passwords do not match"

---

## Test Scenario 3: Admin Portal Invite Actions

### Test 3.1: Resend Invite

1. As admin, find a lead with status "Invited"
2. Click row actions menu (three dots)
3. Click **"Resend invite"**
4. **Expected**:
   - Success toast: "Invite resent to [email]"
   - New email sent to client
   - `last_invite_sent_at` timestamp updates

### Test 3.2: Disable Portal Access

1. As admin, find a lead with status "Active"
2. Click row actions menu (three dots)
3. Click **"Disable portal access"**
4. **Expected**:
   - Success toast: "Portal access disabled for [email]"
   - Portal status changes to "Disabled" badge
   - Client cannot log in anymore

### Test 3.3: Portal Status Badges

Verify badges show correctly:
- **Not eligible**: Gray badge (status = "lead")
- **Eligible**: Shows "Invite" button (status = "matching")
- **Invited**: Amber badge
- **Active**: Green badge
- **Disabled**: Red badge

---

## Test Scenario 4: Edge Cases

### Test 4.1: Already Logged In Client

1. Log in as client
2. Navigate to `/auth/client-login`
3. **Expected**: Should redirect to `/` (home/dashboard)

### Test 4.2: Client Tries to Access Admin Routes

1. Log in as client
2. Try to navigate to `/team` or `/hours`
3. **Expected**: 
   - Route not accessible (redirected or 403)
   - Sidebar doesn't show admin-only links

### Test 4.3: Multiple Tabs

1. Log in as client in Tab 1
2. Open Tab 2, navigate to `/auth/client-login`
3. **Expected**: Tab 2 should detect session and redirect to dashboard

### Test 4.4: Session Expiry

1. Log in as client
2. Wait for session to expire (or manually clear in browser)
3. Try to access client dashboard
4. **Expected**: Redirect to login page

---

## Test Scenario 5: Portal Invite Eligibility

### Test 5.1: Not Eligible Lead

1. Create a lead with status `"lead"`
2. **Expected**: Portal column shows "Not eligible" badge with tooltip
3. Row actions menu: "Invite to portal" should be disabled

### Test 5.2: Eligible Lead

1. Create a lead with status `"matching"`
2. **Expected**: Portal column shows "Invite" button
3. Row actions menu: "Invite to portal" should be enabled

### Test 5.3: Invited Lead

1. After sending invite, lead status should be "Invited"
2. **Expected**: 
   - Portal column shows "Invited" badge
   - Row actions menu: "Resend invite" enabled, "Invite to portal" disabled

---

## Checklist Summary

### Admin Side (Leads Page)
- [ ] Portal column displays correctly for all statuses
- [ ] Invite button works for eligible leads
- [ ] Invite modal opens and sends invite
- [ ] Resend invite works for invited leads
- [ ] Disable portal works for active clients
- [ ] Status badges update immediately after actions
- [ ] Tooltips show for disabled actions

### Client Side (Authentication)
- [ ] Set Password page loads from invite link
- [ ] Password validation works (length, complexity)
- [ ] Password confirmation matching works
- [ ] Success redirect to login page works
- [ ] Client login page loads correctly
- [ ] Login with correct credentials works
- [ ] Login with wrong credentials shows error
- [ ] Non-client users cannot log in
- [ ] Remember me checkbox works (optional)

### Client Side (Dashboard)
- [ ] Redirects to dashboard after login
- [ ] Profile tab loads and displays data
- [ ] Profile can be edited and saved
- [ ] Contracts tab loads (empty or with data)
- [ ] Payment History tab loads (empty or with data)
- [ ] Sidebar shows only client-appropriate links
- [ ] User avatar shows in sidebar footer
- [ ] Logout redirects to client login page

### Error Handling
- [ ] Invalid invite links show error
- [ ] Expired invite links show error
- [ ] Weak passwords are rejected
- [ ] Password mismatch is caught
- [ ] Network errors are handled gracefully
- [ ] Supabase errors show user-friendly messages

---

## Debugging Tips

1. **Check Browser Console**: Look for Supabase errors or network issues
2. **Check Supabase Dashboard**: 
   - Authentication → Users (verify user exists)
   - Authentication → Email Templates (verify invite email template)
3. **Check Network Tab**: Verify API calls to Supabase endpoints
4. **Check Local Storage**: Supabase stores session in `sb-<project-ref>-auth-token`
5. **Environment Variables**: Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set

---

## Common Issues & Solutions

### Issue: "Supabase environment variables are not set"
**Solution**: Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to production environment

### Issue: "Invalid email or password" but credentials are correct
**Solution**: 
- Check user exists in Supabase
- Verify user has `role: "client"` in metadata
- Check if password was set correctly

### Issue: Invite email not received
**Solution**:
- Check Supabase email settings
- Check spam folder
- Verify email address is correct
- Check Supabase logs for email sending errors

### Issue: Redirect loops
**Solution**:
- Clear browser cache and localStorage
- Check route guards in `ProtectedRoutes.tsx`
- Verify session is being detected correctly

---

## Notes

- All client portal routes are prefixed with `/auth/client-*` or `/auth/set-password`
- Client dashboard is at `/` (home route) when logged in as client
- Admin/doula users should NOT be able to access client login page
- Client users should NOT be able to access admin routes

