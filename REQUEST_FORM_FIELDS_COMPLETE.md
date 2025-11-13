# Request Form Fields - Complete Database Schema

This document lists ALL fields that are submitted from the request form to the backend database.

## 📊 Summary
- **Total Fields**: 56 user-submitted fields
- **Required Fields**: 20 fields
- **Optional Fields**: 36 fields
- **Array Fields**: 2 fields
- **Boolean Fields**: 1 field
- **Number Fields**: 3 fields
- **Date Fields**: 1 field

---

## 1️⃣ Personal/Contact Information (9 fields)

| Field Name | Type | Required | Options/Format | Example |
|------------|------|----------|----------------|---------|
| `firstname` | string | ✅ Yes | - | "Sarah" |
| `lastname` | string | ✅ Yes | - | "Johnson" |
| `email` | string | ✅ Yes | Valid email | "sarah.johnson@test.com" |
| `phone_number` | string | ✅ Yes | Phone format | "312-555-0123" |
| `pronouns` | string | ✅ Yes | She/Her, He/Him, They/Them, Ze/Hir/Zir, None, Other | "She/Her" |
| `pronouns_other` | string | ⚪ Optional | Free text (required if pronouns = "Other") | "Xe/Xem" |
| `preferred_contact_method` | string | ✅ Yes | Phone, Email | "Email" |
| `preferred_name` | string | ⚪ Optional | - | "Sarah J." |
| `children_expected` | string | ⚪ Optional | - | "2" |

---

## 2️⃣ Home Details (7 fields)

| Field Name | Type | Required | Options/Format | Example |
|------------|------|----------|----------------|---------|
| `address` | string | ✅ Yes | - | "456 Oak Avenue, Apt 3B" |
| `city` | string | ✅ Yes | - | "Chicago" |
| `state` | string | ✅ Yes | 2-letter state code | "IL" |
| `zip_code` | string | ✅ Yes | 5-digit zip | "60614" |
| `home_phone` | string | ⚪ Optional | Phone format | "773-555-0199" |
| `home_type` | string | ⚪ Optional | House, Condo, Apartment, Shelter, Other | "Apartment" |
| `home_access` | string | ⚪ Optional | - | "Buzz apartment 3B" |
| `pets` | string | ⚪ Optional | - | "Two cats (Luna and Oliver)" |

---

## 3️⃣ Family Members (8 fields)

| Field Name | Type | Required | Options/Format | Example |
|------------|------|----------|----------------|---------|
| `relationship_status` | string | ⚪ Optional | Spouse, Partner, Friend, Parent, Sibling, Other | "Partner" |
| `first_name` | string | ⚪ Optional | Family member's first name | "Michael" |
| `last_name` | string | ⚪ Optional | Family member's last name | "Johnson" |
| `middle_name` | string | ⚪ Optional | Family member's middle name | "James" |
| `family_email` | string | ⚪ Optional | Valid email | "mike.johnson@test.com" |
| `mobile_phone` | string | ⚪ Optional | Family member's mobile | "312-555-0456" |
| `work_phone` | string | ⚪ Optional | Family member's work phone | "312-555-0789" |
| `family_pronouns` | string | ⚪ Optional | She/Her, He/Him, They/Them, Ze/Hir/Zir, None | "He/Him" |

---

## 4️⃣ Referral (3 fields)

| Field Name | Type | Required | Options/Format | Example |
|------------|------|----------|----------------|---------|
| `referral_source` | string | ✅ Yes | Google, Doula Match, Former client, Sokana Member, Social Media, Email Blast | "Former client" |
| `referral_name` | string | ⚪ Optional | - | "Jennifer Smith" |
| `referral_email` | string | ⚪ Optional | Valid email | "jennifer.smith@example.com" |

---

## 5️⃣ Health History (3 fields)

| Field Name | Type | Required | Options/Format | Example |
|------------|------|----------|----------------|---------|
| `health_history` | string | ⚪ Optional | Textarea | "History of high blood pressure..." |
| `allergies` | string | ⚪ Optional | - | "Peanuts, shellfish, latex" |
| `health_notes` | string | ⚪ Optional | Textarea | "Gestational diabetes (diet-controlled)..." |

---

