-- ============================================
-- Check Actual Structure of Notes Table
-- Run this to see what columns notes table has
-- ============================================

-- Check all columns in notes table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'notes'
ORDER BY ordinal_position;

-- Check all columns in client_activities table (for comparison)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'client_activities'
ORDER BY ordinal_position;

-- Sample query to see actual note structure
SELECT *
FROM notes
LIMIT 1;

