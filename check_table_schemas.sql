-- ============================================
-- Check Schema of Notes Tables
-- Run this first to see what columns exist
-- ============================================

-- Check columns in 'notes' table
SELECT 
    'notes' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'notes'
ORDER BY ordinal_position;

-- Check columns in 'client_activities' table
SELECT 
    'client_activities' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'client_activities'
ORDER BY ordinal_position;

-- Check columns in 'notes_to' table
SELECT 
    'notes_to' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'notes_to'
ORDER BY ordinal_position;

