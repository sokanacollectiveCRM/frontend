# RequestForm Tests

This directory contains comprehensive unit tests for the multi-step RequestForm component and its related functionality.

## Test Structure

### Files

- **`RequestForm.test.tsx`** - Main form component tests
  - Form structure and navigation
  - Form validation
  - Field interactions
  - Form submission
  - Schema validation
  - Error handling
  - Accessibility
  - Step navigation

- **`useRequestForm.test.ts`** - Form hook tests
  - Schema validation
  - Step fields configuration
  - Form navigation logic
  - Form submission
  - Error handling

- **`MultiSelect.test.tsx`** - Multi-select functionality tests
  - Selection/deselection logic
  - "None apply" behavior
  - Edge cases and rapid interactions

## Test Coverage

### Form Validation
- ✅ Required field validation
- ✅ Email format validation
- ✅ Array field validation (services_interested)
- ✅ Step-by-step validation
- ✅ Error message display

### Navigation
- ✅ Progress bar functionality
- ✅ Step advancement with validation
- ✅ Back button behavior
- ✅ Final step submission

### Multi-Select Functionality
- ✅ Multiple option selection
- ✅ Option deselection
- ✅ "None apply" exclusive behavior
- ✅ Selection state management
- ✅ Edge cases (duplicates, rapid changes)

### User Experience
- ✅ Error message positioning (above inputs)
- ✅ User-friendly error messages
- ✅ Keyboard navigation
- ✅ Accessibility features

## Running Tests

```bash
# Run all RequestForm tests
npm test src/features/request/__tests__/

# Run specific test file
npm test RequestForm.test.tsx

# Run with coverage
npm test -- --coverage src/features/request/__tests__/
```

## Test Dependencies

The tests require the following dependencies (add to package.json if missing):

```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "vitest": "^1.0.0"
  }
}
```

## Key Test Scenarios

### 1. Form Submission Flow
```typescript
// Tests that the form can be completed successfully
test('submits form successfully on final step', async () => {
  // Navigate through all steps
  // Validate each step
  // Submit on final step
  // Verify submission
});
```

### 2. Validation Behavior
```typescript
// Tests that validation prevents navigation
test('prevents navigation when validation fails', async () => {
  // Try to advance with invalid data
  // Verify step doesn't change
  // Verify errors are displayed
});
```

### 3. Multi-Select Logic
```typescript
// Tests the complex multi-select behavior
test('"None apply" deselects all other options', () => {
  // Select multiple options
  // Click "None apply"
  // Verify only "None apply" is selected
});
```

## Mock Strategy

The tests use comprehensive mocking to isolate the form logic:

- **Form Hook Mocking**: Mocks `useRequestForm` to test different states
- **Step Component Mocking**: Mocks individual step components for focused testing
- **Validation Mocking**: Mocks Zod schema validation for edge cases
- **Event Mocking**: Mocks user interactions and form events

## Best Practices

1. **Isolation**: Each test focuses on a single piece of functionality
2. **Realistic Data**: Tests use realistic form data that matches the schema
3. **Edge Cases**: Tests cover error conditions and boundary cases
4. **User Experience**: Tests verify the actual user interaction flow
5. **Accessibility**: Tests ensure keyboard navigation and screen reader support

## Adding New Tests

When adding new functionality to the form:

1. **Add unit tests** for the new feature
2. **Update integration tests** to include the new feature
3. **Test edge cases** and error conditions
4. **Verify accessibility** of new components
5. **Update this README** with new test descriptions

## Troubleshooting

### Common Issues

1. **Mock not working**: Ensure mocks are defined before the component renders
2. **Async test failures**: Use `waitFor` for asynchronous operations
3. **Form state issues**: Reset mocks between tests with `beforeEach`
4. **Type errors**: Ensure test dependencies are properly installed

### Debug Tips

```typescript
// Debug form state
console.log('Form values:', form.getValues());
console.log('Form errors:', form.formState.errors);

// Debug test state
console.log('Current step:', step);
console.log('Validation result:', await form.trigger());
``` 