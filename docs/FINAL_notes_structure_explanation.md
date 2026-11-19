# Notes Table Structure Explanation

## Key Discovery

The `notes` table and `client_activities` table serve **different purposes**:

### `client_activities` Table
- **Purpose:** Client notes/activities (admin notes about clients)
- **Columns:**
  - `id`, `description`, `timestamp`, `client_id`, `created_by`
- **Used for:** Notes created in client profiles (LeadProfileModal)

### `notes` Table  
- **Purpose:** Work log notes (notes attached to hours worked)
- **Columns:**
  - `id`, `content`, `created_by`, `work_log_id`, `visibility`
- **Used for:** Notes created when doulas log hours (addWorkSession)

## Why This Matters

1. **Different data:** `notes` are tied to work logs, not clients
2. **Different columns:** `content` vs `description`, `work_log_id` vs `client_id`
3. **Both can block deletion:** Both tables have `created_by` foreign keys

## Updated Queries

All queries have been updated to:
- Use `content` instead of `description` for `notes` table
- Use `work_log_id` instead of `client_id` for `notes` table
- Remove timestamp references (notes table doesn't have timestamp)

## Summary

- **Jerry Bony:** Has 8 `client_activities` (client notes)
- **Emma Johnson:** Has 6 `notes` (work log notes)

Both are preventing deletion due to foreign key constraints.