## 6️⃣ Pregnancy & Baby (8 fields)

| Field Name | Type | Required | Options/Format | Example |
|------------|------|----------|----------------|---------|
| `due_date` | string | ✅ Yes | YYYY-MM-DD | "2025-08-20" |
| `birth_location` | string | ✅ Yes | Hospital, Birth Center, Home Birth, Undecided | "Hospital" |
| `birth_hospital` | string | ✅ Yes | Hospital or birth center name | "Rush University Medical Center" |
| `number_of_babies` | string | ✅ Yes | Singleton, Twins, Triplets, Quadruplets (or 1, 2, 3, 4+) | "Singleton" |
| `baby_name` | string | ⚪ Optional | - | "Emma (if girl), Ethan (if boy)" |
| `provider_type` | string | ✅ Yes | OB/GYN, Midwife, Family Doctor, Undecided | "OB/GYN" |
| `pregnancy_number` | number | ✅ Yes | Integer >= 1 | 2 |
| `hospital` | string | ⚪ Optional | Legacy field (may duplicate birth_hospital) | "Rush University Medical Center" |

---

## 7️⃣ Past Pregnancies (4 fields)

| Field Name | Type | Required | Options/Format | Example |
|------------|------|----------|----------------|---------|
| `had_previous_pregnancies` | boolean | ⚪ Optional | true/false | true |
| `previous_pregnancies_count` | number | ⚪ Optional | Integer >= 0 | 1 |
| `living_children_count` | number | ⚪ Optional | Integer >= 0 | 1 |
| `past_pregnancy_experience` | string | ⚪ Optional | Textarea | "First pregnancy resulted in healthy baby..." |

---

## 8️⃣ Services Interested (3 fields)

| Field Name | Type | Required | Options/Format | Example |
|------------|------|----------|----------------|---------|
| `services_interested` | array | ✅ Yes | Array of: Labor Support, Postpartum Support, 1st Night Care, Lactation Support, Perinatal Education, Abortion Support, Other | ["Labor Support", "Postpartum Support"] |
| `service_support_details` | string | ✅ Yes | Textarea | "Looking for overnight postpartum support..." |
| `service_needed` | string | ✅ Yes | Textarea | "Comprehensive support package..." |

---

## 9️⃣ Payment (3 fields)

| Field Name | Type | Required | Options/Format | Example |
|------------|------|----------|----------------|---------|
| `payment_method` | string | ✅ Yes | Self-Pay, Private Insurance, Medicaid, Other | "Private Insurance" |
| `annual_income` | string | ⚪ Optional | Free text or range | "$75k-$100k" |
| `service_specifics` | string | ⚪ Optional | - | "Insurance covers 80% of doula services..." |

---

## 🔟 Client Demographics - ALL OPTIONAL (6 fields)

| Field Name | Type | Required | Options/Format | Example |
|------------|------|----------|----------------|---------|
| `race_ethnicity` | string | ⚪ Optional | Black/African American, White/Caucasian, Hispanic/Latino, Asian, Native American, Pacific Islander, Mixed Race, Other, Prefer not to say | "Black/African American" |
| `primary_language` | string | ⚪ Optional | English, Spanish, French, Mandarin, Arabic, Other | "English" |
| `client_age_range` | string | ⚪ Optional | Under 18, 18-24, 25-34, 35-44, 45+ | "25-34" |
| `insurance` | string | ⚪ Optional | Private, Medicaid, Medicare, None, Other | "Private" |
| `demographics_multi` | array | ⚪ Optional | Array of: First-time parent, Single parent, LGBTQ+ family, Military family, Teen parent, Adoptive parent, Foster parent, Immigrant/refugee, Low income, Experiencing homelessness, Disability, Other | ["LGBTQ+ family", "Low income"] |
| `demographics_annual_income` | string | ⚪ Optional | Under $25k, $25k-$50k, $50k-$75k, $75k-$100k, Over $100k, Prefer not to say | "$50k-$75k" |

---

## 🔧 System Fields (Auto-generated by Backend)

