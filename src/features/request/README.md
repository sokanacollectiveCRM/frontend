# Request Form Documentation

## Overview

The Request Form is a multi-step form component that allows clients to submit service requests to Sokana Collective for doula matching. The form collects comprehensive information across 10 steps to ensure proper client-doula matching.

## Features

### Multi-Step Form Structure
- **10 total steps** with progress tracking
- **Step-by-step validation** with user-friendly error messages
- **Floating label animations** for better UX
- **Responsive design** with clean, modern styling

### Form Steps
1. **Client Details** - Personal information and contact preferences
2. **Home Details** - Address and home environment information
3. **Family Members** - Partner/family contact information
4. **Referral** - How the client found Sokana Collective
5. **Health History** - Medical background and allergies
6. **Pregnancy/Baby** - Due date, birth location, provider type
7. **Past Pregnancies** - Previous pregnancy experience
8. **Services Interested** - Multi-select service preferences
9. **Payment** - Payment method and service specifics
10. **Client Demographics** - Race, language, age, insurance

### Key Features
- **Real-time validation** with Zod schema
- **Toast notifications** for success/error feedback
- **Loading states** during submission
- **Success page** with next steps information
- **Backend integration** with proper error handling

## Technical Architecture

### Files Structure
```
src/features/request/
├── RequestForm.tsx              # Main form component
├── RequestForm.module.scss      # Styling
├── useRequestForm.ts           # Form logic and validation
├── Step1Personal.tsx           # Step 1 component
├── Step3Home.tsx              # Steps 2-10 components
└── __tests__/
    └── RequestForm.test.tsx    # Test suite
```

### Key Components

#### RequestForm.tsx
- Main form orchestrator
- Handles form submission to backend
- Manages loading and success states
- Progress bar calculation

#### useRequestForm.ts
- Zod schema definition for all form fields
- Form validation logic
- Step management and navigation
- Default values for testing

#### Step Components
- Individual step components with specific validation
- Floating label animations
- Error message display
- Navigation between steps

## Testing Directions

### Running Tests
```bash
# Run all request form tests
npm run test:run -- src/features/request/__tests__/RequestForm.test.tsx

# Run with verbose output
npm run test:run -- --reporter=verbose src/features/request/__tests__/RequestForm.test.tsx
```

### Test Coverage
The test suite covers:
- ✅ **Form Rendering** - Initial render and button states
- ✅ **Form Submission** - Success, error, and network error handling
- ✅ **Loading States** - Spinner during submission
- ✅ **Form Fields** - Field rendering and user interaction
- ✅ **Success State** - Success message display

### Manual Testing Checklist

#### Form Navigation
- [ ] Progress bar updates correctly
- [ ] Back/Next buttons work properly
- [ ] Step validation prevents progression with invalid data
- [ ] Form scrolls to first error field

#### Field Validation
- [ ] Required fields show appropriate error messages
- [ ] Email validation works correctly
- [ ] Number inputs handle string/number conversion
- [ ] Dropdown selections work (number of babies)
- [ ] Multi-select works (services interested)

#### Form Submission
- [ ] Success message displays correctly
- [ ] Error handling works for network issues
- [ ] Loading spinner shows during submission
- [ ] Form data is properly formatted for backend

#### UI/UX
- [ ] Floating labels animate correctly
- [ ] Error messages are user-friendly
- [ ] Form is responsive on different screen sizes
- [ ] Focus states work properly

### Testing Specific Fields

#### Number Input Fields
- **Previous pregnancies count** - Should accept numbers, convert strings
- **Living children count** - Should accept numbers, convert strings
- **Pregnancy number** - Should be required number

#### Dropdown Fields
- **Number of babies** - Should convert "Singleton" → 1, "Twins" → 2, etc.
- **Provider type** - Should be required selection

#### Multi-select Fields
- **Services interested** - Should allow multiple selections
- **Demographics multi** - Should allow multiple selections

## Backend Integration

### API Endpoint
```
POST ${VITE_APP_BACKEND_URL}/requestService/requestSubmission
```

### Payload Structure
The form submits a comprehensive payload including:
- Personal information (name, email, phone)
- Address and home details
- Family member information
- Health history
- Pregnancy and baby details
- Service preferences
- Payment information
- Demographics

### Error Handling
- Network errors show user-friendly messages
- Backend errors display specific error messages
- Validation errors prevent submission
- Success state shows confirmation message

## Recent Fixes

### Validation Issues Resolved
- ✅ **Number input validation** - Fixed string/number conversion
- ✅ **Dropdown validation** - Fixed "Expected number, received string" errors
- ✅ **Error messages** - Made more user-friendly
- ✅ **Animation fixes** - Floating labels work with empty fields
- ✅ **Field removal** - Removed unused `baby_sex` field

### Technical Improvements
- ✅ **TypeScript errors** - Fixed import.meta.env → process.env
- ✅ **PostCSS warnings** - Resolved configuration issues
- ✅ **File conflicts** - Excluded .js files from TypeScript compilation

## Development Notes

### Schema Management
- All form fields are defined in `useRequestForm.ts`
- Zod provides runtime validation
- TypeScript types are inferred from schema
- Step fields are defined in `stepFields` array

### Styling
- Uses CSS modules for scoped styling
- Floating label animations via CSS transitions
- Responsive grid layout
- Consistent color scheme and typography

### State Management
- React Hook Form for form state
- Local state for loading and success states
- Step management with useState
- Focus state management for animations

## Troubleshooting

### Common Issues
1. **Validation errors** - Check Zod schema in useRequestForm.ts
2. **Animation issues** - Verify focus state logic in step components
3. **Submission errors** - Check backend URL and network connectivity
4. **TypeScript errors** - Ensure all imports and types are correct

### Debug Tips
- Use browser dev tools to inspect form state
- Check console for validation errors
- Verify network requests in Network tab
- Test with different data combinations

## Future Enhancements

### Potential Improvements
- Add form persistence (save draft)
- Implement file uploads for documents
- Add more validation rules
- Enhance accessibility features
- Add form analytics tracking 