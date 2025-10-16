# Doula Assignment Feature Implementation

## Overview
This implementation adds a "Doula Assignment" section to the client profile modal, allowing admins to assign and unassign doulas to clients.

## Files Created/Modified

### 1. API Helpers - `src/api/clients/doulaAssignments.ts`
**Purpose:** Handles all API communication for doula assignment functionality.

**Exports:**
- `Doula` interface - Represents a doula team member
- `AssignedDoula` interface - Represents a doula-client assignment
- `fetchAvailableDoulas(token)` - Gets all available doulas from the team
- `fetchAssignedDoulas(clientId, token)` - Gets doulas assigned to a specific client
- `assignDoula(clientId, doulaId, token)` - Assigns a doula to a client
- `unassignDoula(clientId, doulaId, token)` - Removes a doula assignment

**Backend Integration:**
- Uses `VITE_APP_BACKEND_URL` environment variable (falls back to `http://localhost:5050`)
- All requests include `Authorization: Bearer <token>` header
- All requests use `credentials: 'include'` for cookie support

### 2. UI Component - `src/features/clients/components/DoulaAssignment.tsx`
**Purpose:** Renders the doula assignment interface with assign/unassign capabilities.

**Props:**
- `clientId: string` - The ID of the client being viewed
- `canAssign: boolean` - Whether the current user can assign/unassign doulas

**Features:**
- **Admin Controls:**
  - Dropdown to select available doulas
  - Assign button with loading state
  - Remove buttons for each assigned doula
  
- **Read-Only View:**
  - Non-admin users see the list of assigned doulas only
  - No assign/remove controls shown
  
- **Loading States:**
  - Initial load spinner
  - Button-level spinners for assign action
  - Individual remove button spinners
  
- **Error Handling:**
  - Error banner at the top of the section
  - Toast notifications for success/failure
  - Prevents duplicate assignments
  
- **UI Elements:**
  - Avatar/initials display for each doula
  - Doula name and email
  - Status badge (e.g., "active")
  - Empty state message when no doulas assigned

### 3. Modal Integration - `src/features/clients/components/dialog/LeadProfileModal.tsx`
**Changes:**
- Added import for `DoulaAssignment` component
- Added import for `UserContext` to access user role
- Added `useContext(UserContext)` to get current user
- Added new collapsible section "Doula Assignment" between Account Information and Notes
- Section auto-detects admin role and passes `canAssign={user?.role === 'admin'}`

## User Flow

### Admin User Flow
1. Admin opens a client profile modal
2. Expands "Doula Assignment" section
3. Sees currently assigned doulas (if any)
4. Selects a doula from the dropdown
5. Clicks "Assign" button
6. System validates (no duplicates)
7. API call made, list refreshes on success
8. Toast notification confirms success
9. Can click "Remove" (X) button on any assigned doula
10. Confirmation toast shown after removal

### Non-Admin User Flow
1. User opens a client profile modal
2. Expands "Doula Assignment" section
3. Sees read-only list of assigned doulas
4. No assign/remove controls visible
5. Can see doula names, emails, and status

## Security & Permissions
- Admin-only access controlled at UI level via `canAssign` prop
- Backend should also enforce authorization (not in scope of this frontend work)
- User role checked via `user?.role === 'admin'`
- Auth token retrieved from `localStorage.getItem('authToken')`

## Styling & Consistency
- Uses existing shadcn/ui components (Button, Select, Alert)
- Matches modal styling with other collapsible sections
- Responsive layout with flexbox
- Hover states on doula cards
- Loading spinners using Lucide React icons
- Status badges with green color scheme
- Border-dashed empty state

## Backend Endpoints Used

All endpoints are relative to base URL (`VITE_APP_BACKEND_URL` or `http://localhost:5050`):

1. **GET /clients/team/doulas**
   - Fetch available doulas
   - Response: `{ success: true, doulas: Doula[] }`

2. **GET /clients/:clientId/assigned-doulas**
   - Fetch doulas assigned to client
   - Response: `{ success: true, doulas: AssignedDoula[] }`

3. **POST /clients/:clientId/assign-doula**
   - Assign doula to client
   - Body: `{ doulaId: string }`
   - Response: `{ success: true, assignment: {...} }`

4. **DELETE /clients/:clientId/assign-doula/:doulaId**
   - Remove doula assignment
   - Response: `{ success: true, message: string }`

## Testing Checklist

- [ ] Admin can see doula assignment section
- [ ] Admin can assign a doula from dropdown
- [ ] Admin can remove an assigned doula
- [ ] Non-admin sees list only (no controls)
- [ ] Loading states display correctly
- [ ] Error messages shown on API failures
- [ ] Duplicate assignments prevented
- [ ] Toast notifications work
- [ ] Empty state shows when no doulas assigned
- [ ] Avatar/initials display correctly
- [ ] Modal doesn't break on network errors

## Dependencies
- React (hooks: useState, useEffect, useContext)
- sonner (toast notifications)
- lucide-react (icons: Loader2, UserPlus, X, Users)
- shadcn/ui components (Button, Select, Alert)
- date-fns (inherited from modal, not used in doula section)

## Future Enhancements (Not Implemented)
- Confirmation dialog before removing a doula
- Search/filter in doula dropdown
- Show doula specialties or certifications
- Assignment notes or comments
- Audit log of assignment changes
- Email notifications on assignment
- Bulk assign/unassign operations