| Field Name | Type | Required | Notes |
|------------|------|----------|-------|
| `id` | UUID | Auto | Primary key |
| `created_at` | timestamp | Auto | Record creation time |
| `updated_at` | timestamp | Auto | Last update time |
| `status` | string | Auto | Default: "lead". Options: lead, contacted, qualified, complete |
| `role` | string | Auto | Default: "client" |

---

## 📋 Field Type Summary

### **String Fields (47)**
All personal info, home details, family, referral, health, services, payment, and demographics text fields

### **Array Fields (2)**
- `services_interested` - array of strings
- `demographics_multi` - array of strings

### **Boolean Fields (1)**
- `had_previous_pregnancies` - true/false

### **Number Fields (3)**
- `pregnancy_number` - integer >= 1
- `previous_pregnancies_count` - integer >= 0
- `living_children_count` - integer >= 0

### **Date Fields (1)**
- `due_date` - string in YYYY-MM-DD format

---

## 🎯 Backend Requirements Checklist

### ✅ **`GET /clients` Endpoint Should Return:**
All 56 user-submitted fields PLUS system fields (id, created_at, updated_at, status, role)

**Current Issue**: Only returning 25 fields ❌  
**Expected**: Return ALL 61 fields ✅

### ✅ **`PUT /clients/:id` Endpoint Should:**

**Accept in Request Body:**
- Any combination of the 56 user-submitted fields
- Validate data types and constraints
- Handle optional fields (null/empty allowed)

**Return in Response:**
```json
{
  "success": true,
  "client": {
    // ALL 61 fields should be here
    "id": "uuid",
    "firstname": "Sarah",
    "lastname": "Johnson",
    "preferred_contact_method": "Email",
    "pronouns": "She/Her",
    "home_type": "Apartment",
    "services_interested": ["Labor Support", "Postpartum Support"],
    // ... all other 55 fields
    "created_at": "2025-01-13T...",
    "updated_at": "2025-01-13T...",
    "status": "lead",
    "role": "client"
  }
}
```

---

## 🧪 Test Payload (All Fields Populated)

```json
{
  "firstname": "Sarah",
  "lastname": "Johnson",
  "email": "sarah.johnson@test.com",
  "phone_number": "312-555-0123",
  "pronouns": "She/Her",
  "pronouns_other": "",
  "preferred_contact_method": "Email",
  "preferred_name": "Sarah J.",
  "children_expected": "2",
  "address": "456 Oak Avenue, Apt 3B",
  "city": "Chicago",
  "state": "IL",
  "zip_code": "60614",
  "home_phone": "773-555-0199",
  "home_type": "Apartment",
  "home_access": "Buzz apartment 3B at front door",
  "pets": "Two cats (Luna and Oliver)",
  "relationship_status": "Partner",
  "first_name": "Michael",
  "last_name": "Johnson",
  "middle_name": "James",
  "family_email": "mike.johnson@test.com",
  "mobile_phone": "312-555-0456",
  "work_phone": "312-555-0789",
  "family_pronouns": "He/Him",
  "referral_source": "Former client",
  "referral_name": "Jennifer Smith",
  "referral_email": "jennifer.smith@example.com",
  "health_history": "History of high blood pressure, well-controlled with medication",
  "allergies": "Peanuts, shellfish, latex",
  "health_notes": "Gestational diabetes (diet-controlled), low-risk for preeclampsia",
  "due_date": "2025-08-20",
  "birth_location": "Hospital",
  "birth_hospital": "Rush University Medical Center",
  "number_of_babies": "Singleton",
  "baby_name": "Emma (if girl), Ethan (if boy)",
  "provider_type": "OB/GYN",
  "pregnancy_number": 2,
  "hospital": "Rush University Medical Center",
  "had_previous_pregnancies": true,
  "previous_pregnancies_count": 1,
  "living_children_count": 1,
  "past_pregnancy_experience": "First pregnancy resulted in healthy baby girl via C-section at 39 weeks. Recovery was smooth, breastfed for 6 months.",
  "services_interested": ["Labor Support", "Postpartum Support", "Lactation Support"],
  "service_support_details": "Looking for overnight postpartum support 3 nights/week for first 6 weeks, plus labor support for VBAC delivery",
  "service_needed": "Comprehensive support package including labor coaching, postpartum care, and lactation consulting for high-risk VBAC pregnancy",
  "payment_method": "Private Insurance",
  "annual_income": "$75k-$100k",
  "service_specifics": "Insurance covers 80% of doula services, willing to pay remaining balance",
  "race_ethnicity": "Black/African American",
  "primary_language": "English",
  "client_age_range": "25-34",
  "insurance": "Private",
  "demographics_multi": ["First-time parent", "LGBTQ+ family", "Low income"],
  "demographics_annual_income": "$50k-$75k"
}
```

