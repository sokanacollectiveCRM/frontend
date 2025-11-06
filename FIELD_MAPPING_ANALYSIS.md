# Frontend Field Mapping Analysis: `children_expected` and `payment_method`

## 🔍 Analysis Results

### **1. `children_expected` Field**

#### **📍 Location in Request Form:**
- **Schema Definition**: `src/features/request/useRequestForm.ts` (line 17)
  ```typescript
  children_expected: z.string().optional()
  ```

- **Step Assignment**: Step 1 (Client Details) - `src/features/request/contexts/RequestFormContext.tsx` (line 196)
  ```typescript
  ['firstname', 'lastname', 'email', 'phone_number', 'pronouns', 'pronouns_other', 
   'preferred_contact_method', 'preferred_name', 'children_expected']
  ```

- **Default Value**: `src/features/request/contexts/RequestFormContext.tsx` (line 63)
  ```typescript
  children_expected: '2',  // Test data
  ```

#### **⚠️ ISSUE FOUND:**
**The `children_expected` field is defined in the schema BUT has NO visible input field in `Step1Personal.tsx`!**

This means:
- ✅ Field exists in validation schema
- ✅ Field is included in step validation array
- ✅ Field has test data
- ❌ **NO INPUT FIELD** rendered in the UI
- ❌ Users cannot enter this value (it will always be the default test value or empty)

**Possible Reasons:**
1. Field was removed from UI but left in schema (technical debt)
2. Field is meant to be auto-calculated
3. Field rendering code was accidentally deleted

**Files Checked:**
- ✅ `src/features/request/Step1Personal.tsx` - NO input field found
- ✅ Component only renders: firstname, lastname, email, phone_number, preferred_contact_method, pronouns, preferred_name

---

### **2. `payment_method` Field**

#### **📍 Location in Request Form:**

**Schema Definition**: `src/features/request/useRequestForm.ts` (line 109)
```typescript
payment_method: z.string().min(1, 'Please select how you plan to pay for services.')
```

**Step Assignment**: Step 9 (Payment) - line 241
```typescript
['payment_method', 'annual_income', 'service_specifics']
```

**Form Input**: `src/features/request/Step3Home.tsx` (lines 1467-1571)
```tsx
<Popover
  open={open.payment_method}
  onOpenChange={(v) => setOpen((o) => ({ ...o, payment_method: v }))}
>
  <PopoverTrigger asChild>
    <button
      id='payment_method'
      aria-invalid={!!errors.payment_method}
    >
      {values.payment_method || 'How do you plan to pay for services?'}
    </button>
  </PopoverTrigger>
  <PopoverContent>
    {paymentMethodOptions.map((opt) => (
      <div onClick={() => {
        form.setValue('payment_method', opt);
        setOpen((o) => ({ ...o, payment_method: false }));
      }}>
        {opt}
      </div>
    ))}
  </PopoverContent>
</Popover>
```

**Options**: `['Self-Pay', 'Private Insurance', 'Medicaid', 'Other']`

**Default Value**: `src/features/request/contexts/RequestFormContext.tsx` (line 117)
```typescript
payment_method: 'Private Insurance',  // Test data
```

#### **✅ Status:**
- ✅ Field exists in validation schema
- ✅ Field has visible Popover select input in Step 9
- ✅ Field is required
- ✅ Has proper validation message
- ✅ Users can select from 4 options

---

### **3. LeadProfileModal (Admin Edit Form)**

#### **`children_expected` in Modal:**
**Location**: `src/features/clients/components/dialog/LeadProfileModal.tsx`

**Initialization** (line 153):
```typescript
children_expected: client.children_expected || '',
```

**Form Field** (line 606):
```tsx
{renderEditableField('Children Expected', 'children_expected')}
```
- **Type**: Text input (default)
- **Label**: "Children Expected"  
- **Field Key**: `children_expected` ✅

#### **`payment_method` in Modal:**

**Initialization** (line 170):
```typescript
payment_method: client.payment_method || '',
```

**Form Field** (line 628):
```tsx
{renderEditableField('Payment Method', 'payment_method', undefined, 'select', PAYMENT_METHOD_OPTIONS)}
```
- **Type**: Select dropdown
- **Label**: "Payment Method"
- **Field Key**: `payment_method` ✅
- **Options**: `['Self-Pay', 'Private Insurance', 'Medicaid', 'Other']` (line 87)

---

### **4. Update Function (PUT /clients/:id)**

**Location**: `src/features/clients/components/dialog/LeadProfileModal.tsx` (lines 254-356)

