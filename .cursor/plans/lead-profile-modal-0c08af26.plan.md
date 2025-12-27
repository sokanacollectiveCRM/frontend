---
name: Lead Profile Modal Implementation Plan
overview: ""
todos: []
---

# Lead Profile Modal Implementation Plan

## Overview

Create a modal that displays complete lead information when clicking any row in the Clients table. The modal will show all submitted request form fields and include a notes section (UI only, backend to be added later).

## 1. Create Lead Profile Modal Component

**File:** `src/features/clients/components/dialog/LeadProfileModal.tsx`

Create a new modal component with the following sections:

- Header with client name and close button
- Tabbed or sectioned layout for:
  - Contact Information (name, email, phone, address, etc.)
  - Service Details (services_interested, service_support_details, service_needed, payment_method)
  - Pregnancy/Health Information (due_date, birth_location, birth_hospital, number_of_babies, provider_type, pregnancy_number, allergies, health_notes, health_history)
  - Family Members (relationship_status, family member details)
  - Past Pregnancies (had_previous_pregnancies, previous_pregnancies_count, living_children_count, past_pregnancy_experience)
  - Referral (referral_source, referral_name, referral_email)
  - Demographics (race_ethnicity, primary_language, client_age_range, insurance, demographics_multi, demographics_annual_income)
  - Notes Section (textarea with placeholder for future backend integration)

Use existing Dialog components from `src/common/components/ui/dialog.tsx`.

## 2. Add Modal State Management

**File:** `src/features/clients/components/dialog/TableDialogs.tsx`

Add state for the new lead profile modal:

- `selectedClientId` state to track which client to display
- `isLeadProfileOpen` state to control modal visibility
- Pass these to the LeadProfileModal component

## 3. Fetch Full Client Data

**File:** `src/features/clients/components/dialog/LeadProfileModal.tsx`

Use the existing `useClients` hook's `getClientById(id, detailed=true)` method:

- Fetch data when modal opens using `clientId` prop
- Show loading state while fetching
- Display error state if fetch fails
- The endpoint `GET /clients/:id?detailed=true` should return all request form fields

## 4. Make Table Rows Clickable

**File:** `src/features/clients/components/users-columns.tsx`

Update the table cell rendering in the columns definition:

- Wrap the entire row content in a clickable element
- Add `cursor-pointer` and hover states
- On click, call a function to open the modal with the client ID
- Ensure the existing row action dropdown (Edit/Delete) still works

**Alternative approach:** Modify `src/features/clients/components/DroppableTableRow.tsx`

- Add onClick handler to the `<TableRow>` component
- Pass click handler from parent components

## 5. Display All Request Form Fields

Organize fields into collapsible sections or tabs:

**Section 1: Contact & Basic Info**

- firstname, lastname, email, phone_number
- preferred_contact_method, pronouns, preferred_name
- address, city, state, zip_code, home_type, home_access, pets

**Section 2: Services Requested**

- services_interested (display as badges/chips)
- service_support_details (multiline text)
- service_needed (multiline text)  
- payment_method

**Section 3: Pregnancy & Health**

- due_date, birth_location, birth_hospital
- number_of_babies, baby_name, provider_type, pregnancy_number
- allergies, health_history, health_notes

**Section 4: Family Information**

- relationship_status
- family_first_name, family_last_name, family_pronouns
- family_email, family_mobile_phone, family_work_phone

**Section 5: Past Pregnancies**

- had_previous_pregnancies (Yes/No badge)
- previous_pregnancies_count, living_children_count
- past_pregnancy_experience

**Section 6: Referral**

- referral_source, referral_name, referral_email

**Section 7: Demographics (Optional)**

- race_ethnicity, primary_language, client_age_range
- insurance, demographics_multi (display as list)
- demographics_annual_income

## 6. Add Notes Section (UI Only)

Create a notes section at the bottom or in a tab:

- Textarea for adding/editing notes
- Display placeholder: "Backend endpoint for notes coming soon"
- Add "Save Notes" button (disabled with tooltip explaining backend needed)
- Include timestamp and author fields (UI only, hardcoded for now)

Structure for future backend:

```typescript
interface Note {
  id: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  authorName: string;
}
```

## 7. Styling & UX

- Use existing UI components: Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
- Make modal large: `max-w-4xl` or `max-w-5xl`
- Add loading skeleton while fetching data
- Handle empty/null fields gracefully (show "Not provided" or "—")
- Ensure modal closes on ESC key and outside click
- Add smooth transitions

## 8. Update Context/Provider

**File:** `src/features/clients/contexts/` or parent component

- Pass `onRowClick` handler down to table components
- Handler should set `selectedClientId` and open modal

## Files to Create

- `src/features/clients/components/dialog/LeadProfileModal.tsx`

## Files to Modify

- `src/features/clients/components/dialog/TableDialogs.tsx` (add modal state)
- `src/features/clients/components/users-columns.tsx` OR `DroppableTableRow.tsx` (make rows clickable)
- `src/features/clients/Clients.tsx` (pass click handler if needed)
- `src/features/clients/components/users-dialogs.tsx` (add new modal to dialogs)

## Testing Checklist

- Click anywhere on a client row opens modal
- Modal displays all request form fields correctly
- Loading state appears while fetching
- Modal closes properly (X button, ESC, outside click)
- Existing Edit/Delete actions still work
- Empty/null fields display gracefully
- Notes textarea is present but non-functional (with explanation)