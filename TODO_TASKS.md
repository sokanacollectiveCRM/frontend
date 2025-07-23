# TODO Tasks

## 🐞 Bug: Fix Validation and Input Issues on Client Request Form

**Type:** Bug  
**Priority:** Medium  
**Status:** To Do  
**Assignee:** [Developer Name]

### Description
Implement the following corrections based on feedback:

- **Remove Redundant Phone Number Field in Step 2**: Remove the phone number input field from Step 2 (currently being asked again). The mobile number collected in Step 1 will be the only phone input retained. Ensure the Step 1 phone number value persists correctly through the rest of the form and is included in the final submission.
- Make family member email optional (not a required field)
- Update referral email field to be optional if the user doesn't have it
- Fix double typing issue on the first field of the Pregnancy/Baby screen

### Acceptance Criteria
- [ ] Phone number field appears only in Step 1, removed from Step 2
- [ ] Step 1 phone number value persists through all subsequent steps
- [ ] Phone number is included in final form submission
- [ ] Family member email field is optional with no validation errors
- [ ] Referral email field is optional when user doesn't have referral information
- [ ] First field on Pregnancy/Baby screen doesn't have double typing behavior
- [ ] All form validation passes with these changes
- [ ] Form submission works correctly with optional fields

### Technical Notes
- Check form validation schemas in `useRequestForm.ts`
- Review field definitions in step components (Step1Personal, Step2Health, etc.)
- Test form submission flow with optional fields
- Ensure mobile and desktop views both work correctly

### Files to Modify
- `src/features/request/useRequestForm.ts` - Update validation schemas
- `src/features/request/Step1Personal.tsx` - Remove duplicate phone field
- `src/features/request/Step2Health.tsx` - Make family email optional
- `src/features/request/Step3Home.tsx` - Make referral email optional
- `src/features/request/Step4Service.tsx` - Fix double typing issue

--- 