```typescript
const handleSaveChanges = async () => {
  // Build update payload
  const updateData: any = {};
  
  Object.keys(editedData).forEach(key => {
    const originalValue = client[key as keyof Client];
    const newValue = editedData[key as keyof Client];
    
    // Smart change detection
    if (fieldChanged) {
      updateData[key] = newValue;  // ← Sends field name AS-IS
      changedFields.push(key);
    }
  });
  
  // API call
  const result = await updateClient(client.id, updateData);
  // Example: updateData = { children_expected: "2", payment_method: "Private Insurance" }
}
```

**API Call**: `src/common/utils/updateClient.ts` (line 28)
```typescript
await fetch(`${cleanBaseUrl}/clients/${clientId}`, {
  method: 'PUT',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-type': 'application/json',
  },
  body: JSON.stringify(updateData),
});
```

**Request Body Example:**
```json
{
  "children_expected": "2",
  "payment_method": "Private Insurance"
}
```

---

### **5. Field Name Matching**

| Field Name | Frontend Sends | Backend Expects | Match? | Notes |
|------------|---------------|-----------------|--------|-------|
| `children_expected` | `children_expected` | `children_expected` | ✅ YES | Snake_case, exact match |
| `payment_method` | `payment_method` | `payment_method` | ✅ YES | Snake_case, exact match |

**Field names are 100% identical - NO mismatch!** ✅

---

### **6. Data Flow Diagram**

```
REQUEST FORM SUBMISSION:
┌─────────────────────────────────────────────────────────────┐
│ Step1Personal.tsx                                           │
│ - NO input for children_expected ❌                         │
│ - Input for preferred_contact_method ✅                     │
│                                                              │
│ Step3Home.tsx (Step9Payment)                                │
│ - Popover select for payment_method ✅                      │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────────────────┐
│ RequestFormContext.tsx                                      │
│ defaultValues: {                                            │
│   children_expected: '2',        ← Test data               │
│   payment_method: 'Private Insurance'  ← Test data         │
│ }                                                            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────────────────┐
│ POST /requestService/requestSubmission                      │
│ {                                                            │
│   "children_expected": "2",                                 │
│   "payment_method": "Private Insurance",                    │
│   ... all other 54 fields                                   │
│ }                                                            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ↓
        [Saved to Database]
                 │
                 ↓
┌────────────────────────────────────────────────────────────┐
│ ADMIN MODAL EDIT:                                           │
│ LeadProfileModal.tsx                                        │
│                                                              │
│ 1. Load client data:                                        │
│    children_expected: client.children_expected || ''        │
│    payment_method: client.payment_method || ''              │
│                                                              │
│ 2. Render editable fields:                                  │
│    - Children Expected: <Input /> ✅                        │
│    - Payment Method: <Select /> ✅                          │
│                                                              │
│ 3. On Save:                                                 │
│    updateData = {                                           │
│      children_expected: "3",     ← Changed value            │
│      payment_method: "Medicaid"  ← Changed value            │
│    }                                                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────────────────┐
│ updateClient(clientId, updateData)                          │
│ src/common/utils/updateClient.ts                            │
│                                                              │
│ PUT /clients/{clientId}                                     │
│ {                                                            │
│   "children_expected": "3",      ← Exact field name         │
│   "payment_method": "Medicaid"   ← Exact field name         │
│ }                                                            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ↓
        [Backend Processing]
                 │
                 ↓
┌────────────────────────────────────────────────────────────┐
│ RESPONSE (Expected):                                        │
│ {                                                            │
│   "success": true,                                          │
│   "client": {                                               │
│     "id": "...",                                            │
│     "children_expected": "3",     ← Should be in response   │
│     "payment_method": "Medicaid", ← Should be in response   │
│     ... all other 54+ fields                                │
│   }                                                          │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
```

---

### **7. Current Issues**

#### **❌ Issue #1: `children_expected` Has No Input in Request Form**

**Problem**: The field is in the schema but not rendered in the UI.

**Impact**:
- Users cannot enter this value in the request form
- Value will be empty string or test data ("2")
- Admins can edit it in the modal, but new clients won't have it populated

**Recommendation**:
- **Option A**: Add an input field to Step1Personal.tsx
- **Option B**: Remove from schema if no longer needed
- **Option C**: Auto-calculate from `number_of_babies` or other fields

#### **✅ Issue #2: Backend Not Returning Fields**

**Problem**: Backend `GET /clients` and `PUT /clients/:id` responses don't include these fields.

