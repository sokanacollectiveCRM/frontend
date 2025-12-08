-- ============================================
-- SQL Script to Check Notes Foreign Key Issue
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Check if notes table exists and its structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('notes', 'client_activities', 'activities')
ORDER BY table_name, ordinal_position;

-- 2. Check foreign key constraints on notes/activities table
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND (tc.table_name LIKE '%note%' OR tc.table_name LIKE '%activit%')
ORDER BY tc.table_name, kcu.column_name;

-- 3. Count notes per user (created_by) - Fixed for UUID types
-- Note: notes_to table doesn't have created_by, so excluded
SELECT 
    'notes' as table_name,
    created_by::uuid as user_id,
    COUNT(*) as note_count
FROM notes
WHERE created_by IS NOT NULL
GROUP BY created_by
UNION ALL
SELECT 
    'client_activities' as table_name,
    created_by::uuid as user_id,
    COUNT(*) as note_count
FROM client_activities
WHERE created_by IS NOT NULL
GROUP BY created_by
ORDER BY note_count DESC;

-- 4. Show all notes with user information - Fixed for UUID types
-- Note: notes table uses 'content' not 'description', and has 'work_log_id' not 'client_id'
SELECT 
    n.id as note_id,
    n.created_by,
    n.content,
    n.work_log_id,
    n.visibility,
    u.id as user_id,
    u.firstname || ' ' || u.lastname as user_name,
    u.email as user_email,
    u.role as user_role
FROM notes n
LEFT JOIN users u ON n.created_by::uuid = u.id
ORDER BY n.id DESC
LIMIT 50;

-- If the table is called 'client_activities' instead:
-- SELECT 
--     ca.id as note_id,
--     ca.created_by,
--     ca.description,
--     ca.timestamp,
--     ca.client_id,
--     u.id as user_id,
--     u.firstname || ' ' || u.lastname as user_name,
--     u.email as user_email,
--     u.role as user_role
-- FROM client_activities ca
-- LEFT JOIN users u ON ca.created_by = u.id::text
-- ORDER BY ca.timestamp DESC
-- LIMIT 50;

-- 5. Find users who have notes but are trying to be deleted - Fixed for UUID types
-- This shows which users have notes preventing deletion
-- Note: notes table doesn't have timestamp, so we can't show first/last note dates
SELECT 
    u.id,
    u.firstname || ' ' || u.lastname as user_name,
    u.email,
    u.role,
    COUNT(n.id) as total_notes
FROM users u
INNER JOIN notes n ON n.created_by::uuid = u.id
GROUP BY u.id, u.firstname, u.lastname, u.email, u.role
ORDER BY total_notes DESC;

-- If using 'client_activities' table:
-- SELECT 
--     u.id,
--     u.firstname || ' ' || u.lastname as user_name,
--     u.email,
--     u.role,
--     COUNT(ca.id) as total_notes,
--     MIN(ca.timestamp) as first_note,
--     MAX(ca.timestamp) as last_note
-- FROM users u
-- INNER JOIN client_activities ca ON ca.created_by = u.id::text
-- GROUP BY u.id, u.firstname, u.lastname, u.email, u.role
-- ORDER BY total_notes DESC;

-- 6. Check for orphaned notes (notes with created_by that doesn't exist in users) - Fixed for UUID
-- Note: notes table uses 'content' not 'description'
SELECT 
    n.id as note_id,
    n.created_by,
    n.content,
    n.work_log_id,
    n.visibility
FROM notes n
LEFT JOIN users u ON n.created_by::uuid = u.id
WHERE u.id IS NULL
ORDER BY n.id DESC;

-- 7. Show specific user's notes (replace 'USER_ID_HERE' with actual UUID) - Fixed for UUID
-- This helps identify which notes belong to a specific doula
-- Note: notes table uses 'content' not 'description', and has 'work_log_id' not 'client_id'
SELECT 
    n.id as note_id,
    n.content,
    n.created_by,
    n.work_log_id,
    n.visibility
FROM notes n
WHERE n.created_by::uuid = 'USER_ID_HERE'::uuid  -- Replace with actual UUID
ORDER BY n.id DESC;

-- 8. Summary: Users with notes count (for team members) - Fixed for UUID types
-- Note: notes_to table doesn't have created_by, so excluded
SELECT 
    u.id,
    u.firstname || ' ' || u.lastname as name,
    u.email,
    u.role,
    COALESCE(notes_count.count, 0) + COALESCE(activities_count.count, 0) as total_notes,
    CASE 
        WHEN (COALESCE(notes_count.count, 0) + COALESCE(activities_count.count, 0)) > 0 
        THEN 'CANNOT DELETE - Has notes'
        ELSE 'CAN DELETE - No notes'
    END as deletion_status
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
GROUP BY u.id, u.firstname, u.lastname, u.email, u.role, notes_count.count, activities_count.count
ORDER BY total_notes DESC, u.role, u.lastname;

-- 9. Check the exact foreign key constraint that's causing the issue
SELECT
    conname as constraint_name,
    conrelid::regclass as table_name,
    confrelid::regclass as referenced_table,
    a.attname as column_name,
    af.attname as referenced_column
FROM pg_constraint c
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
JOIN pg_attribute af ON af.attrelid = c.confrelid AND af.attnum = ANY(c.confkey)
WHERE conname LIKE '%note%' OR conname LIKE '%fkey%'
ORDER BY conname;

-- 10. Quick check: List all team members and their note counts - Fixed for UUID types
-- Note: notes_to table doesn't have created_by, so excluded
SELECT 
    u.id,
    u.firstname,
    u.lastname,
    u.email,
    u.role,
    COALESCE(notes_count.count, 0) as notes_count,
    COALESCE(activities_count.count, 0) as activities_count,
    (COALESCE(notes_count.count, 0) + COALESCE(activities_count.count, 0)) as total_notes_created
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
ORDER BY total_notes_created DESC, u.role, u.lastname;

