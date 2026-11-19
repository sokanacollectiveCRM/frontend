# Dashboard Demo Data

## Overview

The dashboard currently uses **dummy data** to demonstrate the UI and functionality to the client. This allows them to see how the dashboard will look and behave before the backend is fully implemented.

---

## What's Currently Using Dummy Data

### 1. **Dashboard Statistics** (`useDashboardStats.ts`)
- Total Doulas: **24**
- Total Clients: **156**
- Pending Contracts: **8**
- Overdue Notes: **3**
- Upcoming Tasks: **12**
- Monthly Revenue: **$45,600**

### 2. **Due Date Calendar** (`useDueDateCalendar.ts`)
- **8 sample pregnancy due dates** spread across the current month
- Includes dates in the past, present, and future
- Shows multiple events on the same day (day 12)
- Client names: Sarah Johnson, Maria Garcia, Emily Chen, Jessica Williams, Amanda Brown, Rachel Martinez, Lisa Anderson, Michelle Taylor

---

## How to Switch to Real Backend Data

When the backend APIs are ready, simply change the `USE_DUMMY_DATA` flag in each file:

### Step 1: Dashboard Stats
**File:** `src/common/hooks/dashboard/useDashboardStats.ts`

Change line 29:
```typescript
const USE_DUMMY_DATA = true; // Set to false when backend is ready
```

To:
```typescript
const USE_DUMMY_DATA = false; // Backend is ready!
```

### Step 2: Due Date Calendar
**File:** `src/common/hooks/dashboard/useDueDateCalendar.ts`

Change line 92:
```typescript
const USE_DUMMY_DATA = true; // Set to false when backend is ready
```

To:
```typescript
const USE_DUMMY_DATA = false; // Backend is ready!
```

### Step 3: Client Profile Popover
**File:** `src/features/dashboard-home/components/DueDatePopover.tsx`

Change line 116:
```typescript
const USE_DUMMY_DATA = true; // Set to false when backend is ready
```

To:
```typescript
const USE_DUMMY_DATA = false; // Backend is ready!
```

---

## Backend API Requirements

### 1. **GET /api/dashboard/stats**
Should return:
```json
{
  "totalDoulas": 24,
  "totalClients": 156,
  "pendingContracts": 8,
  "overdueNotes": 3,
  "upcomingTasks": 12,
  "monthlyRevenue": 45600
}
```

**Note:** Set `monthlyRevenue` to `null` to hide that card entirely.

### 2. **GET /api/dashboard/calendar**
Should return:
```json
{
  "events": [
    {
      "id": "uuid-123",
      "type": "pregnancyDueDate",
      "title": "EDD – Baby Due (Client Name)",
      "date": "2025-05-12",
      "color": "#34A853",
      "clientId": "client-456"
    }
  ]
}
```

**Required fields:**
- `id`: Unique identifier for the event
- `type`: Must be "pregnancyDueDate"
- `title`: Display text (format: "EDD – Baby Due (Client Name)")
- `date`: YYYY-MM-DD format
- `color`: Hex color (use #34A853 for green)
- `clientId`: (Optional) Used for "View Client Profile" navigation

---

## Benefits of This Approach

✅ **Client can see the UI immediately** without waiting for backend  
✅ **Easy to switch** to real data (just one flag per hook)  
✅ **No code duplication** - same components work for both dummy and real data  
✅ **Realistic loading states** - includes simulated API delays  
✅ **Production-ready** - real API code is already written and tested  

---

## Demo Features

The dummy data demonstrates:
- ✅ Today's date highlighted with a blue border
- ✅ Multiple events on the same day (12 days from now)
- ✅ Past due dates (5 days ago)
- ✅ Upcoming due dates spread throughout the month
- ✅ Green dot indicators on dates with events
- ✅ Clickable dates that open popovers
- ✅ Client information display in popover
- ✅ **"View Client Profile" button opens the full client modal** (same as in Clients tab)
- ✅ All 6 dashboard stat cards with proper color coding
- ✅ Loading skeleton states
- ✅ Responsive layout (3 columns for stats)

### Client Profile Modal Integration

When a user clicks "View Client Profile" in the due date popover:
1. **With Dummy Data:** Opens a fake client profile with realistic demo information
2. Opens the same **LeadProfileModal** used throughout the app
3. Shows complete client information with all collapsible sections:
   - Contact details (name, email, phone, address)
   - Services requested
   - Pregnancy information (due date, birth location, provider)
   - Demographics and payment details
4. Allows editing client data (changes won't persist with dummy data)
5. **500ms simulated loading delay** for realistic UX

### Dummy Client Profiles Included

The demo includes **3 detailed fake client profiles**:

1. **Sarah Johnson** (due today)
   - First pregnancy
   - Lives in Chicago apartment
   - Wants labor + postpartum + lactation support
   - Private insurance, hospital birth

2. **Maria Garcia** (due in 3 days)
   - Second pregnancy
   - Lives in Evanston house
   - Needs labor support + first night care
   - Medicaid, midwife care

3. **Emily Chen** (due in 7 days)
   - First pregnancy
   - Lives in Naperville house
   - Wants education + comprehensive support
   - Self-pay, birth center delivery

All other calendar events have minimal fallback data.

---

## Questions?

If you need to adjust the dummy data values, edit the constants:
- `DUMMY_STATS` in `useDashboardStats.ts`
- `DUMMY_EVENTS` in `useDueDateCalendar.ts`

