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

## 📘 Task 17: Create Platform SOP

**Area:** Operations / Documentation  
**Priority Rank:** 1  
**Status:** Complete  
**Notes:** Staff-facing SOP created at `docs/PLATFORM_SOP.md`

### Description
Create a Standard Operating Procedure for the platform so staff know how to use the CRM consistently during launch and daily operations.

### Acceptance Criteria
- [x] Platform overview
- [x] Staff roles and responsibilities
- [x] Daily admin checklist
- [x] New request form / lead intake workflow
- [x] Pipeline status workflow
- [x] Client management workflow
- [x] Contract workflow
- [x] Billing and payment schedule workflow
- [x] Doula assignment workflow
- [x] Team coordination workflow
- [x] Exception handling
- [x] Launch review checklist

### Updated Priority Order
- [x] 1. Create platform SOP
- [ ] 2. Update internal/admin contract email copy
- [ ] 3. Update client-facing contract email copy
- [ ] 4. Add contract templates
- [ ] 5. PFSC teenager request form
- [ ] 6. Doula/team profile updates

---
