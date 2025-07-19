# Request Form Testing Guide

## Quick Test Commands

```bash
# Run all request form tests
npm run test:run -- src/features/request/__tests__/RequestForm.test.tsx

# Run with verbose output to see form state
npm run test:run -- --reporter=verbose src/features/request/__tests__/RequestForm.test.tsx

# Run specific test
npm run test:run -- --grep "Form Fields" src/features/request/__tests__/RequestForm.test.tsx
```

## Manual Testing Checklist

### ✅ Form Navigation
- [ ] Progress bar fills correctly
- [ ] Back button works (except step 1)
- [ ] Next button disabled until validation passes
- [ ] Form scrolls to first error field

### ✅ Field Validation
- [ ] Required fields show errors when empty
- [ ] Email validation accepts valid emails
- [ ] Number inputs accept both strings and numbers
- [ ] Dropdowns work (number of babies, provider type)
- [ ] Multi-select works (services, demographics)

### ✅ Form Submission
- [ ] Loading spinner shows during submission
- [ ] Success message displays after submission
- [ ] Error handling works for network issues
- [ ] Form data is properly formatted

### ✅ UI/UX
- [ ] Floating labels animate on focus/blur
- [ ] Error messages are user-friendly
- [ ] Form is responsive
- [ ] Focus states work properly

## Common Issues & Fixes

### "Expected number, received string" Error
- **Cause**: Number inputs sending string values
- **Fix**: Use `setValueAs` in form registration or update Zod schema

### Floating Label Animation Issues
- **Cause**: Focus state not properly managed
- **Fix**: Check `handleFocus` and `handleBlur` functions

### Form Not Submitting
- **Cause**: Validation errors or network issues
- **Fix**: Check console for errors, verify backend URL

### TypeScript Errors
- **Cause**: Type mismatches in schema
- **Fix**: Update Zod schema or form registration

## Test Data

### Valid Test Data
```javascript
{
  firstname: 'John',
  lastname: 'Doe',
  email: 'john.doe@example.com',
  phone_number: '555-123-4567',
  // ... other required fields
}
```

### Edge Cases to Test
- Empty required fields
- Invalid email formats
- Number fields with strings
- Multi-select with no selections
- Network timeouts
- Backend errors

## Debug Tips

1. **Check Form State**: Use `form.getValues()` in console
2. **View Errors**: Use `form.formState.errors` in console
3. **Network Requests**: Check Network tab in dev tools
4. **Validation**: Use `form.trigger()` to test specific fields

## Recent Fixes Applied

- ✅ Fixed number input validation
- ✅ Improved error messages
- ✅ Fixed floating label animations
- ✅ Removed unused baby_sex field
- ✅ Fixed TypeScript import.meta.env error
- ✅ Resolved PostCSS warnings 