**Evidence**:
```javascript
hasPreferredContactInUser: false  // ← Should be true
hasPreferredContactTopLevel: false
```

**Impact**:
- Fields save successfully to database ✅
- But disappear from UI after refresh ❌

**Status**: Backend team has been notified, fix in progress

---

### **8. Summary Table**

| Field | Schema Defined | Request Form Input | Modal Input | Sent to Backend | Backend Returns | Status |
|-------|---------------|-------------------|-------------|-----------------|-----------------|--------|
| `children_expected` | ✅ Yes | ❌ **MISSING** | ✅ Yes (text) | ✅ Yes (if changed) | ❌ No | **NEEDS UI INPUT** |
| `payment_method` | ✅ Yes | ✅ Yes (popover) | ✅ Yes (select) | ✅ Yes (if changed) | ❌ No | **NEEDS BACKEND FIX** |

---

### **9. Backend Requirements**

**What to tell backend team:**

1. **Field names are correct** - Frontend sends exact snake_case names:
   - `children_expected` ✅
   - `payment_method` ✅

2. **Both fields are being sent** in PUT requests when values change

3. **Backend must return these fields** in both:
   - `GET /clients` response (in `user` object or top-level)
   - `PUT /clients/:id` response (in `client` object)

4. **Database table check**:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'client_info' 
   AND column_name IN ('children_expected', 'payment_method');
   ```
   
   Both should exist in the database table. If they do, they need to be included in the SELECT queries.

---

### **10. Testing Instructions**

#### **Test `payment_method` (Works in UI):**
1. ✅ Fill request form → Step 9 → Select "Private Insurance"
2. ✅ Submit form
3. ✅ Admin opens client in modal
4. ⏳ Check if "Private Insurance" is selected (currently fails due to backend)
5. ✅ Change to "Medicaid" → Save
6. ⏳ Close and reopen modal → Should show "Medicaid" (currently fails)

#### **Test `children_expected` (Missing Input):**
1. ❌ Fill request form → **NO INPUT FIELD** to enter value
2. ⚠️ Field gets test value "2" from defaultValues
3. ✅ Admin opens client in modal → Can edit text input
4. ✅ Change to "3" → Save
5. ⏳ Close and reopen modal → Should show "3" (currently fails due to backend)

---

### **11. Recommended Frontend Fix**

Since `children_expected` has no input, either:

**Option A: Add the input field to Step1Personal.tsx**
```tsx
<div className={styles['form-field']}>
  <input
    className={styles['form-input']}
    {...form.register('children_expected')}
    id='children_expected'
    autoComplete='off'
    type='number'
    min='0'
  />
  <label htmlFor='children_expected' className={styles['form-floating-label']}>
    Number of children expected
  </label>
</div>
```

**Option B: Remove from schema**
```typescript
// Remove from useRequestForm.ts fullSchema
// Remove from stepFields array
// Remove from defaultValues
```

**Option C: Keep as hidden/calculated field**
```typescript
// Auto-populate based on number_of_babies
useEffect(() => {
  const babies = form.getValues('number_of_babies');
  if (babies) {
    const count = babyCountMap[babies] || 1;
    form.setValue('children_expected', count.toString());
  }
}, [form.watch('number_of_babies')]);
```

---

### **12. Code References**

#### **Request Form Files:**
```
src/features/request/
  ├── useRequestForm.ts           (Schema: lines 17, 109)
  ├── contexts/RequestFormContext.tsx  (Defaults: lines 63, 117)
  ├── Step1Personal.tsx           (children_expected: MISSING INPUT ❌)
  └── Step3Home.tsx               (payment_method: lines 1467-1571 ✅)
```

#### **Admin Modal Files:**
```
src/features/clients/components/dialog/
  └── LeadProfileModal.tsx
      ├── Initialization: lines 153, 170
      ├── Render: lines 606, 628
      └── Save: lines 254-356
```

#### **API Files:**
```
src/common/utils/
  └── updateClient.ts            (PUT request: lines 24-36)
```

---

### **13. Conclusion**

✅ **Field Names Match Backend**: Both `children_expected` and `payment_method` use exact snake_case names  
⚠️ **Missing UI Input**: `children_expected` has no input field in the request form  
✅ **Modal Works**: Both fields can be edited in the admin modal  
❌ **Backend Issue**: Fields don't persist after refresh (backend not returning them)

**Next Steps**:
1. ✅ Frontend sends correct field names (no changes needed)
2. ⏳ Backend needs to return these fields in responses
3. ⚠️ Decide whether to add `children_expected` input or remove the field