---

## 🔍 Currently Missing from Backend Response

Based on frontend debugging, the `GET /clients` endpoint is only returning **25 fields** instead of the required **61 fields**.

### **Fields Confirmed Missing:**
- `preferred_contact_method` ❌
- `preferred_name` ❌
- `pronouns` ❌ (might be there, needs verification)
- `pronouns_other` ❌
- `home_phone` ❌
- `home_type` ❌
- `home_access` ❌
- `pets` ❌
- `relationship_status` ❌
- `first_name` ❌ (family member)
- `last_name` ❌ (family member)
- `middle_name` ❌
- `family_email` ❌
- `mobile_phone` ❌
- `work_phone` ❌
- `family_pronouns` ❌
- `referral_name` ❌
- `referral_email` ❌
- `health_history` ❌
- `allergies` ❌
- `health_notes` ❌
- `birth_location` ❌
- `number_of_babies` ❌
- `baby_name` ❌
- `provider_type` ❌
- `pregnancy_number` ❌
- `hospital` ❌
- `had_previous_pregnancies` ❌
- `previous_pregnancies_count` ❌
- `living_children_count` ❌
- `past_pregnancy_experience` ❌
- `service_support_details` ❌
- `annual_income` ❌
- `service_specifics` ❌
- `race_ethnicity` ❌
- `primary_language` ❌
- `client_age_range` ❌
- `insurance` ❌
- `demographics_multi` ❌
- `demographics_annual_income` ❌

### **Fields Confirmed Working:**
- `id` ✅
- `firstname` ✅
- `lastname` ✅
- `email` ✅
- `phoneNumber` / `phone_number` ✅
- `status` ✅
- `serviceNeeded` / `service_needed` ✅
- `requestedAt` ✅
- `updatedAt` / `updated_at` ✅
- `created_at` ✅
- `role` ✅

---

## 💡 Backend Fix Required

### **Problem:**
The `GET /clients` endpoint is using a SELECT statement that only includes specific columns instead of ALL columns from the `client_info` table.

### **Solution:**
Update the query in `src/repositories/supabaseClientRepository.ts` to return ALL columns:

**Instead of:**
```sql
SELECT id, firstname, lastname, email, phone_number, status, service_needed, ...
FROM client_info
```

**Use:**
```sql
SELECT *
FROM client_info
```

Or if using Supabase client:
```typescript
// Before (limited fields)
const { data } = await supabase
  .from('client_info')
  .select('id, firstname, lastname, email, phone_number, status');

// After (all fields)
const { data } = await supabase
  .from('client_info')
  .select('*');
```

---

## 📝 Notes

1. **Field Name Consistency**: 
   - Frontend uses snake_case: `phone_number`, `service_needed`
   - Backend should accept and return snake_case
   - Some fields have camelCase aliases: `phoneNumber`, `serviceNeeded` (for backwards compatibility)

2. **Array Fields**:
   - `services_interested` - stored as JSON array in database
   - `demographics_multi` - stored as JSON array in database

3. **Date Fields**:
   - `due_date` - stored as DATE type, formatted as YYYY-MM-DD

4. **Number Fields**:
   - `pregnancy_number`, `previous_pregnancies_count`, `living_children_count` - stored as INTEGER

5. **Boolean Fields**:
   - `had_previous_pregnancies` - stored as BOOLEAN

---

## 🚀 Frontend Testing

Once backend is fixed, test by:
1. Submitting the request form with all dummy data
2. Opening the client in the admin dashboard modal
3. Verifying ALL 56 fields are displayed
4. Editing any field and saving
5. Closing and reopening the modal
6. Confirming the edited field persists

**Current Status**: Form has comprehensive dummy data populated ✅  
**Next Step**: Backend needs to return all fields in GET/PUT responses ⏳



