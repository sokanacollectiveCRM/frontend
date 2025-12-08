-- ============================================
-- QUICK CHECK: Notes Foreign Key Issue
-- Fixed for UUID types (notes_to table removed - doesn't have created_by)
-- ============================================

-- STEP 1: Check which users have notes (causing deletion issues)
-- This checks: notes and client_activities tables
-- Note: notes_to table doesn't have created_by column, so it's excluded

SELECT 
    u.id,
    u.firstname || ' ' || u.lastname as user_name,
    u.email,
    u.role,
    COALESCE(notes_count.count, 0) as notes_count,
    COALESCE(activities_count.count, 0) as activities_count,
    (COALESCE(notes_count.count, 0) + COALESCE(activities_count.count, 0)) as total_count
FROM users u
LEFT JOIN (
    SELECT created_by::uuid as user_id, COUNT(*) as count
    FROM notes
    WHERE created_by IS NOT NULL
    GROUP BY created_by
) notes_count ON notes_count.user_id = u.id
LEFT JOIN (
    SELECT created_by::uuid as user_id, COUNT(*) as count
    FROM client_activities
    WHERE created_by IS NOT NULL
    GROUP BY created_by
) activities_count ON activities_count.user_id = u.id
WHERE u.role IN ('doula', 'admin')
    AND (COALESCE(notes_count.count, 0) > 0 
         OR COALESCE(activities_count.count, 0) > 0)
ORDER BY total_count DESC;

-- STEP 2: Show sample notes for a specific user from 'notes' table
-- Replace 'USER_ID_HERE' with the UUID of the doula you're trying to delete
-- Example: '123e4567-e89b-12d3-a456-426614174000'
SELECT 
    n.id,
    n.description,
    n.timestamp,
    n.client_id,
    n.created_by
FROM notes n
WHERE n.created_by::uuid = 'USER_ID_HERE'::uuid
ORDER BY n.timestamp DESC
LIMIT 10;

-- STEP 3: Show sample activities for a specific user from 'client_activities' table
SELECT 
    ca.id,
    ca.description,
    ca.timestamp,
    ca.client_id,
    ca.created_by
FROM client_activities ca
WHERE ca.created_by::uuid = 'USER_ID_HERE'::uuid
ORDER BY ca.timestamp DESC
LIMIT 10;

-- STEP 4: Check notes_to table structure (if needed)
-- Note: notes_to table doesn't have created_by column
-- This query shows what columns it actually has
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'notes_to'
ORDER BY ordinal_position;

